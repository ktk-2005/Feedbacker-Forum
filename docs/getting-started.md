
# Getting started

## Repository structure

The repository contains multiple separate components.
The API server and web client are split into their own *npm* modules.
Dockerfiles for development and production are also provided.

Both the client and server are continuously tested using [Travis CI][travis].
The Travis configuration `.travis.yml` is shared and located at the root.
In the root there is a repo-wide `.editorconfig` file, set up [EditorConfig][editorconfig]
to keep the code style consistent (the linter should pick up most errors though).

## Client and server

All JavaScript is written in modern ES6 and compiled using [Babel][babel].
This allows using the same set of features both on the frontend and backend.
The code is linted using [ESLint][eslint] with the [Airbnb][gh-airbnb] style
guide with the exception of not using semicolons.
Both Babel `.babelrc` and ESLint `.eslintrc.json` configuration files are duplicated
in the *server/* and *client/* directories.

NPM scripts for development for server and client:

| Command | Description |
| --- | --- |
| `lint` | Verify code style, use `npm run lint -- --fix` to fix mistakes automatically |
|  `lint:sass` | Verify code style of sass files (*.scss), can also use npm run lint -- --fix |

Rarely manually needed NPM scripts for server and client:

| Command | Description |
| --- | --- |
| `lint:ci` | Lint like the CI does, checking the line ending format. This will likely fail on Windows as Git likes to check out `\r\n` line endings. |

### Client

The frontend code and assets are bundled with [Webpack][webpack].
You can find separated development and production configuration files
under *client/webpack-config/*. The configuration is relatively standard, JS modules
are compiled from *client/src/* with polyfills to support down to IE11. Static assets
are copied from *client/static/*.

NPM scripts for development for client:

| Command | Description |
| --- | --- |
| `build:dev` | Build the development version of the frontend |
| `watch` | Like `build:dev`, but automatically rebuild when code changes. **Note:** Consider using `npm run watch` in the *server/* directory instead to also run the development server. |

Rarely manually needed NPM scripts for client:

| Command | Description |
| --- | --- |
| `build` | Build the production version of the frontend. |

### Server

The server is run with `babel-node` starting at `setup.js`.
You can supply configuration `.json` file using the `-c` or `--config` command line flag.
See [docs/server-config.md](server-config.md) for reference about configuring the server.

NPM scripts for development for server:

| Command | Description |
| --- | --- |
| `start` | Start the server in development mode with default configuration. Hosts the API and static content at `localhost:8080` |
| `watch` | Like `start`, but also builds the **client** automatically when the code changes. |
| `test:api` | Run API tests. |

Rarely manually needed NPM scripts for server:

| Command | Description |
| --- | --- |
| `test:remoteapi` | Run automated API tests for an already running server at port 8080 or env `APP_SERVER_PORT`. |

## Docker

The *docker/* directory contains subdirectories for both development and production Docker setups.
They can be built using `docker-compose`. See [docs/docker.md](docker.md) for more details regarding the docker configuration.

There is also the `node-runner` image source for building and running arbitrary npm projects. It must built first (`cd docker/node-runner; docker build -t node-runner .`) if you want to use it. Users can also pull custom images from the Docker Hub to run their applications on by using instance runners (see API documentation) See [runners.md](./runners.md) for more complete information on runners.

### Development

The development setup has only one container running the dev server that can be run locally with `npm start`.
It could be used for development if you want to install Node, but currently the source directories
are not mapped to the host as it seems quite buggy (at least with Windows).

### Production

The production setup has three containers: `api` running the Node server in production mode,
`nginx` running [Nginx][nginx] as reverse proxy and serving static content, and `database`
running [PostgreSQL][postgres].

[travis]: https://travis-ci.org/
[babel]: https://babeljs.io/
[eslint]: https://eslint.org/
[gh-airbnb]: https://github.com/airbnb/javascript
[editorconfig]: https://editorconfig.org/
[webpack]: https://webpack.js.org/
[postgres]: https://www.postgresql.org/
[nginx]: https://www.nginx.com/
