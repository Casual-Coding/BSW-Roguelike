// > npm install connect serve-static

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080);
console.log('Running on 127.0.0.1:8080');