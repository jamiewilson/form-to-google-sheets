/*
Gets a property store that all users can access, but only within this script.
https://developers.google.com/apps-script/reference/properties/properties-service#getScriptProperties()
*/
const scriptProp = PropertiesService.getScriptProperties()

/*
This is the initial setup function. It gets the active SpreadsheetApp ID and adds it to our PropertiesService.
https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getactivespreadsheet
*/
function initialSetup() {
	const doc = SpreadsheetApp.getActiveSpreadsheet()
	scriptProp.setProperty('key', doc.getId())
}

/**
Prevents CSV/Formula Injection by prepending a single quote to force text formatting 
which prevents inputs that start with =, +, -, or @ to be interpreted as formulas.
*/

function sanitizeValue(value) {
	if (typeof value !== 'string') return value

	const formulaTriggers = ['=', '+', '-', '@']
	if (formulaTriggers.some(trigger => value.startsWith(trigger))) {
		return "'" + value
	}
	return value
}

/*
Sends an email notification using MailApp.
https://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(Object)
*/

function sendNewSubmissionEmailNotification(subject, body) {
	const recipient = 'INSERT_YOUR_EMAIL_HERE'
	const senderName = 'INSERT_YOUR_NAME_HERE'

	MailApp.sendEmail({
		to: recipient,
		subject: subject,
		htmlBody: body,
		name: senderName,
	})
}

function doPost(e) {
	/*
  Gets a lock that prevents any user from concurrently running a section of code. A code section
  guarded by a script lock cannot be executed simultaneously regardless of the identity of the user.
  https://developers.google.com/apps-script/reference/lock/lock-service#getScriptLock()
  */
	const lock = LockService.getScriptLock()

	/*
  Attempts to acquire the lock, timing out with an exception after the provided number of milliseconds.
  This method is the same as tryLock(timeoutInMillis) except that it throws an exception when the lock
  could not be acquired instead of returning false.
  https://developers.google.com/apps-script/reference/lock/lock#waitLock(Integer)
  */
	lock.waitLock(10000)

	try {
		/*
		This is a honeypot field for bot detection. If 'mobile_number' has ANY value, it's a bot.
		*/
		if (e.parameter.mobile_number && e.parameter.mobile_number !== '') {
			return ContentService.createTextOutput(
				JSON.stringify({ result: 'success', message: 'Bot detected' }),
			).setMimeType(ContentService.MimeType.JSON)
		}

		/*
    Opens the spreadsheet with the given ID. A spreadsheet ID can be extracted from its URL. For example,
    the spreadsheet ID in the URL https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 is "abc1234567".
    https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openbyidid
    */
		const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))

		/*
    Returns a sheet with the given name. If multiple sheets have the same name,
    the leftmost one is returned. Returns null if there is no sheet with the given name.
    https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheetByName(String)

		To specify a different sheet name, include a hidden input in your form with the name "sheet_name" and the value set to the desired sheet name.
		<input type="hidden" name="sheet_name" value="YOUR_CUSTOM_SHEET_NAME">
		This allows you to dynamically specify which sheet the form submission should go to.
    */
		const sheet = doc.getSheetByName(e.parameter.sheet_name || 'Sheet1')

		/*
    Returns the range with the top left cell at the given coordinates, and with the given number of rows.
    https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(Integer,Integer)

    Then returns the position of the last column that has content.
    https://developers.google.com/apps-script/reference/spreadsheet/sheet#getlastcolumn

    Then returns the rectangular grid of values for this range (a two-dimensional array of values, indexed by row, then by column.)
    https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()
    */
		const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
		// Gets the last row and then adds one
		const nextRow = sheet.getLastRow() + 1
		/*
    Maps the headers array to a new array. If the header is 'id', 
		it generates a new UUID. If a header's value is 'timestamp' 
		then it returns a new Date() object, otherwise it returns 
		the value of the matching URL parameter
    https://developers.google.com/apps-script/guides/web
    */
		const newRow = headers.map(function (header) {
			if (header === 'id') return Utilities.getUuid()
			if (header === 'timestamp') return new Date()

			const rawValue = e.parameter[header] || ''
			return sanitizeValue(rawValue)
		})

		/*
    Gets a range from the next row to the end row based on how many items are in newRow
    */
		const newRange = sheet.getRange(nextRow, 1, 1, newRow.length)

		/*
		Sets the format to "@" (Plain Text) BEFORE setting the values.
    This ensures Google Sheets never attempts to evaluate the string as a formula.
		*/
		newRange.setNumberFormat('@')

		/*
		Then sets the values of the range to the new row.
		https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object)
		*/
		newRange.setValues([newRow])

		/*
		Send success email notification
		*/
		const emailSubject = 'New Form Submission'
		const emailBody = 'A new submission has been added to row ' + nextRow
		sendNewSubmissionEmailNotification(emailSubject, emailBody)

		/*
    Return success results as JSON
    https://developers.google.com/apps-script/reference/content/content-service
    */
		return ContentService.createTextOutput(
			JSON.stringify({ result: 'success', row: nextRow }),
		).setMimeType(ContentService.MimeType.JSON)
	} catch (e) {
		/*
		Send error email notification
		*/
		const errorSubject = 'Error in Form Submission'
		const errorBody = 'Form submission error:\n' + e.toString()
		sendNewSubmissionEmailNotification(errorSubject, errorBody)

		/*
		Return error results as JSON
		https://developers.google.com/apps-script/reference/content/content-service
		*/
		return ContentService.createTextOutput(
			JSON.stringify({ result: 'error', error: e.toString() }),
		).setMimeType(ContentService.MimeType.JSON)
	} finally {
		/*
    Releases the lock, allowing other processes waiting on the lock to continue.
    https://developers.google.com/apps-script/reference/lock/lock#releaseLock()
    */
		lock.releaseLock()
	}
}
