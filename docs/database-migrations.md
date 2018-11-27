# Database migrations

## Migrations

Migrations for the database are stored in [src/database/migrations](../server/src/database).
The migrations are .sql files with their migration number as the first two charachter of the file name.

| Migration |
| :---: |
| 01-setup.sql |
| 02-added-example-table.sql |

When the server is started it checks for new migrations in the folder and will run all new migrations in order and add them to a table in the database to remember them.

When no database is found the server will create a new database and run all available migrations.
