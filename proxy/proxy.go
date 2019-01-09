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

type ByteReader struct {
	reader *bytes.Reader
}

func (br *ByteReader) Read(p []byte) (int, error) {
	return br.reader.Read(p)
}

func (*ByteReader) Close() error {
	return nil
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
	var result []byte
	if err == nil {
		body := string(bodyBytes)

		match := headRegex.FindStringIndex(body)
		if match != nil {
			loc := match[1]
			insert := "<style>body { background-color: salmon; }</style>"
			body = body[:loc] + insert + body[loc:]
		}

		result = []byte(body)
	} else {
		result = []byte("Failed to read body")
	}

	res.Header.Set("Content-Length", fmt.Sprintf("%d", len(result)))
	res.Body = &ByteReader{ bytes.NewReader(result) }

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

