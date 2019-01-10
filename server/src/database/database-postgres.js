import pgpromise from 'pg-promise'
import path from 'path'
import fs from 'fs'

const pgp = pgpromise({})

function prepStatement(unprepared) {
  let str = unprepared
  let i = 1
  while (str.includes('?')) {
    str = str.replace('?', `$${i}`)
    i += 1
  }
  return str
}

class PostgresDatabase {
  constructor(connectionString) {
    this.db = pgp(connectionString)
  }

  async initialize(useTestData) {
    try {
      const newestMigrationId = await this.query('SELECT id FROM migrations ORDER BY id DESC LIMIT 1')
      const newestId = newestMigrationId[0].id
      console.log('Connected to PostgreSQL database at migration', newestId)
      await this.runMigrations(newestId)
    } catch (err) {
      console.log('Could not load migrations, trying to add first migration')
      await this.runMigrations(0)
    }

    if (useTestData) {
      const sqlCommand = fs.readFileSync(path.resolve(__dirname, './test-data.sql')).toString()
      console.log('Loading test data from test-data.sql')
      try {
        await this.exec(sqlCommand)
      } catch (error) {
        console.error('Failed to load test data', error)
      }
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
    const preparedString = prepStatement(str)
    return this.db.none(preparedString, values)
  }

  query(str, values) {
    const preparedString = prepStatement(str)
    return this.db.any(preparedString, values)
  }

  exec(str, values) {
    const preparedString = prepStatement(str)
    return this.db.multi(preparedString, values)
  }
}


export default PostgresDatabase
