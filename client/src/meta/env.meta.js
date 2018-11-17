const meta = require('./meta-util')

const staticUrl = process.env.STATIC_URL || 'localhost:8080'

module.exports = meta.json({ staticUrl })

