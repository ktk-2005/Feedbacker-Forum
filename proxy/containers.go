import (
	"url"
	"time"
	"log"
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
var resolveRequests = make(chan[resolveRequest], 1024)

var databaseRequests = make(chan[resolveRequest])
var db *sql.DB

// Collect N outstanding resolve requests over time
func collectRequests(maxRequests int, maxTime time.Duration) {
	requests := make([]resolveRequest)
	timer := time.NewTimer(maxTime)

	for i := 0; i < maxRequests; i++ {
		select {
		case req := <-resolveRequests:
			requests = append(requests, req)
		case _ := <-timer:
			break
		}
	}

	return requests
}

func createContainer(id string, row *db.Row) (*Container, error) {
	urlString := ""
	err := row.Scan(&urlString)
	if err != nil {
		return nil, err
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
	for req <- databaseRequests {
		row, err := db.QueryRow("")
		var container *Container = nil
		if err == nil {
			container, err = createContainer(req.id, row)
		}
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
	requests := collectRequests(1024, time.Second * 2)
	requestsByContainer := make(map[string][]resolveRequest)
	for req := range requests {
		reqs, ok := requestsByContainer[req.id]
		if !ok {
			reqs = make([]resolveRequest)
		}
		requestsByContainer[req.id] = append(reqs, req)
	}

	for id, reqs := range requestsByContainer {
		container, ok := containerCache[id]
		if !(ok && time.Now() < container.Expiry) {
			response := make(chan *Container)
			databaseRequests <- resolveRequest {
				id: id,
				response: response,
			}
			container = <-response
		}

		if container.Error != nil {
			log.Printf("Failed to resolve container %v: %v", id, container.Error)
		} else {
			log.Printf("Resolved container %v -> %v", id, container.Url.String())
		}

		for req := range reqs {
			req.response <- container
		}
	}
}

func InitializeContainers(dbDriver string, connectString string) error {
	var err error
	db, err = sql.Open(dbDriver, connectString)
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
func ResolveContainer(id string) *Container {
	container, ok := containerCache[id]
	if ok && time.Now() < container.Expiry {
		if container.Error == nil {
			return container
		} else {
			return nil
		}
	} else {
		response := make(chan *Container)
		resolveRequests <- resolveRequest {
			id: id,
			response: response,
		}
		return <-response
	}
}

