# Submit a Form to Google Sheets

#### How to create an HTML form that stores the submitted form data in Google Sheets. Using plain 'ol JavaScript, [Google Apps Script](https://developers.google.com/apps-script/), the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), along with the [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill) and GitHub's [Fetch Polyfill](https://github.com/github/fetch). 

Demo at https://form-to-google-sheets.surge.sh

## 1. Create a new Google Sheet

- First, go to [Google Sheets](https://docs.google.com/spreadsheets) and `Start a new spreadsheet` with the `Blank` template.
- Rename it `Email Subscribers`. Or whatever, it doesn't matter.
- Put the following headers into the first row:

|   |     A     |   B   | C | ... |
|---|:---------:|:-----:|:-:|:---:|
| 1 | timestamp | email |   |     |

> To learn how to add additional input fields, [checkout section 7 below](#7-adding-additional-form-data).

## 2. Create a Google Apps Script

- Click on `Tools > Script Editor…` which should open a new tab.
- Rename it `Submit Form to Google Sheets`. _Make sure to wait for it to actually save and update the title before editing the script._
- Now, delete the `function myFunction() {}` block within the `Code.gs` tab.
- Paste the following script in it's place and `File > Save`:

```js
var sheetName = 'Sheet1'
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup () {
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

- Next, go to `Run > setup` to run this function.
- In the `Authorization Required` dialog, click on `Review Permissions`.
- Sign in or pick the Google account associated with this projects.
- You should see a dialog that says `Hi {Your Name}`, `Submit Form to Google Sheets wants to`...
- Click `Allow`

## 4. Add a new project trigger 
- Click on `Edit > Current project’s triggers`. 
- In the dialog click `No triggers set up. Click here to add one now.` 
- In the dropdowns select `doPost`
- Set the events fields to `From spreadsheet` and `On form submit`
- Then click `Save`

## 5. Publish the project as a web app

- Click on `Publish > Deploy as web app…`.
- Set `Project Version` to `New` and put `initial version` in the input field below.
- Leave `Execute the app as:` set to `Me(your@address.com)`.
- For `Who has access to the app:` select `Anyone, even anonymous`.
- Click `Deploy`.
- In the popup, copy the `Current web app URL` from the dialog.
- And click `OK`.

> **IMPORTANT!** If you have a custom domain with Gmail, you _might_ need to click `OK`, refresh the page, and then go to `Publish > Deploy as web app…` again to get the proper web app URL. It should look something like `https://script.google.com/a/yourdomain.com/macros/s/XXXX…`.

## 6. Input your web app URL

Open the file named `index.html`. On line 12 replace `<SCRIPT URL>` with your script url:

```js
<form name="submit-to-google-sheet">
  <input name="email" type="email" placeholder="Email" required>
  <button type="submit">Send</button>
</form>

<script src="https://unpkg.com/promise-polyfill/promise.min.js"></script>
<script src="https://unpkg.com/whatwg-fetch/fetch.js"></script>

<script>
  const scriptURL = '<SCRIPT URL>'
  const form = document.forms['submit-to-google-sheet']

  form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
      .then(response => console.log('Success!', response))
      .catch(error => console.error('Error!', error.message))
  })
</script>
```

As you can see, this script uses the the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), a fairly new promise-based mechanism for making web requests. It makes a "POST" request to your script URL and passes our form data as URL paramters.

Because Fetch is new, we'll need to first include a couple of polyfills to make sure it works on older browsers. The first is the [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill) and and the second is [GitHub's fetch polyfill](https://github.com/github/fetch). 

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
- [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill)
- [Fetch Polyfill](https://github.com/github/fetch)
- [HTML `<form>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form)
- [Document.forms](https://developer.mozilla.org/en-US/docs/Web/API/Document/forms)
