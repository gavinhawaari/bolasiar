import { google } from 'googleapis'

export default async function handler(req, res) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT), // Added in Vercel dashboard
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })

  const sheets = google.sheets({ version: 'v4', auth })

  let { id, sheet } = req.query

  // Allow any other website to access this API.
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    if (!isNaN(sheet)) {
      const { data } = await sheets.spreadsheets.get({
        spreadsheetId: id
      })

      if (parseInt(sheet) === 0) {
        return res.json({ error: 'For this API, sheet numbers start at 1' })
      }

      const sheetIndex = parseInt(sheet) - 1

      if (!data.sheets[sheetIndex]) {
        return res.json({ error: `There is no sheet number ${sheet}` })
      }

      sheet = data.sheets[sheetIndex].properties.title
    }

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: sheet
    })

    const rows = []
    const rawRows = result.data.values
    const headers = rawRows.shift()

    rawRows.forEach(row => {
      const rowData = {}
      row.forEach((item, index) => {
        rowData[headers[index]] = item
      })
      rows.push(rowData)
    })

    // Cache rows for 30 seconds.
    res.setHeader('Cache-Control', 's-maxage=30')
    return res.json(rows)
  } catch (error) {
    console.error('Error:', error)
    return res.json({ error: error.message || 'Unknown error occurred' })
  }
}
