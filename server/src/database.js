<<<<<<< HEAD
import SQLiteDatabase from './database/database-sqlite'

const db = new SQLiteDatabase()

export async function getAllComments() { return db.query('SELECT time, text, user, url FROM comments') }

export async function addComment(values = []) { return db.run('INSERT INTO comments VALUES ((?), (?), (?), (?), (?), (?))', values) }

=======
import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

// import config from './default-config'

const sqlite = sqlite3.verbose()

export async function startDatabase(dbFile) {
  const databaseFile = path.resolve(__dirname, dbFile || '../data/dev_db.sqlite')

  if (fs.existsSync(databaseFile)) {
    return new sqlite.Database(databaseFile)
  }
  fs.closeSync(fs.openSync(databaseFile, 'w'))
  const database = new sqlite.Database(databaseFile)

  const migrationFile = path.resolve(__dirname, '../data/migration.sql')
  const migration = fs.readSync(migrationFile).toString()
  console.log(migration)
  database.run(migration, (err, res) => console.log('migration failed', err, res))
  return database
}

function run(db, ...args) {
  return new Promise((resolve, reject) => {
    db.run(...args, (err, res) => {
      if (err) {
        console.error(`err: ${err}`)
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

function query(db, ...args) {
  return new Promise((resolve, reject) => {
    db.all(...args, (err, res) => {
      if (err) {
        console.error(`err: ${err}`)
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

export function getAllComments(db) { query(db, 'SELECT commentText, name FROM comments') }

export function addComment(db, values = []) { run(db, 'INSERT INTO comments VALUES ((?), (?), (?))', values) }
>>>>>>> Added basic function for database communication
