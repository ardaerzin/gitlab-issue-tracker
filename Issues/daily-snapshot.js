const { getAllIssues, createNewValueFormat } = require('./')
const Sheet = require('../Spreadsheet')

const dailySnapshot = async () => {
  console.log('taking a snapshot of gitlab issues')
  try {
    // today's date
    const date = new Date()
  
    // initialize a new google sheet
    console.log('***** initializing sheet')
    const spreadsheet = new Sheet(date.toLocaleString('default', { month: 'long' }), 'snapshot')
    const newSheet = await spreadsheet.init()
    console.log('***** initialized sheet')

    console.log(`***** pulling all gitlab issues`)
    const allIssues = await getAllIssues(process.env.Gitlab_Project_Id)
    console.log(`***** successfully pulled ${allIssues.length} issues`)
  
    console.log('***** pulling spreadsheet headers')
    const headers = await spreadsheet.getSheetHeaders({ sheetName: newSheet, row: 33 })
    console.log('***** successfully pulled spreadsheet headers')
  
    const newData = createNewValueFormat(allIssues, headers, 'snapshot')
    console.log('***** adding new data to spreadsheet')
    const x = await spreadsheet.addValues({
      sheetName: newSheet,
      values: newData
    })
    console.log('***** successfully added data to spreadsheet')
    return
  } catch (err) {
    console.log('there was an err', err)
  }
}

module.exports = dailySnapshot
