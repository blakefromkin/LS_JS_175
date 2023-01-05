// Update the previous application to accept user input in the form of a query string
// User can determine how many dice to roll and number of sides on the dice

const HTTP = require('http');
const URL = require('url').URL;
const PORT = 3000;

const SERVER = HTTP.createServer((req, res) => {

  function dieRoll() {
    return Math.ceil(Math.random() * sides);
  }

  function rollDice(rolls) {
    while (rolls > 0) {
      let roll = dieRoll();
      body += `${roll}\n`;
      rolls -= 1;
    }
    return body;
  }

  function getParams(path) {
    let myURL = new URL(path, `http://localhost:${PORT}`);
    return myURL.searchParams;
  }

  let method = req.method;
  let path = req.url;
  let params = getParams(path);
  let rolls = Number(params.get('rolls'));
  let sides = Number(params.get('sides'));

  if (path === '/favicon.ico') {
   res.statusCode = 404;
   res.end();
 } else {
   let body = rollDice(rolls);

   res.statusCode = 200;
   res.setHeader('Content-Type', 'text/plain');
   res.write(`${body}`);
   res.write(`${method} ${path}\n`);
   res.end();
 }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
