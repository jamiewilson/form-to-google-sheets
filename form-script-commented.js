// The default sheet name is 'Sheet1'. To target a different sheet, update this variable.
var sheetName = 'Sheet1'

/*
Gets a property store that all users can access, but only within this script.
https://developers.google.com/apps-script/reference/properties/properties-service#getScriptProperties()
*/
var scriptProp = PropertiesService.getScriptProperties()

/*
This is the initial setup function. It gets the active SpreadsheetApp ID and adds it to our PropertiesService.
https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getactivespreadsheet
*/
function setup () {
  var doc = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', doc.getId())
}

function doPost (e) {
  /*
  Gets a lock that prevents any user from concurrently running a section of code. A code section
  guarded by a script lock cannot be executed simultaneously regardless of the identity of the user.
  https://developers.google.com/apps-script/reference/lock/lock-service#getScriptLock()
  */
  var lock = LockService.getScriptLock()

  /*
  Attempts to acquire the lock, timing out with an exception after the provided number of milliseconds.
  This method is the same as tryLock(timeoutInMillis) except that it throws an exception when the lock
  could not be acquired instead of returning false.
  https://developers.google.com/apps-script/reference/lock/lock#waitLock(Integer)
  */
  lock.waitLock(10000)

  try {
    /*
    Opens the spreadsheet with the given ID. A spreadsheet ID can be extracted from its URL. For example,
    the spreadsheet ID in the URL https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 is "abc1234567".
    https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openbyidid
    */
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))

    /*
    Returns a sheet with the given name. If multiple sheets have the same name,
    the leftmost one is returned. Returns null if there is no sheet with the given name.
    https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheetByName(String)
    */
    var sheet = doc.getSheetByName(sheetName)

    /*
    Returns the range with the top left cell at the given coordinates, and with the given number of rows.
    https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(Integer,Integer)

    Then returns the position of the last column that has content.
    https://developers.google.com/apps-script/reference/spreadsheet/sheet#getlastcolumn

    Then returns the rectangular grid of values for this range (a two-dimensional array of values, indexed by row, then by column.)
    https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()
    */
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    // Gets the last row and then adds one
    var nextRow = sheet.getLastRow() + 1
    // Initializes an empty array to store our new row data in
    var row = []

    /*
    Loops through all values of 'headers' and if it matches 'timestamp'
    then it creates a new Date() object for that row, otherwise it moves on to
    pushing the key/value pairs from the URL parameters to the row array
    https://developers.google.com/apps-script/guides/web
    */
    for (i in headers) {
      if (headers[i] == 'timestamp') {
        row.push(new Date())
      } else {
        row.push(e.parameter[headers[i]])
      }
    }

    /*
    Gets a range from the next row to the end row based on how many items are in row
    then sets the values of the whole array at once.
    https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object)
    */
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row])

    /*
    Return success results as JSON
    https://developers.google.com/apps-script/reference/content/content-service
    */
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  /*
  Return error results as JSON
  https://developers.google.com/apps-script/reference/content/content-service
  */
  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    /*
    Releases the lock, allowing other processes waiting on the lock to continue.
    https://developers.google.com/apps-script/reference/lock/lock#releaseLock()
    */
    lock.releaseLock()
  }
}
