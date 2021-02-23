const { googleAuth } = require('./Spreadsheet/auth')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const express = require('express')
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development') {
  dotenv.config()
}

const dailyUpdateQueue = require('./Issues/update-watcher')

const port = process.env.PORT || 3000
const gitlabToken = process.env.Gitlab_Hook_Token

const app = express()
app.use(bodyParser.json())
app.use(methodOverride())

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.post('/gitlab-hooks', (req, res) => {
  // first check the token value to make sure this hook call is coming from our repo
  console.log('got new hook')
  const { headers, body } = req
  if (headers['x-gitlab-token'] !== gitlabToken) {
    console.error('gitlab token check has failed')
    throw new Error('not authorized to trigger')
  }
  
  const { object_kind, event_type, object_attributes: object, changes } = body
  if (object_kind !== 'issue' || event_type !== 'issue') {
    console.error('event type check has failed', object_kind, event_type)
    throw new Error('we are not interested in this type of event')
  }

  console.log('add hook to process queue')
  dailyUpdateQueue.add({ ...object, changes })
  res.send('pong')
})


const errorHandler = (err, req, res, next) => {
  res.status(500).send({ error: 'something failed '})
}

const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

app.use(logErrors)
app.use(errorHandler)

const init = async () => {
  await googleAuth()
  app.listen(port, () => {
    console.log(`app listening at port ${port}`)
  })
}

init()