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

export async function getComments() {
  return db.query(`
    SELECT
    comments.id         AS comment_id,
    comments.time       AS comment_time,
    comments.text       AS comment_text,
    comments.user_id    AS comment_user_id,
    comments.thread_id  AS comment_thread_id,
    comments.blob       AS comment_blob,
    reactions.id        AS reaction_id,
    reactions.time      AS reaction_time,
    reactions.emoji     AS reaction_emoji,
    reactions.user_id   AS reaction_user_id,
    reactions.comment_id AS reaction_comment_id
    FROM comments
    LEFT JOIN reactions
    ON comments.id = reactions.comment_id`)
}

export async function getQuestions() { return db.query('SELECT * FROM questions') }

export async function getReactions() { return db.query('SELECT * FROM reactions') }

export async function addReaction({
  id, emoji, userId, commentId,
}) { return db.run('INSERT INTO reactions(id, emoji, user_id, comment_id) VALUES (?, ?, ?, ?)', [id, emoji, userId, commentId]) }

export async function deleteReaction({
  emoji, userId, commentId,
}) { return db.query('DELETE FROM reactions WHERE emoji=? AND user_id=? AND comment_id=?', [emoji, userId, commentId]) }

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

export async function verifyUser(user, secret) {
  const rows = await db.query('SELECT * FROM users WHERE id=? AND secret=? LIMIT 1', [user, secret])
  if (!rows || rows.length === 0) {
    throw new Error("Authentication failure")
  }
}

