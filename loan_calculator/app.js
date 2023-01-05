/*
NOTE ON MY SOLUTION BELOW: Would have been better to declare the functions that help generate dynamic content (i.e. calculateMonthlyPayment & toDollars) outside of the HTTP.createServer invocation.

This would help keep that part of the program separate from the part that actually deals with incoming HTTP requests and outgoing responses.
*/

const HTTP = require('http');
const URL = require('url').URL;
const PORT = 3000;
const APR = 5;

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

    let params = getParams(path);
    let amount = Number(params.get('amount'));
    let duration = Number(params.get('duration'));
    let monthly = calculateMonthlyPayment(amount, duration);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(
      `Amount: ${toDollars(amount)}\nDuration: ${duration} years\nAPR: ${APR}%\nMonthly payment: ${monthly}`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
