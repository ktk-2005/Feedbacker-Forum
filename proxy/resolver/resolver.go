package resolver

// -- Resolver
//
// This package is responsible for resolving subdomain names into container instances.
// Does database queries and caches the results for a while. The public API consists of
// two functions: `Initialize()` and `Resolve()`
//
// Usage:
//   err := resolver.Initialize(&resolver.Config{ ... })
//   container, err := resolver.Resolve(subdomain)

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hashicorp/golang-lru"
	_ "github.com/lib/pq"           // Database driver
	_ "github.com/mattn/go-sqlite3" // Database driver
	"log"
	"net/http"
	"net/url"
	"time"
)

// -- Public API

// Config contains database setup properties
type Config struct {
	DbDriver        string // < Database engine, eg. sqlite3 or Postgres
	DbConnectString string // < Driver specific connection string
}

// ErrUnauthorized is returned if an user is not authorized to a private container
var ErrUnauthorized = errors.New("User is not authorized")

// Container instance that can be proxied to.
// (used internally for invalid containers also)
type Container struct {
	Subdomain string   // < Subdomain the container is routed under
	TargetURL *url.URL // < URL of the running container instance
	Protected bool     // < Does the container reqiure authentication

	// Internal
	err       error      // < If not `nil`, then the container is not reachable
	expiry    time.Time  // < Cached data is valid until this time
	authCache *lru.Cache // < Cached authenticated users
}

// Initialize the resolver, must be called before Resolve()
func Initialize(config *Config) error {
	var err error
	db, err = sql.Open(config.DbDriver, config.DbConnectString)
	if err != nil {
		return err
	}

	if config.DbDriver == "sqlite3" {
		dbQueryString = "SELECT subdomain, url, blob FROM containers WHERE subdomain = ?"
		dbAuthString = "SELECT token FROM container_auth WHERE token = ?"
	} else if config.DbDriver == "postgres" {
		dbQueryString = "SELECT subdomain, url, blob FROM containers WHERE subdomain = $1"
		dbAuthString = "SELECT token FROM container_auth WHERE token = $1"
	} else {
		log.Fatalf("Unsupported database driver '%s'", config.DbDriver)
	}

	containerCache, err = lru.New(10000)
	if err != nil {
		return err
	}

	for i := 0; i < 10; i++ {
		go databaseWorker()
	}
	go resolveWorker()

	return nil
}

// Resolve a container for a given public `subdomain`. May result in a database lookup
// and take a while to return. `cookies` is used to authenticate the user if the
// containe ris protected. Returns `nil` if no matching container instance is
// found or the user is unauthenticated.
func Resolve(subdomain string, cookies []*http.Cookie) (*Container, error) {
	container := getCachedContainer(subdomain)

	if container == nil {
		response := make(chan *Container)
		resolveRequests <- resolveRequest{
			id:       subdomain,
			response: response,
		}
		container = <-response
	}

	if container.err != nil {
		return nil, container.err
	}

	err := authenticate(container, cookies)
	if err != nil {
		return nil, err
	}

	return container, nil
}

// -- Implementation

// Singleton value to use as map value for sets
type dummySetType struct{}

var dummySetValue = &dummySetType{}

// An in-flight container resolve request. The resolved container is written
// through response. Sort of like a "promise" of Container. Always returns a
// pointer to a container, but it may have `err != nil`
type resolveRequest struct {
	id       string            // < Request input
	response chan<- *Container // < Found container
}

type authRequest struct {
	authToken string      // < Authentication token
	response  chan<- bool // < List of authenticated users
}

// -- Container cache
// Containers are cached for some amount of time for more responsive user experience
// and less database load.

var containerCache *lru.Cache

// Try to find a container in the cache, returns `nil` if not present or
// if the cached data is outdated.
func getCachedContainer(id string) *Container {
	containerI, ok := containerCache.Get(id)
	if !ok {
		return nil
	}

	container := containerI.(*Container)
	if time.Now().Before(container.expiry) {
		return container
	}
	return nil
}

// -- Authentication

type persistBlob struct {
	Users map[string]string `json:"users"`
}

