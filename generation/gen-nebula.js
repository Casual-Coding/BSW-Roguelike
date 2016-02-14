// > npm install node-png --save

var fs = require('fs'),
    PNG = require('node-png').PNG,
    NavierStokes = require('./navier-stokes');
var NS = NavierStokes.NavierStokes,
    nsArrayWrap = NavierStokes.ArrayWrap;

var clr = (process.argv[2] || 'rbg').toLowerCase();
var sz = parseInt(process.argv[3] || '512');
var outfilePNG = (process.argv[4] || 'out') + '.png';
var outfile = fs.createWriteStream(outfilePNG);
var png = new PNG({width: sz, height: sz});

var nstokes = new NS({

    diffusion: 0.95,
    resolution: sz

});

var circles = new Array();
var nCircles = 40;
var circleSz0 = sz * 0.2;
var maxInter = 0.95;
var bfr = sz * 0.1;
var nframes = 60;

var clrRot = function(c, l) {

    var o = new Array(3);
    if (c.charAt(0) === 'r') {
        o[0] = l[0];
    }
    else if (c.charAt(0) === 'g') {
        o[1] = l[0];
    }
    else if (c.charAt(0) === 'b') {
        o[2] = l[0];
    }
    if (c.charAt(1) === 'r') {
        o[0] = l[2];
    }
    else if (c.charAt(1) === 'g') {
        o[1] = l[2];
    }
    else if (c.charAt(1) === 'b') {
        o[2] = l[2];
    }
    if (c.charAt(2) === 'r') {
        o[0] = l[1];
    }
    else if (c.charAt(2) === 'g') {
        o[1] = l[1];
    }
    else if (c.charAt(2) === 'b') {
        o[2] = l[1];
    }
    return o;

};

var pal = new Array();
for (var i=0; i<96; i++) {
    pal.push(clrRot(clr, [~~(i*256/96), 0, 0]));
}
for (var i=0; i<96; i++) {
    pal.push(clrRot(clr, [255, 0.0, ~~(i*256/96)]));
}
for (var i=0; i<64; i++) {
    pal.push(clrRot(clr, [255, i*4, 255]));
}

for (var i=0; i<nCircles; i++) {
    var radVel = ((Math.random() * 0.5) + 0.5) * (Math.random() < 0.5 ? -1 : 1);
    if (i === 0) {
        circles.push({
            x: sz/2 + Math.random() * circleSz0 * 0.5 - circleSz0 * 0.25,
            y: sz/2 + Math.random() * circleSz0 * 0.5 - circleSz0 * 0.25,
            r: circleSz0 * 0.5,
            radVel: radVel
        });
    }
    else {
        var k = 0;
        while (++k < 1000) {
            var j = Math.floor(Math.random() * circles.length);
            var angle = Math.random() * Math.PI * 2.0;
            var r2 = (Math.random() * 0.25 + 0.5) * circles[j].r;
            var x = circles[j].x + Math.cos(angle) * (r2 + circles[j].r) * maxInter;
            var y = circles[j].y + Math.sin(angle) * (r2 + circles[j].r) * maxInter;
            if ((x-r2) < bfr || (y-r2) < bfr || (x+r2) >= (sz-bfr) || (y+r2) >= (sz-bfr)) {
                continue;
            }
            var valid = true;
            for (var l=0; l<circles.length; l++) {
                var dx = x - circles[l].x,
                    dy = y - circles[l].y;
                var len = Math.sqrt(dx*dx + dy*dy);
                if (len < (r2+circles[l].r)*maxInter) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                circles.push({
                    x: x,
                    y: y,
                    r: r2,
                    radVel: radVel
                });
                break;
            }
        }
    }
}

var bfr = new Array(sz*sz);
for (var i=0; i<sz*sz; i++) {
    bfr[i] = 0.0;
}
var randBfr = new Array(sz*sz);
for (var i=0; i<sz*sz; i++) {
    randBfr[i] = [Math.random(), Math.random()];
}

for (var frame=0; frame<nframes; frame++) {

    nstokes.update(function(D, U, V, res){

        var dw = nsArrayWrap(sz, D);
        var uw = nsArrayWrap(sz, U);
        var vw = nsArrayWrap(sz, V);

        if (frame>9) {
            if (!(frame % 4)) {
                for (var x=0; x<sz; x++)  {
                    for (var y=0; y<sz; y++) {
                        uw.set(x, y, -uw.get(x, y));
                        vw.set(x, y, -vw.get(x, y));
                    }
                }
            }
            return;
        }

        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                for (var k=0; k<circles.length; k++) {
                    var dx = x - circles[k].x,
                        dy = y - circles[k].y;
                    var len = Math.sqrt(dx*dx + dy*dy);
                    var dist = circles[k].r - len;
                    if (dist < 0.0) {
                        dist = dist * dist;
                    }
                    else {
                        dist = dist;
                        if (frame < 5) {
                            dw.inc(x, y, dist/circles[k].r);
                        }
                    }
                    var i = Math.floor((x+y*sz)/8)*8;
                    var mag = 1.0 / (dist + 1.0);
                    var tx = -dy / len * circles[k].radVel + (randBfr[i][0]*0.5-0.25)*8.0,
                        ty = dx / len * circles[k].radVel + (randBfr[i][1]*0.5-0.25)*8.0;
                    uw.inc(x, y, tx * mag/sz*256.0*8.0);
                    vw.inc(x, y, ty * mag/sz*256.0*8.0);
                }
            }
        }

        console.log(frame + ' end');

    }, function(D, U, V, res){

        var dw = nsArrayWrap(sz, D);

        if (frame >= 5 && (!(frame%8) || frame === (nframes-1))) {
            for (var i=0; i<(sz*sz); i++) {
                var x = i%sz, y = (i-(i%sz)) / sz;
                bfr[i] += (dw.get(x, y) * 0.5 + (dw.get(x-1, y) * 0.5 * 0.25)
                                              + (dw.get(x+1, y) * 0.5 * 0.25)
                                              + (dw.get(x, y-1) * 0.5 * 0.25)
                                              + (dw.get(x, y-1) * 0.5 * 0.25)) * 4.0;
            }
        }

        if (frame < (nframes-1)) {
            return;
        }

        var dat = png.data;
        for (var i=0; i<dat.length; i+=4) {
            var vv = bfr[i/4];
            var v = Math.floor(Math.pow(Math.min(vv/4.0, 1), 0.7) * 255);
            dat[i]   = pal[v][0];
            dat[i+1] = pal[v][1];
            dat[i+2] = pal[v][2];
            dat[i+3] = Math.floor(Math.pow(v/255, 0.35)*255);
        }

    });

}

png.pack().pipe(outfile).on('close', function(){
    //images(outfilePNG).save(outfileJPG, {quality: 100});
});