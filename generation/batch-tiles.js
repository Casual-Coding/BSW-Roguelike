// > npm install node-png --save

var spawn = require('child_process').spawn;
var waiting = 0;
var sz = 512;
var tiles = [ 'rockland', 'sand', 'snow', 'land', 'below', 'mountain' ];

for (var i=0; i<tiles.length; i++) {
    waiting += 1;
    var ge = spawn('node', ['gen-tiles.js', tiles[i], ''+sz, '../images/tileset-' + tiles[i] + '-' + sz]);
    ge.on('close', function(code) {
        console.log((--waiting) + ' left');
    });
}