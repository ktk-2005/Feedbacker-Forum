import SQLiteDatabase from './database/database-sqlite'
import { config } from './globals'

let db = null

export async function initializeDatabase() {
  db = new SQLiteDatabase(config.sqliteFilename)
  await db.initialize(config.dev)
}

export async function getComments() { return db.query('SELECT * FROM comments') }

export async function getQuestions() { return db.query('SELECT * FROM questions') }

export async function getReactions() { return db.query('SELECT * FROM reactions') }

export async function addReaction(values = []) { return db.run('INSERT INTO reactions(id, emoji, user_id, comment_id) VALUES (?, ?, ?, ?)', values) }

export async function addComment(values = []) { return db.run('INSERT INTO comments(id, text, user_id, thread_id, blob) VALUES (?, ?, ?, ?, ?)', values) }

export async function addQuestion(values = []) { return db.run('INSERT INTO questions(id, text, user_id, thread_id, blob) VALUES (?, ?, ?, ?, ?)', values) }

export async function getThreadComments(values = []) { return db.query('SELECT * FROM comments WHERE thread_id=?', values) }

export async function getCommentReactions(values = []) { return db.query('SELECT * FROM reactions WHERE comment_id=?', values) }

export async function getUsers(values = []) { return db.query('SELECT * FROM users', values) }

export async function addUser(values = []) { return db.run('INSERT INTO users(id, name, secret) VALUES (?, ?, ?)', values) }