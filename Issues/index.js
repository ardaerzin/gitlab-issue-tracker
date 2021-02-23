const { Gitlab } = require('@gitbeaker/node')
const { formatSnapshotData, formatUpdateData } = require('./sheetFormatter')

const getAllIssues = async (projectId) => {
  const api = new Gitlab({
    token: process.env.Gitlab_Token
  })
  const x = await api.Issues.all({ projectId })
  return x
}

const createNewValueFormat = (issues, headers, type) => {
  switch (type) {
    case 'updates':
      return headers.reduce((acc, cur, ind) => {
        acc[ind] = formatUpdateData(cur, issues[0])
        return acc
      }, [])
    case 'snapshot':
    default:
      return issues.map((issue, issueIndex) => {
        return headers.reduce((acc, cur, ind) => {
          acc[ind] = formatSnapshotData(cur, issue)
          return acc
        }, [])
      })    
  }
}

module.exports = {
  fillIssues,
  addIssue,
  getAllIssues,
  createNewValueFormat
}
