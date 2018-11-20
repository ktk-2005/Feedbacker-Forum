import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const sqlite = sqlite3.verbose()

class SQLiteDatabase {
  constructor(dbFile) {
    this.databaseFile = path.resolve(__dirname, dbFile || '../../data/dev_db.sqlite')

<<<<<<< HEAD
<<<<<<< HEAD
    this.db = new sqlite.Database(this.databaseFile)
=======
    /* if (fs.existsSync(this.databaseFile)) {
      this.db = new sqlite.Database(this.databaseFile)
    } else {
      fs.closeSync(fs.openSync(this.databaseFile, 'w'))
      this.db = new sqlite.Database(this.databaseFile)
    } */
    // console.log(this.databaseFile)
    this.db = new sqlite.Database(this.databaseFile)
    // console.log(this.db)
    // console.log(this.db.all('SELECT * FROM comments'))
>>>>>>> Structured basic sqlite functionality
=======
    this.db = new sqlite.Database(this.databaseFile)
>>>>>>> Cleanup
    const migrationFile = path.resolve(__dirname, '../../data/migration.sql')
    const migration = fs.readFileSync(migrationFile).toString()
    this.db.run(migration, (err) =>  {
      if (err) {
        console.log(`migration failed ${err}`)
      }
    })
  }

  async run(...args) {
    return new Promise((resolve, reject) => {
      this.db.run(...args, (err, res) => {
        if (err) {
          console.error(`ERRR: ${err}`)
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  async query(...args) {
    return new Promise((resolve, reject) => {
      this.db.all(...args, (err, res) => {
        if (err) {
          console.error(`ERRR: ${err}`)
          reject(err)
        } else {
          console.log('SUCCESS')
          resolve(res)
        }
      })
    })
  }
}

export default SQLiteDatabase
