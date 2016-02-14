// > npm install node-png --save

var spawn = require('child_process').spawn;
var sz = parseInt(process.argv[2] || '512');
var countNeb = parseInt(process.argv[3] || '3');
var countStars = parseInt(process.argv[4] || '15');
var nebTypes = [ 'rgb', 'gba', 'brg', 'bgr', 'rba' ];

var waiting = 0;

for (var i=0; i<(countNeb * nebTypes.length); i++) {
    waiting += 1;
    var ge = spawn('node', ['gen-nebula.js', nebTypes[i%nebTypes.length], ''+sz, '../images/nebula-' + sz + '-' + i]);
    ge.on('close', function(code) {
        console.log((--waiting) + ' left');
    });
}

for (var i=0; i<countStars; i++) {
    waiting += 1;
    var ge = spawn('node', ['gen-starfield.js', ''+100, ''+sz, '../images/stars-' + sz + '-' + i]);
    ge.on('close', function(code) {
        console.log((--waiting) + ' left');
    });
}