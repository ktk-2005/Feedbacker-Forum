import SQLiteDatabase from './database/database-sqlite'
import PostgresDatabase from './database/database-postgres'
import HttpError from './http-error'
import { config, args } from './globals'

let db = null

export async function initializeDatabase() {
  if (config.databaseUrl === undefined) {
    const filename = args.useMemoryDatabase ? ':memory:' : config.sqliteFilename
    db = new SQLiteDatabase(filename)
    await db.initialize(config.useTestData)
  } else {
    db = await new PostgresDatabase(config.databaseUrl)
    await db.initialize(config.useTestData)
  }
}

export async function getComments(container) {
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
    ON comments.id = reactions.comment_id
    INNER JOIN threads
    ON comments.thread_id = threads.id
    WHERE threads.container_id = ?
    `, [container])
}

export async function getQuestions(container) { return db.query('SELECT * FROM questions WHERE container_id = ? ORDER BY order_id ASC', [container]) }

export async function addQuestion({
  id, text, type, userId, container, blob, order
}) { return db.run('INSERT INTO questions(id, text, type, user_id, container_id, order_id, blob) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, text, type, userId, container, order, blob]) }

export async function editQuestion({
  id, text, type, blob
}) { return db.run('UPDATE questions SET text=?, type=?, blob=? WHERE id=? ', [text, type, blob, id]) }

export async function removeQuestion({ id })
{ return db.run('DELETE FROM questions WHERE id = ?', [id]) }

export async function getQuestionHighestOrder(container) {
  const row = await db.query('SELECT MAX(order_id) FROM questions WHERE container_id = ?', [container])
  return row[0]['MAX(order_id)'] || 0
}

export async function reorderQuestions(order) {
  const valid = id => id.match(/[a-zA-Z0-9]/)
  if (!order.every(valid)) throw new HttpError(400, 'Bad order format')

  const whenCases = order.map((id, ix) => `  WHEN "${id}" THEN ${ix}`).join('\n')
  const inExpr = order.map(id => `"${id}"`).join(', ')
  const query = `
UPDATE questions
SET order_id = CASE id
${whenCases}
ELSE 1000
END WHERE id IN (${inExpr})
`

  return db.run(query)
}


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

export async function addAnswer({
  id, userId, questionId, blob,
}) { return db.run('INSERT INTO answers(id, user_id, question_id, blob) VALUES (?, ?, ?, ?)', [id, userId, questionId, blob]) }

export async function addThread({
  id, container, blob,
}) { return db.run('INSERT INTO threads(id, container_id, blob) VALUES (?, ?, ?)', [id, container, blob]) }

export async function getThreadComments(values = []) { return db.query('SELECT * FROM comments WHERE thread_id=?', values) }

export async function getCommentReactions(values = []) { return db.query('SELECT * FROM reactions WHERE comment_id=?', values) }

export async function addUser({ id, name, secret }) { return db.run('INSERT INTO users(id, name, secret) VALUES (?, ?, ?)', [id, name, secret]) }

export async function addContainer({
  id, subdomain, userId, blob, url,
}) {
  return db.run('INSERT INTO containers(id, subdomain, url, user_id, blob) VALUES (?, ?, ?, ? ,?)', [id, subdomain, url, userId, blob])
}

export async function listContainers() {
  return db.query('SELECT id, subdomain FROM containers')
}

export async function resolveContainer(subdomain) {
  const rows = await db.query('SELECT id, user_id FROM containers WHERE subdomain=? LIMIT 1', [subdomain])
  if (!rows || rows.length === 0) throw new Error(`Invalid container ${subdomain}`)
  return {
    id: rows[0].id,
    userId: rows[0].user_id,
  }
}

export async function listContainersByUser(values = []) {
  return db.query('SELECT id, subdomain FROM containers WHERE user_id=?', values)
}

export async function removeContainer({
  id,
}) { return db.run('DELETE FROM containers WHERE id=?', [id]) }

export async function verifyUser(user, secret) {
  const rows = await db.query('SELECT * FROM users WHERE id=? AND secret=? LIMIT 1', [user, secret])
  if (!rows || rows.length === 0) {
    throw new Error('Authentication failure')
  }
}

