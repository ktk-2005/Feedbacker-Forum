import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const sqlite = sqlite3.verbose()

class SQLiteDatabase {
  constructor(dbFile) {
    this.databaseFile = path.resolve(__dirname, dbFile || './dev_db.sqlite')

    this.db = new sqlite.Database(this.databaseFile)
    const newestMigrationId = this.query('SELECT ROWID FROM migrations')
    newestMigrationId.then((ids) => {
      console.log(ids)
      const newestId = Math.max(ids.map(x => x.id))
      this.runMigrations(newestId)
    }).catch(() => {
      console.log('Could not load migrations, trying to add first migration')
      this.runMigrations(0)
    })
  }

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
