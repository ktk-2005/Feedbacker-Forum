# Container Proxy

The container proxy redirects Feedbacker subdomain requests into
their respective containers. It is also responsible for injecting
the `embed.js` script tag that contains our feedback tool.
The proxy is located in the `proxy/` directory in the repository
root.

## Setting up

The proxy is implemented using [Go][go], more specifically it requires
Go 1.11 as it uses versioned modules. This means we don't need to mess
with `$GOPATH` to build it.

To build the proxy first install Go and just run:

```bash
cd proxy
go build
```

Now you should be able to run the proxy using `./proxy` (or `proxy.exe`
on Windows). You can also start up the proxy with the server by running
`npm run watch:proxy` in the server directory.

## Configuration

The proxy needs to connect to a database to fetch the running container
instances. It supports both Sqlite3 and Postgres database drivers.
The default configuration works with the development server using
an Sqlite3 database `server/dev_db.sqlite`.

Configuration is done using environment variables:

| Name | Default | Description |
| ---- | ------- | ----------- |
| `FFGP_DB_DRIVER` | `sqlite3` | Database driver: `sqlite3` or `postgres` |
| `FFGP_DB_CONNECT`| `server/db.sqlite` | Database connect string or filename |
| `FFGP_PROXY_PORT` | `8086` | Port the proxy is served at |
| `FFGP_ERROR_PORT` | `8087` | Port the error site is served at |
| `FFGP_INJECT_SCRIPT` | `http://localhost:8080/embed.js` | Source of the injected script element |
| `FFGP_ERROR_SCRIPT` | `https://feedbacker.site/proxy-error.js` | Source of error script |
| `FFGP_AUTH_SCRIPT` | `https://feedbacker.site/proxy-auth.js` | Source of authorization script |

## Injection details

In addition to proxying requests to their corresponding containers the proxy also performs
a series of injections to HTML files. The injections are only performed if either the `Accept`
or `Content-Type` headers contain the string `text/html`. For potentially injected requests
the `Accept-Encoding` header is deleted and the request is forced to be uncompressed.

### Feedbacker Script

The most important injection is our feedback tool `embed.js` script. It is injected to every
HTML response regardless of its contents. The script is injected before the closing `</body>`
tag.

### HTML Doctype

Our styles break if there is no `<!DOCTYPE>` tag in the page on some browsers. If the HTML file
does not contain the case insensitive substring `<!doctype` the default HTML5 doctype
`<!DOCTYPE html>` is injected to the beginning of the HTML file.

### Meta viewport tag

Our responsive CSS breaks if there is no `<meta name="viewport">` tag in `<head>`. The HTML
file is loosely scanned for a viewport meta tag, since having false positives is better than
inserting two competing viewport tags. If absent a relatively harmless
`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">`
tag is inserted before the closing `</head>` tag. If the whole
head is missing an almost empty `<head>` pair is inserted containing the viewport tag before `<body>` if found.

[go]: https://golang.org/

