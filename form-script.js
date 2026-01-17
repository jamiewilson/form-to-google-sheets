/*
Paste this script into the 'Code.gs' tab in the Script Editor
For a detailed explanation of this file, view 'form-script-commented.js'
*/

const scriptProp = PropertiesService.getScriptProperties()

function initialSetup() {
	const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
	scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function sanitizeValue(value) {
	if (typeof value !== 'string') return value
	const triggers = ['=', '+', '-', '@']
	if (triggers.some(t => value.startsWith(t))) {
		return "'" + value
	}
	return value
}

// Uncomment and setup to get notified of new submissions

//function sendNewSubmissionEmailNotification(subject, body) {
//	const recipient = 'INSERT_YOUR_EMAIL_HERE'
//	const senderName = 'INSERT_YOUR_NAME_HERE'

//	MailApp.sendEmail({
//		to: recipient,
//		subject: subject,
//		htmlBody: body,
//		name: senderName,
//	})
//}

function doPost(e) {
	const lock = LockService.getScriptLock()
	lock.tryLock(10000)

	try {
		if (e.parameter.mobile_number && e.parameter.mobile_number !== '') {
			return ContentService.createTextOutput(
				JSON.stringify({ result: 'success', message: 'Bot detected' }),
			).setMimeType(ContentService.MimeType.JSON)
		}

		const sheetName = e.parameter.sheet_name || 'Sheet1'
		const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
		const sheet = doc.getSheetByName(sheetName)
		const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
		const nextRow = sheet.getLastRow() + 1

		const newRow = headers.map(function (header) {
			if (header === 'id') return Utilities.getUuid()
			if (header === 'timestamp') return new Date()

			const rawValue = e.parameter[header] || ''
			return sanitizeValue(rawValue)
		})

		const newRange = sheet.getRange(nextRow, 1, 1, newRow.length)
		newRange.setNumberFormat('@')
		newRange.setValues([newRow])

		//const emailSubject = 'New Form Submission'
		//const emailBody = 'A new submission has been added to row ' + nextRow
		//sendNewSubmissionEmailNotification(emailSubject, emailBody)

		return ContentService.createTextOutput(
			JSON.stringify({ result: 'success', row: nextRow }),
		).setMimeType(ContentService.MimeType.JSON)
	} catch (e) {
		//const errorSubject = 'Error in Form Submission'
		//const errorBody = 'Form submission error:\n' + e.toString()
		//sendNewSubmissionEmailNotification(errorSubject, errorBody)

		return ContentService.createTextOutput(
			JSON.stringify({ result: 'error', error: e.toString() }),
		).setMimeType(ContentService.MimeType.JSON)
	} finally {
		lock.releaseLock()
	}
}
