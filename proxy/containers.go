package main

import (
	"net/url"
	"time"
	"log"
	"sync"
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
)

type Container struct {
	Error  error
	Url    *url.URL
	Id     string
	Expiry time.Time
}

type resolveRequest struct {
	id string
	response chan<- *Container
}

var containerCache = make(map[string]*Container)
var cacheMutex sync.RWMutex

var resolveRequests = make(chan resolveRequest, 1024)

var databaseRequests = make(chan resolveRequest)
var db *sql.DB

// Collect N outstanding resolve requests over time
func collectRequests(maxRequests int, maxTime time.Duration) []resolveRequest {
	var requests []resolveRequest
	timer := time.NewTimer(maxTime)

	for i := 0; i < maxRequests; i++ {
		select {
		case req := <-resolveRequests:
			requests = append(requests, req)
		case _ = <-timer.C:
			return requests
		}
	}

	return requests
}

func createContainer(id string, row *sql.Row) (*Container, error) {
	idString := ""
	urlString := ""
	err := row.Scan(&idString, &urlString)
	if err != nil {
		return nil, err
	}

	if idString != id {
		return nil, fmt.Errorf("Database ID '%s' not match query '%s'", idString, id)
	}

	url, err := url.Parse(urlString)
	if err != nil {
		return nil, err
	}

	container := &Container{
		Error: nil,
		Url: url,
		Id: id,
		Expiry: time.Now().Add(30 * time.Minute),
	}

	return container, nil
}

func databaseWorker() {
	for req := range databaseRequests {
		row := db.QueryRow("SELECT subdomain, url FROM containers WHERE subdomain = ?", req.id)
		var container *Container = nil
		container, err := createContainer(req.id, row)
		if err != nil {
			container = &Container{
				Error:  err,
				Url:    nil,
				Id:     req.id,
				Expiry: time.Now().Add(time.Minute),
			}
		}
		req.response <- container
	}
}

// Worker Goroutine that queries containers
func resolveWorker() {
	for {
		requests := collectRequests(1024, time.Second * 2)
		if len(requests) <= 0 {
			continue
		}

		log.Printf("Processing %d requests", len(requests))

		requestsByContainer := make(map[string][]resolveRequest)
		for _, req := range requests {
			reqs := requestsByContainer[req.id]
			requestsByContainer[req.id] = append(reqs, req)
		}

		for id, reqs := range requestsByContainer {

			log.Printf("Resolving container '%v'", id)

			cacheMutex.RLock()
			container, ok := containerCache[id]
			cacheMutex.RUnlock()

			if !(ok && time.Now().Before(container.Expiry)) {
				response := make(chan *Container)
				databaseRequests <- resolveRequest {
					id: id,
					response: response,
				}
				container = <-response
			}

			if container.Error != nil {
				log.Printf("Failed to resolve container '%v': %v", id, container.Error)
			} else {
				log.Printf("Resolved container '%v' -> %v", id, container.Url.String())
			}

			cacheMutex.Lock()
			containerCache[id] = container
			cacheMutex.Unlock()

			for _, req := range reqs {
				req.response <- container
			}
		}
	}
}

func InitializeContainers() error {
	var err error
	db, err = sql.Open(Config.DbDriver, Config.DbConnectString)
	if err != nil {
		return err
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
func ResolveContainer(id string) (*Container, error) {
	cacheMutex.RLock()
	container, ok := containerCache[id]
	cacheMutex.RUnlock()

	if !(ok && time.Now().Before(container.Expiry)) {
		response := make(chan *Container)
		resolveRequests <- resolveRequest {
			id: id,
			response: response,
		}
		container = <-response
	}

	if container.Error != nil {
		return nil, container.Error
	}

	return container, nil
}

