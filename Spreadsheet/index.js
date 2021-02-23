const { overrideSnapshotTemplate, overrideUpdateTemplate } = require('./template')
const { google } = require('googleapis')
const { auth } = require('./auth')

class Sheet {
  constructor(spreadsheetName, type) {
    if (!process.env.Template_Spreadsheet_Id) new Error('no spreadsheet is specified in your env configs')
    this.client = google.sheets({ version: 'v4', auth: auth() })
    this.templateSpreadsheetId = process.env.Template_Spreadsheet_Id
    switch (type) {
      case 'snapshot':
        this.templateName = 'gitlab-temp'
        break
      case 'updates':
        this.templateName = 'daily-updates'
        break
      default:
        throw new Error('invalid template type')
    }
    this.type = type
    // get monthly sheet id
    this.id = process.env[`Sheet_${spreadsheetName}`]
  }

  /**
   * either find an existing sheet, or create one
   * @param {String} spreadsheetName name of the spreadsheet to look at.
  */
  findOrInit = async (date) => {
    const name = this.type
    let sheet
    try {
      sheet = await this.findSheet(this.id, (s) => s.properties.title === name)
      return sheet.properties.title
    } catch (err) {
      sheet = await this.init(date, name)
      return sheet
    }
  }

  init = async (date = new Date(), title) => {
    // first step of initialization is copying the correct template
    const template = await this.findTemplate()
    const newSheetId = await this.copyTemplate(template)
    
    // find the newly copied sheet to easily access a list of filter views
    const newSheet = await this.findSheet(this.id, (s) => s.properties.sheetId === newSheetId)
    // override template initial values such as links / dates
    const name = title || `${date.toLocaleDateString()}-${this.type}`
    await this.overrideTemplate(newSheet, name)
    return name
  }

  overrideTemplate = async (newSheet, name) => {
    if (this.type === 'snapshot') {
      return overrideSnapshotTemplate(this.client, this.id, newSheet, name)
    } else if (this.type === 'updates') {
      return overrideUpdateTemplate(this.client, this.id, newSheet, name)
    }
  }


  // find the right template for this sheet
  findTemplate = async () => {
    return await this.findSheet(this.templateSpreadsheetId, (s) => s.properties.title === this.templateName)
  }

  // find a specific sheet based on name
  findSheet = async (spreadsheetId, filter) => {
    // get all sheets within the template SPREADSHEET
    let allsheets = await this.getSheets(spreadsheetId)
    // return the right one
    const sheet = allsheets.filter(filter)[0]
    // throw an error if requested sheet is not found
    if (!sheet) throw new Error('could not find sheet in spreadsheet:', spreadsheetId)
    return sheet
  }

  // copy general template to this sheet
  copyTemplate = async (temp) => {
    return new Promise((resolve, reject) => {
      this.client.spreadsheets.sheets.copyTo({
        sheetId: temp.properties.sheetId,
        spreadsheetId: this.templateSpreadsheetId,
        resource: {
          destinationSpreadsheetId: this.id
        }
      }, (err,response) => {
        if(err) {
          console.log(err)
          reject(err)
        }
        resolve(response?.data?.sheetId)
      })
    })
  }

  getSheets = async (spreadsheetId) => {
    return new Promise((resolve, reject) => {
      this.client.spreadsheets.get({
        spreadsheetId
      }, (err, res) => {
        if (err) reject(err)
        const sheets = res.data?.sheets
        resolve(sheets)
      })
    })
  }

  /**
   * Get all row values in a selected sheet & range
   * @param {String} sheetName name of the sheet in this spreadsheet
   */
  getSheetHeaders = async ({sheetName = 'all-issues', row = 1} = {}) => {
    return new Promise((resolve, reject) => {
      this.client.spreadsheets.values.get({
        spreadsheetId: this.id,
        range: `${sheetName}!${row}:${row}`
      }, (err, res) => {
        if (err) reject(err)
        const rows = res.data.values || []
        resolve(rows[0])
      })
    })
  }

  /**
   * Get all row values in a selected sheet & range
   * @param {String} sheetName name of the sheet in this spreadsheet.
   * @param {String} range the data range we are interested in.
   */
  getValues = async ({ sheetName = 'all-issues', range = 'A2:ZZZZ' } = {}) => {
    return new Promise((resolve, reject) => {
      this.client.spreadsheets.values.get({
        spreadsheetId: this.id,
        range: `${sheetName}!${range}`
      }, (err, res) => {
        if (err) reject(err)
        const rows = res.data.values
        resolve(rows)
      })
    })
  }

  addValues = async ({ sheetName = 'all-issues', range = 'A2:Z', values = [] } = {}) => {
    return new Promise((resolve, reject) => {
      this.client.spreadsheets.values.append({
        spreadsheetId: this.id,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values
        }
      }, (err, res) => {
        if (err) reject(err)
        resolve(res)
      })
    })
  }
}

module.exports = Sheet