func authenticate(container *Container, cookies []*http.Cookie) error {

	// If the container is not protected authenticate always
	if !container.Protected {
		return nil
	}

	// Collect users to authenticate from cookies
	authTokens := make(map[string]bool)
	for _, cookie := range cookies {
		if cookie.Name != "FeedbackProxyAuth" {
			continue
		}

		token := cookie.Value
		if len(authTokens) < 1000 {
			authTokens[token] = true
		}
	}

	// Check if the user is in the auth cache
	for token := range authTokens {
		_, ok := container.authCache.Get(token)
		if ok {
			return nil
		}
	}

	response := make(chan bool)
	anyAuth := false

	// Authenticate the user hashes
	for token := range authTokens {
		databaseAuthRequests <- authRequest{
			authToken: token,
			response:  response,
		}

		ok := <-response
		if ok {
			log.Printf("Authenticated '%s' to '%s'", token, container.Subdomain)
			anyAuth = true
			container.authCache.Add(token, dummySetValue)
		}
	}

	if anyAuth {
		return nil
	}
	return ErrUnauthorized
}

// -- Database resolver

var db *sql.DB
var dbQueryString string
var dbAuthString string

// Pending requests to the database
var databaseRequests = make(chan resolveRequest)
var databaseAuthRequests = make(chan authRequest)

type containerBlob struct {
	Auth map[string]json.RawMessage `json:"auth"`
}

// Query the database and create a container instance
func fetchContainerFromDatabase(id string) (*Container, error) {
	row := db.QueryRow(dbQueryString, id)
	idString := ""
	urlString := ""
	var blobString sql.NullString
	err := row.Scan(&idString, &urlString, &blobString)
	if err != nil {
		return nil, err
	}

	if idString != id {
		// This should never happen but checking just in case
		return nil, fmt.Errorf("Database ID '%s' not match query '%s'", idString, id)
	}

	url, err := url.Parse(urlString)
	if err != nil {
		return nil, err
	}

	protected := false
	if blobString.Valid && blobString.String != "" {
		var blob containerBlob
		err = json.Unmarshal([]byte(blobString.String), &blob)
		if err == nil {
			if blob.Auth != nil && len(blob.Auth) > 0 {
				protected = true
			}
		} else {
			return nil, fmt.Errorf("Failed to parse container '%v' blob", id)
		}
	}

	cache, _ := lru.New(10000)
	container := &Container{
		Subdomain: id,
		TargetURL: url,
		Protected: protected,
		err:       nil,
		expiry:    time.Now().Add(30 * time.Minute),
		authCache: cache,
	}

	return container, nil
}

func authenticateUserFromDatabase(authToken string) error {
	row := db.QueryRow(dbAuthString, authToken)
	tokenString := ""
	err := row.Scan(&tokenString)
	if err != nil {
		return err
	} else if tokenString != authToken {
		return fmt.Errorf("Database token '%s' not match query '%s'", tokenString, authToken)
	} else {
		return nil
	}
}

// This function is spawned a fixed amount of times to serve database requests.
func databaseWorker() {
	for {
		select {

		case req := <-databaseRequests:
			container, err := fetchContainerFromDatabase(req.id)
			if err != nil {
				// If there was an error create an "error" container
				container = &Container{
					TargetURL: nil,
					Subdomain: req.id,

					err:    err,
					expiry: time.Now().Add(time.Minute),
				}
			}
			req.response <- container

		case authReq := <-databaseAuthRequests:
			err := authenticateUserFromDatabase(authReq.authToken)
			authReq.response <- (err == nil)

		}
	}
}

// -- Resolve pooler
// Resolve requests are serialized and pooled.

var resolveRequests = make(chan resolveRequest, 1024)

// Worker Goroutine that queries containers
func resolveWorker() {
	pending := make(map[string][]resolveRequest)
	databaseResponse := make(chan *Container)

	for {
		select {

		case request := <-resolveRequests:
			id := request.id
			container := getCachedContainer(id)
			if container != nil {
				// Cache had valid data, respond immediately
				request.response <- container
			} else {
				// Handle new incoming resolve request: If there are pending requests for the
				// same ID, join to wait. Otherwise fetch from database.
				reqs, found := pending[id]
				if found {
					pending[id] = append(reqs, request)
				} else {
					log.Printf("Resolving container '%v'", id)
					pending[id] = []resolveRequest{request}
					databaseRequests <- resolveRequest{
						id:       id,
						response: databaseResponse,
					}
				}
			}

		case container := <-databaseResponse:
			// Handle incoming database response: Insert into cache and resolve all
			// pending requests for the ID.
			id := container.Subdomain

			if container.err != nil {
				log.Printf("Failed to resolve container '%v': %v", id, container.err)
			} else {
				log.Printf("Resolved container '%v' -> %v", id, container.TargetURL.String())
			}

			containerCache.Add(id, container)

			reqs, found := pending[id]
			if found {
				for _, req := range reqs {
					req.response <- container
				}
			} else {
				log.Printf("Assertion error: No pending requests for DB query?")
			}
			delete(pending, id)

		}
	}
}
