import pgpromise from 'pg-promise'
import path from 'path'
import fs from 'fs'

const pgp = pgpromise({})

function prepStatement(unprepped) {
  let str = unprepped
  let i = 1
  while (str.includes('?')) {
    str = str.replace('?', `$${i}`)
    i += 1
  }
  return str
}

class PostgresDatabase {
  constructor(connectionString) {
    this.db = pgp(connectionString) // 'postgres://dev:password@postgres:5432/feedback')
  }

  async initialize() {
    try {
      const newestMigrationId = await this.query('SELECT id FROM migrations ORDER BY id DESC LIMIT 1')
      const newestId = newestMigrationId[0].id
      console.log('Connected to postgres database at migration', newestId)
      await this.runMigrations(newestId)
    } catch (err) {
      console.log('Could not load migrations, trying to add first migration')
      await this.runMigrations(0)
    }
  }

  async runMigrations(newestId) {
    const migrations = fs.readdirSync(path.resolve(__dirname, './migrations'))
    migrations.sort()
    for (const file of migrations) {
      const migrNr = parseInt(file.slice(0, 3), 10)
      if (migrNr > newestId) {
        console.log(`Running migration ${file}`)
        const sqlCommand = fs.readFileSync(path.resolve(__dirname, `./migrations/${file}`))
          .toString()
        await this.exec(sqlCommand)
          .then(() => {
            this.run('INSERT INTO migrations(id, file) VALUES ($1, $2)', [migrNr, file])
              .catch((err) => {
                console.error(`Failed to add ${file} to migrations table: ${err}`)
              })
          }, (err) => {
            if (err) {
              console.error(`Failed to run migration ${file}`, err)
            }
          })
      }
    }
  }

  run(str, values) {
    const sqlstr = prepStatement(str)
    console.log(sqlstr)
    return this.db.none(sqlstr, values)
  }

  query(str, values) {
    const sqlstr = prepStatement(str)
    console.log(sqlstr)
    return this.db.any(str, values)
  }

  exec(str, values) {
    const sqlstr = prepStatement(str)
    console.log(sqlstr)
    return this.db.multi(str, values)
  }
}


export default PostgresDatabase
