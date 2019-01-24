package server

// -- Server
//
// This package handles the incoming requests and redirects them to the appropriate
// containers. It is based on the standard `httputil.ReverseProxy` utility. This also
// handles injecting the script tag into served HTML files.

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"strings"
	"net/url"
	"net/http"
	"net/http/httputil"
	"regexp"
	"github.com/ktk-2005/Feedbacker-Forum/proxy/resolver"
)

// -- Public API

// Configuration
type Config struct {
	ProxyPort int       // < Port to bind the proxy to
	ErrorPort int       // < Internal port to use as error proxy target
	InjectScript string // < Script source to inject to html files
}

// Start serving the proxy
func StartServing(config *Config) error {
	errPort := config.ErrorPort
	proxyPort := config.ProxyPort

	htmlInjectString = fmt.Sprintf("<script src=\"%s\"></script>", config.InjectScript)
	htmlInjectLength = len([]byte(htmlInjectString))

	var err error
	errorUrl, err = url.Parse(fmt.Sprintf("http://localhost:%d", errPort))
	if err != nil {
		return err
	}

	proxy := httputil.ReverseProxy{
		Director: redirectRequest,
		ModifyResponse: modifyResponse,
	}

	log.Printf("Serving proxy at %d", proxyPort)
	go func() {
		log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", errPort), &ErrorHandler{}))
	}()
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", proxyPort), &proxy))
	return nil
}

// -- Implementation

// `htmlInjectString` is injected before `injectPositionRegex`
var injectPositionRegex = regexp.MustCompile("(?i)</body>")
var htmlInjectString string
var htmlInjectLength int

// Server that returns error responses
var errorUrl *url.URL

func redirectRequest(req *http.Request) {

	// Retrieve container name from subdomain
	host := req.Host
	tokenLen := strings.IndexByte(host, '.')

	if (tokenLen > 0) {
		token := host[0:tokenLen]

		// Try to find and redirect request
		container, err := resolver.Resolve(token)
		if err == nil {
			target := container.TargetUrl
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host

			accept := strings.ToLower(req.Header.Get("Accept"))
			if strings.Contains(accept, "text/html") {
				req.Header.Del("Accept-Encoding")
			}

			return
		}
	}

	req.URL = errorUrl
	req.Host = errorUrl.Host
}

func modifyResponse(res *http.Response) error {

	// Only modify responses with Content-Type: text/html
	isHtml := false

	contentType := strings.ToLower(res.Header.Get("Content-Type"))
	if strings.Contains(contentType, "text/html") {
		isHtml = true
	}

	req := res.Request
	if req != nil {
		accept := strings.ToLower(req.Header.Get("Accept"))
		if strings.Contains(accept, "text/html") {
			isHtml = true
		}
	}

	if !isHtml {
		return nil
	}

	// Read the whole body into memory
	bodyBytes, err := ioutil.ReadAll(res.Body)
	res.Body.Close()

	var result io.Reader
	var length int

	if err == nil {
		body := string(bodyBytes)
		length = len(bodyBytes)

		// Insert the injected script after <head>
		match := injectPositionRegex.FindStringIndex(body)
		if match != nil {
			loc := match[0]
			result = io.MultiReader(
				bytes.NewReader([]byte(body[:loc])),
				bytes.NewReader([]byte(htmlInjectString)),
				bytes.NewReader([]byte(body[loc:])))

			length += htmlInjectLength
		} else {
			result = bytes.NewReader(bodyBytes)
		}

	} else {
		bodyBytes := []byte("Failed to read body")
		result = bytes.NewReader(bodyBytes)
		length = len(bodyBytes)
	}

	res.Header.Set("Content-Length", fmt.Sprintf("%d", length))
	res.Body = ioutil.NopCloser(result)

	return nil
}

// -- Error Handler
// HTTP server that failed container requests are redirected to

type ErrorHandler struct { }
func (*ErrorHandler)ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(404)
	io.WriteString(w, "Unknown container")
}

