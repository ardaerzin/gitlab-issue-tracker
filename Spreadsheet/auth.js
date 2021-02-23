const GoogleAuth = require('google-auth-library')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
let auth

const googleAuth = async () => {
  console.log('authenticating google')
  return new Promise((resolve, reject) => {
    const jwtClient = new GoogleAuth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
      SCOPES
    )
    jwtClient.authorize((err) => {
      if (err) reject(err)
      console.log('authenticated google')
      auth = jwtClient
      resolve()
    })
  })
}

module.exports = {
  googleAuth,
  auth: () => auth
}
