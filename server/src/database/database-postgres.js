import pgpromise from 'pg-promise'
import path from 'path'
import fs from 'fs'

const pgp = pgpromise({})

/*
Changes query strings from using ?, ?, ? for parameters to using $1, $2, $3
to be compatible with pg-promise's way of handling parameters
 */
function prepStatement(unprepared) {
  let str = unprepared
  let i = 1
  while (str.includes('?')) {
    str = str.replace('?', `$${i}`)
    i += 1
  }
  return str
}

function timeout(timeMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs)
  })
}

class PostgresDatabase {
  /*
  Connects to database and tries to run new migrations
   */
  constructor(connectionString) {
    this.db = pgp(connectionString)
  }

  async initialize(useTestData) {
    try {
      const newestMigrationId = await this.query('SELECT id FROM migrations ORDER BY id DESC LIMIT 1')
      const newestId = newestMigrationId[0].id
      console.log('Connected to PostgreSQL database at migration', newestId)
      await this.runMigrations(newestId)
    } catch (err) {
      console.log('Could not load migrations, trying to add first migration')
      await this.runMigrations(0)
      /*
      If useTestData is true, runs queries from test-data.sql to load data into the database
       */
      if (useTestData) {
        const sqlCommand = fs.readFileSync(path.resolve(__dirname, './test-data.sql')).toString()
        console.log('Loading test data from test-data.sql')
        try {
          await this.exec(sqlCommand)
        } catch (error) {
          console.error('Failed to load test data', error)
        }
      }
    }
  }

  /*
  Gets all migrations from the directory ./migrations/postgres/ and runs all migrations
  that are newer than the parameter newestId, then add them to migrations table in database
   */

  async runMigrations(newestId) {
    const migrations = fs.readdirSync(path.resolve(__dirname, './migrations/postgres'))
    migrations.sort()
    for (const file of migrations) {
      const migrNr = parseInt(file.slice(0, 3), 10)
      if (migrNr > newestId) {
        console.log(`Running migration ${file}`)
        const sqlCommand = fs.readFileSync(path.resolve(__dirname, `./migrations/postgres/${file}`))
          .toString()

        const runMigration = async () => {
          for (let attempt = 0; attempt < 5; attempt++) {
            try {
              if (attempt > 0) console.log(`Retrying migration ${file}`)
              await this.exec(sqlCommand)
              return true
            } catch (err) {
              console.error(`Failed to run migration ${file}`, err)
              await timeout(2000)
            }
          }
          return false
        }

        if (await runMigration()) {
          try {
            await this.run('INSERT INTO migrations(id, file) VALUES ($1, $2)', [migrNr, file])
          } catch (err) {
            console.error(`Failed to add ${file} to migrations table: ${err}`)
          }
        }
      }
    }
  }


  /*
  Runs an SQL query in the database. Does not return any value from the database,
  only use for updating or inserting data

  This only runs the first SQL query in the parameter string, to run many queries in the same
  call , use exec instead
   */

  run(str, values) {
    const preparedString = prepStatement(str)
    return this.db.none(preparedString, values)
  }
  /*
  Runs an SQL query in the database and returns the result as a promise.
  Use for querying from the database.
   */

  query(str, values) {
    const preparedString = prepStatement(str)
    return this.db.any(preparedString, values)
  }
  /*
  Runs all SQL queries in the parameter string. Can be used for running migrations
  from a file or other grouped statements in the same string.

  Note: Does not perform prepared statement '?' to '$1' replacement!
   */

  exec(str, values) {
    return this.db.multi(str, values)
  }
  /*
  For using delete statements. Returns the number of rows affected.
  Will return an empty array if DELETE was unsuccessful.
   */

  async del(str, values) {
    const preparedString = prepStatement(str)
    const res = await this.db.result(preparedString, values)
    return res.rowCount
  }
}


export default PostgresDatabase
