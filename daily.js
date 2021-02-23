const dailySnapshot = require('./Issues/daily-snapshot')
const { googleAuth } = require('./Spreadsheet/auth')
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development') {
  dotenv.config()
}

const init = async () => {
  await googleAuth()
  await dailySnapshot()
}

init()
