const { getTimeString } = require('../Utils/date')

const overrideSnapshotTemplate = async (client, spreadsheetId, sheet, name) => {
  const getFilterLink = (filterName) => {
    const fv = sheet.filterViews.filter((sfv) => sfv.title === filterName)[0]
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheet.properties.sheetId}&fvid=${fv.filterViewId}`
  }

  return new Promise((resolve, reject) => {
    var formattedTime = getTimeString(new Date())
    client.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheet.properties.sheetId,
                title: name,
              },
              fields: 'title'
            },
          },
          {
            updateCells: {
              fields: 'userEnteredValue.stringValue,userEnteredFormat.backgroundColor',
              start: {
                sheetId: sheet.properties.sheetId,
                rowIndex: 0,
                columnIndex: 0
              },
              rows: [
                //row 1
                {
                  values: [
                    {
                      userEnteredValue: {
                        stringValue: 'this document was created on:'
                      }
                    },
                    {
                      userEnteredValue: {
                        stringValue: new Date().toLocaleDateString()
                      }
                    },
                    {
                      userEnteredValue: {
                        stringValue: formattedTime
                      }
                    }
                  ]
                },
                //row 2
                {},
                //row 3
                {},
                //row 4
                {
                  values: [
                    {},
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('all open issues')}", "open issues")`
                      },
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('opened yesterday')}", "opened yesterday")`
                      },
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('closed yesterday')}", "closed yesterday")`
                      },
                    }
                  ]
                },
                //row 5,
                {},
                //row 6,
                {},
                // row 7,
                {},
                // row 8,
                {},
                // row 9,
                {},
                // row 10,
                {},
                // row 11,
                {},
                // row 12
                {},
                // row 13
                {},
                // row 14,
                {},
                // row 15,
                {},
                // row 16,
                {},
                // row 17,
                {},
                // row 18,
                {},
                // row 19,
                {},
                // row 20,
                {},
                // row 21,
                {},
                // row 22
                {
                  values: [
                    {},
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('prds in progress')}", "prds in progress")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('prds in review')}", "prds in review")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('prds ready for design')}", "prds ready for design")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('issues in design')}", "design in progress")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('issues in design review')}", "issues in design review")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('design ready for development')}", "design ready for development")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('dev in progress')}", "dev in progress")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('dev in review')}", "dev in review")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('dev qa ready')}", "dev qa ready")`
                      }
                    },
                    {
                      userEnteredValue: {
                        formulaValue: `=HYPERLINK("${getFilterLink('dev uat')}", "dev uat")`
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    }, (err, res) => {
      if (err) {
        console.log('err', err)
        reject(err)
      }
      resolve(res?.data)
    })
  })
}

const overrideUpdateTemplate = async (client, spreadsheetId, sheet, name) => {
  return new Promise((resolve, reject) => {
    var formattedTime = getTimeString(new Date())
    client.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheet.properties.sheetId,
                title: name,
              },
              fields: 'title'
            },
          }
        ]
      }
    }, (err, res) => {
      if (err) {
        console.log('err', err)
        reject(err)
      }
      resolve(res?.data)
    })
  })
}

module.exports = {
  overrideSnapshotTemplate,
  overrideUpdateTemplate
}