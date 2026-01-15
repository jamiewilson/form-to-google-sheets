# Submit a Form to Google Sheets | [Demo](https://form-to-google-sheets.surge.sh)

#### How to create an HTML form that stores the submitted form data in Google Sheets using plain 'ol JavaScript (ES6), [Google Apps Script](https://developers.google.com/apps-script/), [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

## 1. Create a new Google Sheet

- First, go to [Google Sheets](https://docs.google.com/spreadsheets) and `Start a new spreadsheet` with the `Blank` template.
- Rename it `Email Subscribers`. Or whatever, it doesn't matter.
- Put the following headers into the first row:

|   |     A     |   B   | C | ... |
|---|:---------:|:-----:|:-:|:---:|
| 1 | timestamp | email |   |     |

> To learn how to add additional input fields, [checkout section 7 below](#7-adding-additional-form-data).

## 2. Create a Google Apps Script

- Click on `Extensions > Apps Script` which should open a new tab.
- Rename it to whatever you want. _Make sure to wait for it to actually save and update the title before editing the script._
- Now, delete the `function myFunction() {}` block within the `Code.gs` tab.
- Paste the following script in it's place and `File > Save`:

```js
var sheetName = 'Sheet1'
var scriptProp = PropertiesService.getScriptProperties()

function initialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost (e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    var sheet = doc.getSheetByName(sheetName)

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}
```

> If you want to better understand what this script is doing, checkout the [`form-script-commented.js`](https://github.com/jamiewilson/form-to-google-sheets/blob/master/form-script-commented.js) file in the repo for a detailed explanation. 

## 3. Run the setup function

- Next, go to `Run > Run Function > initialSetup` to run this function.

> **IMPORTANT**: If you're getting the **"Google hasn’t verified this app screen"**, you can click on `Advanced` and then `Go to Submit Form to Google Sheets (unsafe)`. This is because the script isn't verified by Google, but since you're the only one using it, I _think_ it's safe to proceed.

- In the `Authorization Required` dialog, click on `Review Permissions`.
- Sign in or pick the Google account associated with this project.
- You should see a dialog that says `Hi {Your Name}`, `{APP_NAME} wants to`...
- Click `Allow`

## 4. Add a new project trigger 
- Click on `Triggers` in the sidebar. 
= Then click on `+ Add Trigger` in the bottom right corner.
- In the `Choose which function to run` dropdown select `doPost`
- Set `Select event source` to `From spreadsheet` 
- And `Select event type` to `On form submit`
- Then click `Save`

## 5. Publish the project as a web app

- Click on `Deploy > New deployment` in the top right corner.
- In the `Select type` dropdown, choose `Web app`.
- Set `Execute as:` to `Me(your@address.com)`.
- For `Who has access` select `Anyone`.
- Click `Deploy`.
- In the popup, copy the `Web app URL` from the dialog.
- And click `Done`.

> **IMPORTANT!** If you have a custom domain with Gmail, you _might_ need to click `OK`, refresh the page, and then go to `Publish > Deploy as web app…` again to get the proper web app URL. It should look something like `https://script.google.com/a/yourdomain.com/macros/s/XXXX…`.

## 6. Input your web app URL

Open `index.html`.  Replace `SCRIPT_URL` with your script url:

```html
<script>
  const scriptURL = 'SCRIPT_URL'
  ...
</script>
```

> **Fun fact!** The `<html>`, `<head>`, and `body` tags are actually among a handful of optional tags, but since the [rules around how the browser parses a page are kinda complicated](https://www.w3.org/TR/2011/WD-html5-20110525/syntax.html#optional-tags), you'd probably not want to omit them on real websites.

## 7. Adding additional form data
To capture additional data, you'll just need to create new columns with titles matching exactly the `name` values from your form inputs. For example, if you want to add first and last name inputs, you'd give them `name` values like so:

```html
<form name="submit-to-google-sheet">
  <input name="email" type="email" placeholder="Email" required>
  <input name="firstName" type="text" placeholder="First Name">
  <input name="lastName" type="text" placeholder="Last Name">
  <button type="submit">Send</button>
</form>
```

Then create new headers with the exact, case-sensitive `name` values:

|   |     A     |   B   |     C     |     D    | ... |
|---|:---------:|:-----:|:---------:|:--------:|:---:|
| 1 | timestamp | email | firstName | lastName |     |

> Note: If you are using checkboxes for your forms, then have unique `name` for every checkbox option and add these unique names to the sheet to collect all responses.

# Have feedback/requests/issues?
Please [create a new issue](https://github.com/jamiewilson/form-to-google-sheet/issues). PRs are definitely welcome, but please run your ideas by me before putting in a lot of work. Thanks!

#### Related/Inspirational Articles
- [Google Spreadsheets as a Database – INSERT with Apps Script form POST/GET submit method](https://mashe.hawksey.info/2011/10/google-spreadsheets-as-a-database-insert-with-apps-script-form-postget-submit-method/)
- [Step by step setup to send form data to Google Sheets](http://railsrescue.com/blog/2015-05-28-step-by-step-setup-to-send-form-data-to-google-sheets/)
- [Google Sheet Form Post](https://gist.github.com/willpatera/ee41ae374d3c9839c2d6)
- [How to Submit an HTML Form to Google Sheets…without Google Forms](https://medium.com/@dmccoy/how-to-submit-an-html-form-to-google-sheets-without-google-forms-b833952cc175)
- [Send Email from a Static HTML Form using Google Apps Mail!](https://github.com/dwyl/html-form-send-email-via-google-script-without-server)

#### Documentation
- [Google Apps Script](https://developers.google.com/apps-script/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [HTML `<form>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form)
- [Document.forms](https://developer.mozilla.org/en-US/docs/Web/API/Document/forms)
- [Sending forms through JavaScript](https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Sending_forms_through_JavaScript)
