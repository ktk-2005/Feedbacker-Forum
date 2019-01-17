import SQLiteDatabase from './database/database-sqlite'
import PostgresDatabase from './database/database-postgres'
import { config } from './globals'

let db = null

export async function initializeDatabase() {
  if (config.databaseUrl === undefined) {
    db = new SQLiteDatabase(config.sqliteFilename)
    await db.initialize(config.useTestData)
  } else {
    db = await new PostgresDatabase(config.databaseUrl)
    await db.initialize(config.useTestData)
  }
}

export async function getComments() { return db.query('SELECT * FROM comments') }

export async function getQuestions() { return db.query('SELECT * FROM questions') }

export async function getReactions() { return db.query('SELECT * FROM reactions') }

export async function addReaction({
  id, emoji, userId, commentId,
}) { return db.run('INSERT INTO reactions(id, emoji, user_id, comment_id) VALUES (?, ?, ?, ?)', [id, emoji, userId, commentId]) }

export async function addComment({
  id, text, userId, threadId, blob,
}) { return db.run('INSERT INTO comments(id, text, user_id, thread_id, blob) VALUES (?, ?, ?, ?, ?)', [id, text, userId, threadId, blob]) }

export async function addQuestion({
  id, text, userId, threadId, blob,
}) { return db.run('INSERT INTO questions(id, text, user_id, thread_id, blob) VALUES (?, ?, ?, ?, ?)', [id, text, userId, threadId, blob]) }

export async function addThread({
  id, container, blob,
}) { return db.run('INSERT INTO threads(id, container_id, blob) VALUES (?, ?, ?)', [id, container, blob]) }

export async function getThreadComments(values = []) { return db.query('SELECT * FROM comments WHERE thread_id=?', values) }

export async function getCommentReactions(values = []) { return db.query('SELECT * FROM reactions WHERE comment_id=?', values) }

export async function addUser({ id, name, secret }) { return db.run('INSERT INTO users(id, name, secret) VALUES (?, ?, ?)', [id, name, secret]) }

export async function addContainer({
  id, subdomain, ip, userId, blob, port,
}) {
  const url = `http://${ip}:${port}`
  return db.run('INSERT INTO containers(id, subdomain, url, user_id, blob) VALUES (?, ?, ?, ? ,?)', [id, subdomain, url, userId, blob])
}

export async function listContainers() {
  return db.query('SELECT id, subdomain FROM containers')
}

export async function listContainersByUser(values = []) {
  return db.query('SELECT id, subdomain FROM containers WHERE user_id=?', values)
}

export async function removeContainer({
  id,
}) { return db.run('DELETE FROM containers WHERE id=?', [id]) }
