// > npm install node-png --save

var spawn = require('child_process').spawn;
var sz = parseInt(process.argv[2] || '256');
var count = parseInt(process.argv[3] || '5');

var waiting = count;

for (var i=0; i<count; i++) {
    var ge = spawn('node', ['gen-normalmap.js', 'cloud', ''+sz, '../images/cloud-' + sz + '-' + i]);
    ge.on('close', function(code) {
        console.log((--waiting) + ' left');
    });
}