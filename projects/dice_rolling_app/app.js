const HTTP = require('http');
const PORT = 3000;

const SERVER = HTTP.createServer((req, res) => {

  function dieRoll() {
    return Math.ceil(Math.random() * 6);
  }


  let method = req.method;
  let path = req.url;

  if (path === '/favicon.ico') {
   res.statusCode = 404;
   res.end();
 } else {
   let roll = dieRoll();

   res.statusCode = 200;
   res.setHeader('Content-Type', 'text/plain');
   res.write(`${method} ${path}\n`);
   res.write(`${roll}\n`);
   res.end();
 }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
