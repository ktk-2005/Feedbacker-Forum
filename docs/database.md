# Database

## Tables

### Users
| Column | Usage |
| --- | --- |
| id | Short random id for user |
| time | Timestamp from when user was created |
| name | Users own specified name |
| secret | Secret key for identification |
| blob | JSON blob for extra user data |

### Comments
| Column | Usage |
| --- | --- |
| id | Short random id for comment |
| time | Timestamp from when comment was created |
| text | Text content of comment |
| user\_id | Id of user who left the comment |
| thread\_id | Id of comment thread which this comment is part of |
| anonymous | Boolean value for if the comment is to be displayed as anonymous |
| blob | JSON blob for other data added to comment e.g. DOM tagging information or dev-label |

### Questions
| Column | Usage |
| --- | --- |
| id | Short random id for question |
| time | Timestamp from when question was created |
| text | The text of the actual question |
| user\_id | Id of user who created the question |
| thread\_id | Id of thread which this question is part of |
| blob | JSON blob for other data attached to question e.g. DOM tagging information |

### Reactions
| Column | Usage |
| --- | --- |
| id | Short random id for reaction |
| time | Timestamp from when reaction was created |
| emoji | The reaction emoji |
| user\_id | Id of user who left the reaction |
| comment\_id | Id of comment the reaction was left on |

### Threads
| Column | Usage |
| --- | --- |
| id | Short random id for thread |
| container\_id | Id of the container this thread is related to, where the comment should be shown |
| blob | JSON blob for other data related to thread |

### Containers
| Column | Usage |
| --- | --- |
| id | Short random id for the container |
| time | Timestamp from when container was created |
| subdomain | User friendly subdomain where the container is found under |
| url | Internal target URL of the running container instance |
| user\_id | User that has created or owns the container |
| origin | Either the source url to external site or the repo from where the code was pulled |
| blob | Misc blob data |

### Migrations
| Column | Usage |
| --- | --- |
| id | Number for the migration, specifies in which order migrations are run and if new ones should be run |
| file | The name of the file from where the migration was run |


## Migrations

Migrations for the database are stored in directories in  [src/database/migrations](../server/src/database/migrations), separate for SQLite and PostgreSQL.
The migrations are separate because SQLite does not support adding constrains in migrations.
The migrations are .sql files with their migration number as the first three charachter of the file name.

| Migration |
| :---: |
| 001-setup.sql |
| 002-added-example-table.sql |

When the server is started it checks for new migrations in the folder and will run all new migrations in order and add them to a table in the database to remember them.

When no database is found the server will create a new database and run all available migrations.

### Test data

Test data for development can be added to the file [test_data.sql](../server/src/database/test-data.sql), which is run as a migration everytime the database initialization is run if the enviroment variable USE_TEST_DATA is set.
