const formatSnapshotData = (key, object) => {
  switch (key) {
    case 'author':
    case 'assignee':
    case 'closed_by':
      return object[key] ? `=HYPERLINK("${object[key]?.web_url}", "${object[key]?.name}")` : ''
    case 'created_at':
    case 'updated_at':
    case 'closed_at':
    case 'due_date':
      return object[key] ? `=DATEVALUE(MID("${object[key]}",1,10)) + TIMEVALUE(MID("${object[key]}",12,8))` : ''
    case 'title':
      return `=HYPERLINK("${object.web_url}", "${object[key].replace(/\"/g, "'")}")`
    case 'assignees':
      let val = ''
      const assignees = object[key] || []
      if (assignees.length > 0) {
        val = assignees.reduce((acc, cur, ind) => {
          acc += (cur.name + (ind < assignees.length ? ', ' : ''))
        }, '')
      }
      return val
    case 'process_stage':
      return extractScopedLabel(object.labels, 'workflow')
    case 'priority':
      return extractScopedLabel(object.labels, 'P')
    case 'planning':
      return extractScopedLabel(object.labels, 'planning')
    case 'type':
      return extractScopedLabel(object.labels, 'Type')
    case 'milestone':
      return object[key] ? `=HYPERLINK("${object[key].web_url}", "${object[key].title}")` : ''
    default:
      return object[key]
  }
}

const extractScopedLabel = (labels, scope) => {
  const scopeText = `${scope}::`
  const scopedLabel = labels.filter((label) => {
    switch (typeof label) {
      case 'string':
        return label.includes(scopeText)
      default:
        return label.title.includes(scopeText)
    } 
  })[0]
  return scopedLabel ? (
    typeof scopedLabel === 'string' ?
      scopedLabel.substring(scopeText.length, scopedLabel.length) :
      scopedLabel.title.substring(scopeText.length, scopedLabel.title.length)
  ) : ''
}

const formatUpdateData = (key, object) => {
  switch (key) {
    case 'milestone':
      return object[key] ? `=HYPERLINK("${object[key].web_url}", "${object[key].title}")` : ''
    case 'author':
    case 'assignee':
    case 'closed_by':
    case 'last_edited_by':
    case 'updated_by':
      return object[key] ? `=HYPERLINK("${object[key]?.web_url}", "${object[key]?.name}")` : ''
    case 'assignees':
      const x = object[key].reduce((acc, cur, ind) => {
        acc += `${ind > 0 ? ', ' : ''}${cur.name}`
        return acc
      }, '')
      return x
    case 'created_at':
    case 'updated_at':
    case 'closed_at':
    case 'due_date':
      return object[key] ? `=DATEVALUE(MID("${object[key]}",1,10)) + TIMEVALUE(MID("${object[key]}",12,8))` : ''
    case 'labels': 
      const lbls = object[key].reduce((acc, cur, ind) => {
        acc += `${ind > 0 ? ', ' : ''}${cur.title}`
        return acc
      }, '')
      return lbls
    case 'process_stage':
      return extractScopedLabel(object.labels, 'workflow') || (object.action === 'reopen' ? 'closed' : (object.state === 'opened' ? 'open' : 'closed'))
    case 'priority':
      return extractScopedLabel(object.labels, 'P')
    case 'planning':
      return extractScopedLabel(object.labels, 'planning')
    case 'type':
      return extractScopedLabel(object.labels, 'Type')
    case 'title':
      return `=HYPERLINK("${object.url}", "${object[key].replace(/\"/g, "'")}")`
    case 'workflow progress':
      const wc = object.changes?.labelChanges?.workflowChange
      return wc?.movement || 'N/A'
    case 'prev stage':
      const ps = object.changes?.labelChanges?.workflowChange
      return ps?.previous || extractScopedLabel(object.labels, 'workflow')
    default:
      return object[key]
  }
}

module.exports = {
  formatSnapshotData,
  formatUpdateData,
  extractScopedLabel
}