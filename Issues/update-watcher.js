const Sheet = require('../Spreadsheet')
const Queue = require('bull')
const { createNewValueFormat } = require('./')
const { Gitlab } = require('@gitbeaker/node')
const { extractScopedLabel } = require('./sheetFormatter')

const WORKFLOW = ['open', 'PRD-in-progress', 'PRD-in-review', 'PRD-ready-for-design', 'design-in-progress', 'design-review', 'design-ready-for-development', 'dev-in-progress', 'dev-in-review', 'dev-qa-ready', 'dev-uat', 'closed']

const updatesQueue = new Queue(`update-process-${process.env.NODE_ENV || 'prod'}`, process.env.REDIS_URL)

const loop = async (arr) => {
  const api = new Gitlab({
    token: process.env.Gitlab_Token
  })
  const x = []
  for (let i = 0; i < arr.length; i++) {
    const u = await api.Users.show(arr[i])
    x.push(u)
  }
  return x
}

// process incoming update data
updatesQueue.process(async ({ data }, done) => {
  try {

    const { changes, ...rest } = data
    const issue = rest
    
    if (issue.action === 'close' || (Object.keys(changes).length === 1 && changes.relative_position)) {
      return done()
    }

    const api = new Gitlab({
      token: process.env.Gitlab_Token
    })
    
    // find the correct sheet to write this data
    const [spreadsheet, sheetName] = await findOrCreateSheet(new Date(issue.updated_at))
    issue.author = await api.Users.show(issue.author_id)
    if (issue.last_edited_by_id) {
      issue.last_edited_by = await api.Users.show(issue.last_edited_by_id)
    }
    if (issue.updated_by_id) {
      issue.updated_by = await api.Users.show(issue.updated_by_id)
    }
    if (issue.closed_by_id) {
      issue.closed_by = await api.Users.show(issue.closed_by_id)
    }
    if (issue.assignee_id) {
      issue.assignee = await api.Users.show(issue.assignee_id)
    }
    if (issue.assignee_ids) {
      issue.assignees = await loop(issue.assignee_ids)
    }
  
    if (issue.milestone_id) {
      issue.milestone = await api.ProjectMilestones.show(issue.project_id, issue.milestone_id)
    }

    if (changes) {
      issue.changes = {}
      issue.changes.labelChanges = changes.labels ? compareLabels(issue, changes.labels) : {}
    }
    // get headers
    const headers = await spreadsheet.getSheetHeaders({ sheetName, row: 1 })
    const newData = createNewValueFormat([issue], headers, 'updates')
  
    const x = await spreadsheet.addValues({
      sheetName: sheetName,
      values: [newData]
    })
    done()
  } catch (err) {
    console.log('there was an error', err)
  }
})

updatesQueue.on('failed', (job, err) => {
  // A job failed with reason `err`!
  console.log('BULL: a job has failed to execute', err)
})

updatesQueue.on('drained', () => {
  // A job failed with reason `err`!
  console.log('BULL: queue has been drained. good job')
})

updatesQueue.on('active', (job, jobPromise) => {
  console.log('BULL: processing a job')
})

const compareLabels = (issue, { previous = [], current = [] } = {}) => {
  if (issue.action === 'open') {
    current = issue.labels
  }
  const workflowChange = getWorkflowStageChange(issue, previous, current)
  return {
    workflowChange,
  }
}

const getWorkflowStageChange = (issue, previous, current) => {
  const prevWorkflow = extractScopedLabel(previous, 'workflow') || ((issue.state !== 'closed') ? 'open' : undefined)
  const pInd = WORKFLOW.findIndex((i) => i === prevWorkflow)
  const curWorkflow = extractScopedLabel(current, 'workflow') || (issue.action === 'reopen' ? 'closed' : (issue.state === 'closed') ? 'closed' : (issue.state !== 'closed' ? 'open' : ''))
  const cInd = WORKFLOW.findIndex((i) => i === curWorkflow)

  return {
    previous: prevWorkflow,
    current: curWorkflow,
    movement: cInd - pInd
  }
}

const findOrCreateSheet = async (date) => {
  const spreadsheet = new Sheet(date.toLocaleString('default', { month: 'long' }), 'updates')
  const sheet = await spreadsheet.findOrInit(date)
  return [spreadsheet, sheet]
}

module.exports = updatesQueue
