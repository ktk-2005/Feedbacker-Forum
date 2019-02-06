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

[go]: https://golang.org/

