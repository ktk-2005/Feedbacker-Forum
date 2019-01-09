package main

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"strings"
	"net/url"
	"net/http"
	"net/http/httputil"
	"regexp"
)

var headRegex = regexp.MustCompile("(?i)<head>")

// Server that returns error responses
var errorUrl *url.URL

var htmlInjectString string
var htmlInjectLength int

func redirectRequest(req *http.Request) {

	// Retrieve container name from subdomain
	host := req.Host
	tokenLen := strings.IndexByte(host, '.')
	if (tokenLen > 0) {
		token := host[0:tokenLen]

		// Try to find and redirect request
		container, err := ResolveContainer(token)
		if err == nil {
			target := container.Url
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host
			return
		}
	}

	req.URL = errorUrl
	req.Host = errorUrl.Host
}

func modifyResponse(res *http.Response) error {
	contentTypes := res.Header["Content-Type"]
	if len(contentTypes) == 0 {
		return nil
	}
	if contentTypes[0] != "text/html" {
		return nil
	}

	bodyBytes, err := ioutil.ReadAll(res.Body)
	res.Body.Close()

	var result io.Reader
	var length int

	if err == nil {
		body := string(bodyBytes)
		length = len(bodyBytes)

		match := headRegex.FindStringIndex(body)
		if match != nil {
			loc := match[1]
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

type ErrorHandler struct { }

func (*ErrorHandler)ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(404)
	io.WriteString(w, "Unknown container")
}

func StartProxy() error {
	errPort := Config.ErrorPort
	proxyPort := Config.ProxyPort

	htmlInjectString = fmt.Sprintf("<script src=\"%s\"></script>", Config.InjectScript)
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

	go http.ListenAndServe(fmt.Sprintf(":%d", errPort), &ErrorHandler{})
	http.ListenAndServe(fmt.Sprintf(":%d", proxyPort), &proxy)
	return nil
}

