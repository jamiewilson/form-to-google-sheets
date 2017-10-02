<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>Form To Google Sheets Demo</title>
  <meta name="description" content="Store HTML form submissions in Google Sheets">
  <link href="./favicon.png" rel="shortcut icon">

  <link rel="stylesheet" href="main.css">
  <script src="https://unpkg.com/prefixfree@1.0.0/prefixfree.min.js"></script>

  <script src="https://wzrd.in/standalone/formdata-polyfill@latest"></script>
  <script src="https://wzrd.in/standalone/promise-polyfill@latest"></script>
  <script src="https://wzrd.in/standalone/whatwg-fetch@latest"></script>
</head>
<body>

  <div class="form-container">
    <form name="submit-to-google-sheet">
      <input name="email" type="email" placeholder="Email" required>
      <input name="firstName" type="text" placeholder="First Name">
      <input name="lastName" type="text" placeholder="Last Name">
      <button type="submit">Subscribe</button>
    </form>

    <div class="loading js-loading is-hidden">
      <div class="loading-spinner">
        <svg><circle cx="25" cy="25" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg>
      </div>
    </div>

    <p class="js-success-message is-hidden">Success!</p>
    <p class="js-error-message is-hidden">Error!</p>
  </div>

  <a href="https://docs.google.com/spreadsheets/d/16vDPkBwtMNNMzgbmKfxfOEqGZhtfJha097ZKB23dZdc/edit?usp=sharing" target="_blank">View the Google Sheet</a>
  <a href="https://github.com/jamiewilson/form-to-google-sheets" target="_blank">View on GitHub</a>

  <script>
    const scriptURL = 'https://script.google.com/a/stylesheets.co/macros/s/AKfycbzl3hk6JfWqMkVz8S1p5Txky_fscyNWJUCuQQHGHfVP5YLH99A/exec'
    const form = document.forms['submit-to-google-sheet']
    const loading = document.querySelector('.js-loading')
    const successMessage = document.querySelector('.js-success-message')
    const errorMessage = document.querySelector('.js-error-message')

    form.addEventListener('submit', e => {
      e.preventDefault()
      showLoadingIndicator()
      fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => showSuccessMessage(response))
        .catch(error => showErrorMessage(error))
    })

    function showLoadingIndicator () {
      form.classList.add('is-hidden')
      loading.classList.remove('is-hidden')
    }

    function showSuccessMessage (response) {
      console.log('Success!', response)
      setTimeout(() => {
        successMessage.classList.remove('is-hidden')
        loading.classList.add('is-hidden')
      }, 500)
    }

    function showErrorMessage (error) {
      console.error('Error!', error.message)
      setTimeout(() => {
        errorMessage.classList.remove('is-hidden')
        loading.classList.add('is-hidden')
      }, 500)
    }
  </script>

</body>
</html>
