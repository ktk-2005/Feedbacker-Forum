const metaUtil = require('./meta-util')

const staticUrl = process.env.STATIC_URL || 'localhost:8080'
const storageName = staticUrl.replace(/[^A-Za-z0-9]/g, '')
const storageKey = `FeedbackerForum_${storageName}`

module.exports = metaUtil.json({ staticUrl, storageKey })

