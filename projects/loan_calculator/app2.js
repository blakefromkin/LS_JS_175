/*
This version simulates state through hyperlinks by allowing the user to increment or decrement the amount & duration values.
*/

const HTTP = require('http');
const URL = require('url').URL;
const PORT = 3000;
const APR = 5;

const HTML_START = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 2rem;
      }

      th {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>`;

const HTML_END = `
    </article>
  </body>
</html>`;

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url;
  let method = req.method;

  function getParams(path) {
    let myURL = new URL(path, `http://localhost:${PORT}`);
    return myURL.searchParams;
  }

  if (path === '/favicon.ico') {
   res.statusCode = 404;
   res.end();
  } else {
    function calculateMonthlyPayment(amt, dur) {
      dur = 12 * dur;
      let int = (APR / 100) / 12;
      let monthly = amt * (int / (1 - Math.pow((1 + int), (-dur))));
      return toDollars(monthly);
    }

    function toDollars(num) {
      return `$${num.toFixed(2)}`;
    }

    function generateHTML(amount, duration, monthly) {
      let table =
      `
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/?amount=${amount - 100}&duration=${duration}'>- $100</a>
            </td>
            <td>${amount}</td>
            <td>
              <a href='/?amount=${amount + 100}&duration=${duration}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/?amount=${amount}&duration=${duration - 1}'>- 1 year</a>
            </td>
            <td>${duration} years</td>
            <td>
              <a href='/?amount=${amount}&duration=${duration + 1}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>${APR}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>${monthly}</td>
          </tr>
        </tbody>
      </table>`;

      return HTML_START + table + HTML_END;
    }

    let params = getParams(path);
    let amount = Number(params.get('amount'));
    let duration = Number(params.get('duration'));
    let monthly = calculateMonthlyPayment(amount, duration);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(generateHTML(amount, duration, monthly));
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
