# Submit a Form to Google Sheets | [Demo](https://form-to-google-sheets.surge.sh)

#### How to create an HTML form that stores the submitted form data in Google Sheets using JavaScript, [Google Apps Script](https://developers.google.com/apps-script/), [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

### 🎉 2026 Updates

- You can specify a custom sheet name for each form submission by including a hidden input field with the name "sheet_name" in your HTML form.
- The Google Apps Script now sanitizes inputs to prevent CSV/Formula Injection by prepending a single quotation mark to any potentially harmful characters.
- Receive email notifications for new form submissions by enabling the email notification feature in the Google Apps Script.
- Added an `id` field to each form submission to uniquely identify each entry.
- Added an example of using a honeypot for better protection against spam submissions as well as some basic validation for required fields for extra protection

## 1. Create a new Google Sheet

- First, go to [Google Sheets](https://docs.google.com/spreadsheets) and `Start a new spreadsheet` with the `Blank` template.
- Rename it whatever, it doesn't matter.
- Put the following headers into the first row:

|     |  A  |     B     |   C   | ... |
| --- | :-: | :-------: | :---: | :-: |
| 1   | id  | timestamp | email |     |

> [!TIP]  
> To learn how to add additional input fields, [checkout section 7 below](#7-adding-additional-form-data).

## 2. Create a Google Apps Script

- Click on `Extensions > Apps Script` which should open a new tab.
- Rename it to whatever you want. _Make sure to wait for it to actually save and update the title before editing the script._
- Copy the contents of `form-script.js` and paste it into the `Code.gs` tab in the Script Editor.
- Press `File > Save`:

> [!TIP]  
> If you want to better understand what this script is doing, checkout the [`form-script-commented.js`](https://github.com/jamiewilson/form-to-google-sheets/blob/master/form-script-commented.js) file in the repo for a detailed explanation.

### Get notified of new submissions

If you want to receive email notifications on new submissions, make sure to replace the placeholder values with your actual email and name.

> [!TIP]  
> Thanks to @LandonMoss for the email notification feature

- Uncomment this function to your `Code.gs` file:

```js
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
```

- Then call it in the `try` block of the `doPost` function before the `return`:

```js
const emailSubject = 'New Form Submission'
const emailBody = 'A new submission has been added to row ' + nextRow
sendNewSubmissionEmailNotification(emailSubject, emailBody)
```

- And handle any errors with by calling it in the catch block:

```js
const errorSubject = 'Error in Form Submission'
const errorBody = 'Form submission error:\n' + e.toString()
sendNewSubmissionEmailNotification(errorSubject, errorBody)
```

## 3. Run the setup function

- Next, go to `Run > Run Function > initialSetup` to run this function.

> [!IMPORTANT]  
> If you're getting the **"Google hasn’t verified this app screen"**, you can click on `Advanced` and then `Go to Submit Form to Google Sheets (unsafe)`. This is because the script isn't verified by Google, but since you're the only one using it, I _think_ it's safe to proceed.

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

> [!IMPORTANT]  
> If you have a custom domain with Gmail, you _might_ need to click `OK`, refresh the page, and then go to `Publish > Deploy as web app…` again to get the proper web app URL. It should look something like `https://script.google.com/a/yourdomain.com/macros/s/XXXX…`.

## 6. Input your web app URL

Open `index.html`.

- Give your form a `name` attribute
- Replace `SCRIPT_URL` with your script url:
- Update `const form = document.forms['YOUR_FORM_NAME']` to match the `name` attribute of your form
- Specify sheet name in the value of the hidden input field

> [!NOTE]  
> Thanks to @lacabra for the sheet name feature

```html
<!-- Give your form a name  -->
<form name="YOUR_FORM_NAME">
	<!-- Specify the sheet that you want to store the submissions in -->
	<input type="hidden" name="sheet_name" value="YOUR_SHEET_NAME" />
	<!-- If this hidden input is not present, it defaults to 'Sheet1' -->

	<input name="email" type="email" placeholder="Email" required />
	<button type="submit">Send</button>
</form>

<script>
	const scriptURL = 'YOUR_SCRIPT_URL'
	const form = document.forms['YOUR_FORM_NAME']

	form.addEventListener('submit', e => {
		e.preventDefault()
		fetch(scriptURL, { method: 'POST', body: new FormData(form) })
			.then(response => response.json())
			.then(response => console.log('Success!', response))
			.catch(error => console.error('Error!', error.message))
	})
</script>
```

> [!TIP]  
> **Fun fact!** The `<html>`, `<head>`, and `body` tags are actually among a handful of optional tags, but since the [rules around how the browser parses a page are kinda complicated](https://www.w3.org/TR/2011/WD-html5-20110525/syntax.html#optional-tags), you'd probably not want to omit them on real websites.

## 7. Adding additional form data

To capture additional data, you'll just need to create new columns with titles matching exactly the `name` values from your form inputs. For example, if you want to add first and last name inputs, you'd give them `name` values like so:

```html
<form name="newsletter_form">
	<input name="email" type="email" placeholder="Email" required />
	<input name="firstName" type="text" placeholder="First Name" />
	<input name="lastName" type="text" placeholder="Last Name" />
	<button type="submit">Send</button>
</form>
```

Then create new headers with the exact, case-sensitive `name` values:

|     |  A  |     B     |   C   |     D     |    E     | ... |
| --- | :-: | :-------: | :---: | :-------: | :------: | :-: |
| 1   | id  | timestamp | email | firstName | lastName |     |

> [!IMPORTANT]  
> If you are using checkboxes for your forms, then use a unique `name` attribute for every checkbox option and add these unique names to the sheet to collect all responses. Thanks to @ashwinbalaji0811!

## 8. Security, Validation and Restrictions

#### Honeypot

Check out [examples/honeypot.html](https://github.com/jamiewilson/form-to-google-sheet/examples/honeypot.html) for an example of how to implement a honeypot field to help prevent spam submissions.

The default honeypot field is named `mobile_number`.

```html
<div class="form-helper">
	<label>If you are human, leave this blank:</label>
	<input type="text" name="mobile_number" />
</div>
```

In the `form-script.js` the parameter is checked here:

```js
// Changing the input name will require updating this check
// so if it's `name="my_new_name"`, these `e.parameter.my_new_name`
if (e.parameter.mobile_number && e.parameter.mobile_number !== '') {
	return ContentService.createTextOutput(
		JSON.stringify({ result: 'success', message: 'Bot detected' }),
	).setMimeType(ContentService.MimeType.JSON)
}
```

You can also add basic input validation and restrictions directly in your HTML form using attributes like `maxlength` and `pattern`. This helps prevent most accidental or low-level malicious attempts before anything gets sent to your Google Apps Script. For example, to restrict the first name input to a maximum of 50 characters and prevent it from starting with symbols like `=`, `+`, `-`, or `@`, you can use the following HTML:

```html
<input
	name="firstName"
	type="text"
	placeholder="First Name"
	maxlength="50"
	pattern="[^=+\-@].*"
	title="Names cannot start with symbols like =, +, -, or @" />
```

The google script sanitizes (by prepending a single quotation mark) and formats all inputs as plain text before inserting them into the spreadsheet. This ensures that any potentially harmful characters are neutralized and that the data is stored consistently.

> [!NOTE]  
> This means that any submissions that start with `=`, `+`, `-`, or `@` will be prepended with a single quote. This will not be visible in the cell but will be shown in the formula bar when the cell is selected.

---

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
