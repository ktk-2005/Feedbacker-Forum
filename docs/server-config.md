
# Server configuration

The API server loads configuration from a JSON file. Some values may be overridden by
environment variables. You can specify the configuration file to use with the `-c`/`--config` flags.

## Configuration JSON format

| Property | Env | Type | Description |
| --- | --- | --- | --- |
| `port` | `APP_SERVER_PORT` | `Integer` | Port to bind the API server to. |
| `dev` | | `Boolean` | If set to true the server runs in development mode serving also static content. |
| `useTestData` | `USE_TEST_DATA` | `Boolean` | Load test data to the database on startup. |
| `databaseUrl` | `DATABASE_URL` | `String` | Database url for PostgreSQL support. If not set, will use SQLite database instead. |
| `dockerUrl` | `DOCKER_HOST_URL` | `String` | Docker socket url. If not set, will try to use os-dependent default path. |
| `dockerWindows` | | `Boolean` | Set this to true if you're using Docker for Windows (Only Win10 Pro/Education). If you're using Docker Toolbox (other Windows versions), leave this to false. Default is false. |
| `runners` | | `List[Object]` | List of objects that describe the system-provided runners. For example `[{"name": "npm run start","tag": "node-runner"}]` |
| `imageMaxSize` | | `Integer` | Maximum size of images in bytes. |
