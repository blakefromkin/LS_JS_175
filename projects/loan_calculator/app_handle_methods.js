/*
This version has logic to handle POST requests to /loan-offer as well as GET requests to that same path. (The POST requests will come from the form, while the GET requests will come from our anchor elements)
*/

const HTTP = require('http');
const URL = require('url').URL;
const QUERYSTRING = require('querystring');
const PATH = require('path');
const FS = require('fs');
const PORT = 3000;
const HANDLEBARS = require('handlebars');
const APR = 5;
const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const LOAN_OFFER_SOURCE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/loan-offer?amount={{amountDecrement}}&duration={{duration}}'>- $100</a>
            </td>
            <td>$ {{amount}}</td>
            <td>
              <a href='/loan-offer?amount={{amountIncrement}}&duration={{duration}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationDecrement}}'>- 1 year</a>
            </td>
            <td>{{duration}} years</td>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>$ {{payment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>
`;

const LOAN_FORM_SOURCE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <form action="/loan-offer" method="post">
        <p>All loans are offered at an APR of {{apr}}%.</p>
        <label for="amount">How much do you want to borrow (in dollars)?</label>
        <input type="number" name="amount" value="">
        <label for="amount">How much time do you want to pay back your loan?</label>
        <input type="number" name="duration" value="">
        <input type="submit" name="" value="Get loan offer!">
      </form>
    </article>
  </body>
</html>
`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_SOURCE);
const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_SOURCE);

function render(template, data) {
  let html = template(data);
  return html;
}

function parseFormData(request, callback) {
  let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', () => {
      let data = QUERYSTRING.parse(body);
      data.amount = Number(data.amount);
      data.duration = Number(data.duration);
      callback(data);
    });
};

/*
From LS:
The parseFormData() function is a little bit complex but we'll try and summarize it here. It is based on the fact that the request body is essentially a stream of data; for Node to access the request body it needs to work with this data stream. The function contains two event listeners, one for when the data stream starts, and another for when it ends. You don't really need to worry about these too much, just understand that they effectively allow us to access and work with the data in the request body. The request body contains the data we submitted in the form in a querystring-like format: amount=10000&duration=5. Passing this data to QUERYSTRING.parse() returns an object with amount and duration properties. This object is passed to the callback that was passed as an argument to parseFormData().
*/

function getParams(path) {
  const myURL = new URL(path, `http://localhost:${PORT}`);
  let searchParams = myURL.searchParams;
  let data = {};
  data.amount = Number(searchParams.get('amount'));
  data.duration = Number(searchParams.get('duration'));

  return data;
};

function getPathname(path) {
  const myURL = new URL(path, `http://localhost:${PORT}`);
  return myURL.pathname;
};

function calculateLoan(amount, duration, apr) {
  let annualInterestRate = apr / 100;
  let monthlyInterestRate = annualInterestRate / 12;
  let months = Number(duration) * 12;
  let payment = amount *
          (monthlyInterestRate /
          (1 - Math.pow((1 + monthlyInterestRate),(-months))));

  return payment.toFixed(2);
};

function createLoanOffer(data) {
  data.amountIncrement = data.amount + 100;
  data.amountDecrement = data.amount - 100;
  data.durationIncrement = data.duration + 1;
  data.durationDecrement = data.duration - 1;
  data.apr = APR;
  data.payment = calculateLoan(data.amount, data.duration, APR);

  return data;
};

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url;
  let pathname = getPathname(path);
  let fileExtension = PATH.extname(pathname);

  FS.readFile(`./public/${pathname}`, (err, data) => {
    if (data) {
      res.statusCode = 200;
      res.setHeader('Content-Type', `${MIME_TYPES[fileExtension]}`);
      res.write(`${data}\n`);
      res.end();
    } else {
      let method = req.method;
      if (method === 'GET' && pathname === '/') {
        let content = render(LOAN_FORM_TEMPLATE, {apr: APR});

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else if (method === 'GET' && pathname === '/loan-offer') {
        let data = createLoanOffer(getParams(path));
        let content = render(LOAN_OFFER_TEMPLATE, data);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else if (method === 'POST' && pathname === '/loan-offer') {
        parseFormData(req, parsedData => {
          let data = createLoanOffer(parsedData);
          let content = render(LOAN_OFFER_TEMPLATE, data);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.write(`${content}\n`);
          res.end();
        });
      } else {
        res.statusCode = 404;
        res.end();
      }
    }
  });
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
