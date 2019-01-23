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
	"net/url"
	"time"
	"log"
	"sync"
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	_ "github.com/lib/pq"
)

// -- Public API

// Configuration
type Config struct {
	DbDriver string        // < Database engine, eg. sqlite3 or Postgres
	DbConnectString string // < Driver specific connection string
}

// Running container instance that can be proxied to.
// (used internally for invalid containers also)
type Container struct {
	Subdomain string   // < Subdomain the container is routed under
	TargetUrl *url.URL // < URL of the running container instance

	// Internal
	err    error     // < If not `nil`, then the container is not reachable
	expiry time.Time // < Cached data is valid until this time
}

// Initialize the resolver, must be called before Resolve()
func Initialize(config *Config) error {
	var err error
	db, err = sql.Open(config.DbDriver, config.DbConnectString)
	if err != nil {
		return err
	}

	if config.DbDriver == "sqlite3" {
		dbQueryString = "SELECT subdomain, url FROM containers WHERE subdomain = ?"
	} else if config.DbDriver == "postgres" {
		dbQueryString = "SELECT subdomain, url FROM containers WHERE subdomain = $1"
	} else {
		log.Fatalf("Unsupported database driver '%s'", config.DbDriver)
	}

	for i := 0; i < 10; i++ {
		go databaseWorker()
	}
	go resolveWorker()

	return nil
}

// Resolves a container for a given public ID. May result in a database lookup
// and take a while to return. Returns `nil` if no matching container instance
// is found.
func Resolve(id string) (*Container, error) {
	container := getCachedContainer(id)

	if container == nil {
		response := make(chan *Container)
		resolveRequests <- resolveRequest {
			id: id,
			response: response,
		}
		container = <-response
	}

	if container.err != nil {
		return nil, container.err
	}

	return container, nil
}

// -- Implementation

// An in-flight container resolve request. The resolved container is written
// through response. Sort of like a "promise" of Container. Always returns a
// pointer to a container, but it may have `err != nil`
type resolveRequest struct {
	id string                  // < Request input
	response chan<- *Container // < Found container
}

// -- Container cache
// Containers are cached for some amount of time for more responsive user experience
// and less database load.

var containerCache = make(map[string]*Container)
var cacheMutex sync.RWMutex

// Try to find a container in the cache, returns `nil` if not present or
// if the cached data is outdated.
func getCachedContainer(id string) *Container {
	cacheMutex.RLock()
	container, ok := containerCache[id]
	cacheMutex.RUnlock()

	if ok && time.Now().Before(container.expiry) {
		return container
	} else {
		return nil
	}
}

// -- Database resolver

var db *sql.DB
var dbQueryString string

// Pending requests to the database
var databaseRequests = make(chan resolveRequest)

// Query the database and create a container instance
func fetchContainerFromDatabase(id string) (*Container, error) {
	row := db.QueryRow(dbQueryString, id)
	idString := ""
	urlString := ""
	err := row.Scan(&idString, &urlString)
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

	container := &Container{
		Subdomain: id,
		TargetUrl: url,
		err: nil,
		expiry: time.Now().Add(30 * time.Minute),
	}

	return container, nil
}

// This function is spawned a fixed amount of times to serve database requests.
func databaseWorker() {
	for req := range databaseRequests {
		container, err := fetchContainerFromDatabase(req.id)
		if err != nil {
			// If there was an error create an "error" container
			container = &Container{
				TargetUrl: nil,
				Subdomain: req.id,

				err: err,
				expiry: time.Now().Add(time.Minute),
			}
		}
		req.response <- container
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
					pending[id] = []resolveRequest{ request }
					databaseRequests <- resolveRequest{
						id: id,
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
				log.Printf("Resolved container '%v' -> %v", id, container.TargetUrl.String())
			}

			cacheMutex.Lock()
			containerCache[id] = container
			cacheMutex.Unlock()

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

