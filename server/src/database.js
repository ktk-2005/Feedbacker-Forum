import SQLiteDatabase from './database/database-sqlite'

const db = new SQLiteDatabase()

export async function getAllComments() { return db.query('SELECT time, text, user, url FROM comments') }

export async function addComment(values = []) { return db.run('INSERT INTO comments VALUES ((?), (?), (?), (?), (?), (?))', values) }

