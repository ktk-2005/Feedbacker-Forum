
# Server configuration

The API server loads configuration from a JSON file. Some values may be overridden by
environment variables. You can specify the configuration file to use with the `-c`/`--config` flags.

## Configuration JSON format

| Property | Env | Type | Description |
| --- | --- | --- | --- |
| `port` | `APP_SERVER_PORT` | `Integer` | Port to bind the API server to. |
| `dev` | | `Boolean` | If set to true the server runs in development mode. The express server will serve static content and **forward all errors to the frontend console**. |
| `useTestData` | `USE_TEST_DATA` | `Boolean` | Load test data to the database on startup. |
| `databaseUrl` | `DATABASE_URL` | `String` | Database url for PostgreSQL support. If not set, will use SQLite database instead. The url is parsed with [pg-connection-string](https://www.npmjs.com/package/pg-connection-string) |
| `dockerUrl` | `DOCKER_HOST_URL` | `String` | Docker socket url. If not set, will try to use os-dependent default path. |
| `dockerWindows` | | `Boolean` | Set this to true if you're using Docker for Windows (Only Win10 Pro/Education). If you're using Docker Toolbox (other Windows versions), leave this to false. Default is false. |
| `runners` | | `List[Object]` | List of objects that describe the system-provided runners. For example `[{"name": "npm run start","tag": "node-runner"}]` |
| `imageMaxSize` | | `Integer` | Maximum size of images in bytes. |
| `slack`| | `Object` | Object that has `String` elements for Slack app's
`clientId`, `clientSecret` and `webhookURL` (names of these should be defined as in here). `clientId`and `clientSecret` are for identifying Slack app on Slack. `webhookURL` is the webhook URL that allows Slack app to post on a specific Slack channel. |
