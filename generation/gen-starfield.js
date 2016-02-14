// > npm install node-png --save

var fs = require('fs'),
    PNG = require('node-png').PNG;

var nstars = parseInt(process.argv[2] || '200');
var sz = parseInt(process.argv[3] || '512');
var outfilePNG = (process.argv[4] || 'out') + '.png';
var outfile = fs.createWriteStream(outfilePNG);
var png = new PNG({width: sz, height: sz});

var stars = new Array(nstars);
for (var i=0; i<nstars; i++) {
    var r = Math.pow(Math.random(), 6.0) * sz * 0.05 + 0.001 * sz;
    var x = Math.random() * (sz - r*2) + r;
    var y = Math.random() * (sz - r*2) + r;
    stars[i] = {
        x: x,
        y: y,
        r: r,
        type: Math.floor(Math.pow(Math.random(), 4.0) * 3)
    };
}

var scaleClamp = function(v) {
    return Math.max(0, Math.min(255, Math.floor(v * 255)));
};

var dat = png.data;
for (var i=0; i<dat.length; i+=4) {
    var r = 0, g = 0, b = 0, a = 0;
    var x = ((i/4)%sz) + 0.5, y = (((i/4)-((i/4)%sz))/sz) + 0.5;
    for (var j=0; j<stars.length; j++) {
        var dx = stars[j].x - x,
            dy = stars[j].y - y;
        var len = Math.abs(dx) + Math.abs(dy);
        var v = stars[j].r / (0.001 + len*len*len);
        a += v;
        if (stars[j].type === 0) {
            r += v; g += v * 0.75; b += v * 0.75;
        }
        else if (stars[j].type === 1) {
            b += v;
            g += v * 0.5;
            r += v * 0.5;
        }
        else if (stars[j].type === 2) {
            r += v;
            g += v * 0.5;
            b += v * 0.5;
        }
    }
    dat[i]   = scaleClamp(r);
    dat[i+1] = scaleClamp(g);
    dat[i+2] = scaleClamp(b);
    dat[i+3] = scaleClamp(a);
}

png.pack().pipe(outfile).on('close', function(){
    //images(outfilePNG).save(outfileJPG, {quality: 100});
});