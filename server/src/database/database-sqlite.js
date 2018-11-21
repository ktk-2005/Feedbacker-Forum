import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const sqlite = sqlite3.verbose()

class SQLiteDatabase {
  constructor(dbFile) {
    this.databaseFile = path.resolve(__dirname, dbFile || './dev_db.sqlite')

<<<<<<< HEAD
<<<<<<< HEAD
    this.db = new sqlite.Database(this.databaseFile)
<<<<<<< HEAD
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
=======
    const newestMigrationId = this.query('SELECT id FROM migrations')
    newestMigrationId.then((ids) => {
      const newestId = Math.max(ids.map(x => x.id))
      const migrations = fs.readdirSync(path.resolve(__dirname, './migrations'))
      migrations.forEach((file) => {
        const migrNr = parseInt(file.slice(0, 2), 10)
        if (migrNr > newestId) {
          console.log(`Running migration ${file}`)
          const sqlCommand = fs.readFileSync(path.resolve(__dirname, `./migrations/${file}`)).toString()
          this.run(sqlCommand).then(() => {
            this.run('INSERT INTO migrations VALUES ((?), (?))', [migrNr, file]).catch(() => {
              console.error(`Failed to add ${file} to migrations table`)
            })
          }, (err) => {
            if (err) {
              console.error(`Failed to run migration ${file}`, err)
            }
          })
        }
      })
    }).catch((err) => {
      console.log(`Could not load migrations: ${err}`)
    })
    /* const migrationFile = path.resolve(__dirname, './migrations/migration-setup.sql')
>>>>>>> auto loading new migrations
    const migration = fs.readFileSync(migrationFile).toString()
    this.db.run(migration, (err) =>  {
      if (err) {
        console.log(`migration failed ${err}`)
      }
    }) */
  }

  async run(...args) {
    return new Promise((resolve, reject) => {
      this.db.run(...args, (err, res) => {
        if (err) {
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
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
}

export default SQLiteDatabase
