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
	ErrorScript string  // < Script to load on error (invalid container)
	AuthScript string   // < Script to load to authenticate
}

// Start serving the proxy
func StartServing(config *Config) error {
	errPort := config.ErrorPort
	proxyPort := config.ProxyPort

	doctypeInjectString = "<!DOCTYPE html>"
	doctypeInjectLength = len([]byte(doctypeInjectString))

	scriptInjectString = fmt.Sprintf("<script src=\"%s\"></script>", config.InjectScript)
	scriptInjectLength = len([]byte(scriptInjectString))

	var err error
	errorUrl, err = url.Parse(fmt.Sprintf("http://localhost:%d/error", errPort))
	if err != nil {
		return err
	}
	authUrl, err = url.Parse(fmt.Sprintf("http://localhost:%d/auth", errPort))
	if err != nil {
		return err
	}

	errorHtml = fmt.Sprintf(htmlTemplate, config.ErrorScript)
	authHtml = fmt.Sprintf(htmlTemplate, config.AuthScript)

	proxy := httputil.ReverseProxy{
		Director: redirectRequest,
		ModifyResponse: modifyResponse,
	}

	go func() {
		log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", errPort), &ErrorHandler{}))
	}()

	log.Printf("Serving proxy at %d", proxyPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", proxyPort), &proxy))
	return nil
}

// -- Implementation

// HTML template for error and auth sites
const htmlTemplate = `<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" >
  <title>Feedbacker Forum</title>
</head>

<body>
  <div id="root"></div>
  <script src="%s"></script>
  <!-- Dummy inject slot: </body> -->
</body>


</html>
`

// `scriptInjectString` is injected before `injectPositionRegex`
var doctypeRegex = regexp.MustCompile("(?i)<!doctype")
var injectPositionRegex = regexp.MustCompile("(?i)</body>")
var doctypeInjectString string
var doctypeInjectLength int
var scriptInjectString string
var scriptInjectLength int
var errorHtml string
var authHtml string

// Server that returns error responses
var errorUrl *url.URL
var authUrl *url.URL

func redirectRequest(req *http.Request) {
	var err error

	// Retrieve container name from subdomain
	host := req.Host
	tokenLen := strings.IndexByte(host, '.')

	if (tokenLen > 0) {
		token := host[0:tokenLen]

		// Try to find and redirect request
		var container *resolver.Container
		container, err = resolver.Resolve(token, req.Cookies())
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

	if err == resolver.UnauthorizedError {
		req.URL = authUrl
		req.Host = authUrl.Host
	} else {
		req.URL = errorUrl
		req.Host = errorUrl.Host
	}
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

	code := res.StatusCode
	if code >= 300 && code < 400 {
		isHtml = false
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
				bytes.NewReader([]byte(scriptInjectString)),
				bytes.NewReader([]byte(body[loc:])))

			length += scriptInjectLength
		} else {
			result = bytes.NewReader(bodyBytes)
		}

		// Insert <!DOCTYPE html> if necessary
		match = doctypeRegex.FindStringIndex(body)
		if match == nil {
			prefix := bytes.NewReader([]byte(doctypeInjectString))
			result = io.MultiReader(prefix, result)

			length += doctypeInjectLength
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
	w.Header().Set("Content-Type", "text/html")
	if r.URL.Path == "/auth" {
		io.WriteString(w, authHtml)
	} else {
		io.WriteString(w, errorHtml)
	}
}
