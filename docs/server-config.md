
# Server configuration

The API server loads configuration from a JSON file. Some values may be overridden by
environment variables. You can specify the configuration file to use with the `-c`/`--config` flags.

## Configuration JSON format

| Property | Type | Description |
| --- | --- | --- |
| `port` | `Integer` | Port to bind the API server to, overridden by env `APP_SERVER_PORT`. |
| `dev` | `Boolean` | If set to true the server runs in development mode serving also static content. |
