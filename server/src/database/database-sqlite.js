import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const sqlite = sqlite3.verbose()

class SQLiteDatabase {
  /*
  Connects to database and tries to run new migrations
   */
  constructor(dbFile) {
    this.databaseFile = path.resolve(__dirname, dbFile || './dev_db.sqlite')

    this.db = new sqlite.Database(this.databaseFile)
    const newestMigrationId = this.query('SELECT ROWID FROM migrations')
    newestMigrationId.then((ids) => {
      const newestId = Math.max(ids.map(x => x.id))
      this.runMigrations(newestId)
    }).catch(() => {
      console.log('Could not load migrations, trying to add first migration')
      this.runMigrations(0)
    })
  }
  /*
  Gets all migrations from the folder ./migrations and runs all migrations
  that are newer than the parameter newestID, then add them to migrations table in database
   */

  runMigrations(newestId) {
    const migrations = fs.readdirSync(path.resolve(__dirname, './migrations'))
    migrations.forEach((file) => {
      const migrNr = parseInt(file.slice(0, 2), 10)
      if (migrNr > newestId) {
        console.log(`Running migration ${file}`)
        const sqlCommand = fs.readFileSync(path.resolve(__dirname, `./migrations/${file}`)).toString()
        this.exec(sqlCommand).then(() => {
          this.run('INSERT INTO migrations VALUES ((?))', [file]).catch((err) => {
            console.error(`Failed to add ${file} to migrations table: ${err}`)
          })
        }, (err) => {
          if (err) {
            console.error(`Failed to run migration ${file}`, err)
          }
        })
      }
    })
  }
  /*
  Runs an SQL query in the database. Does not return any value from the database,
  only use for updating or inserting data

  This only runs the first SQL query in the parameter string, to run many queries in the same
  call , use exec instead
   */

  async run(...args) {
    return new Promise((resolve, reject) => {
      this.db.run(...args, (err) => {
        if (err) {
          console.error(`RUNERROR: ${err}`)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  /*
  Runs an SQL query in the database and returns the result as a promise.
  Use for querying from the database.
   */

  async query(...args) {
    return new Promise((resolve, reject) => {
      this.db.all(...args, (err, res) => {
        if (err) {
          console.error(`QUERYERROR: ${err}`)
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
  /*
  Runs all SQL queries in the parameter string. Can be used for running migrations
  from a file or other grouped statements in the same string
   */

  async exec(...args) {
    return new Promise((resolve, reject) => {
      this.db.exec(...args, (err) => {
        if (err) {
          console.error(`EXECERROR: ${err}`)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}

export default SQLiteDatabase
