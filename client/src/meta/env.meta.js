const meta = require('./meta-util')

const staticUrl = process.env.STATIC_URL || 'localhost:8080'

const apiUrl = process.env.API_URL || 'localhost:8080/api'

module.exports = meta.json({ staticUrl, apiUrl })

