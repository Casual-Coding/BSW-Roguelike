// > npm install node-png --save

var fs = require('fs'),
    PNG = require('node-png').PNG,
    NS = require('./navier-stokes').NavierStokes;

var fwidth = 9, fheight = 5;
var frameSkip = 1;
var smooth = 0;
var startSkip = Math.floor(fwidth*1.5);

var sz = parseInt(process.argv[2] || '256');
var outfile = fs.createWriteStream((process.argv[3] || 'out') + '.png');
var png = new PNG({width: sz*fwidth, height: sz*fheight});

var newArr = function(size, val) {
    var len = size * size;
    var ret = new Array(len);
    for (var i=0; i<len; i++) {
        ret[i] = val;
    }
    ret.size = len;
    ret.get = function(x, y) {
        if (x < 0 || y < 0 || x >= size || y >= size) {
            return val;
        }
        return this[Math.floor(x)+Math.floor(y)*size];
    };
    ret.set = function(x, y, val) {
        if (x < 0 || y < 0 || x >= size || y >= size) {
            return;
        }
        this[Math.floor(x)+Math.floor(y)*size] = val;
    };
    ret.inc = function(x, y, val) {
        if (x < 0 || y < 0 || x >= size || y >= size) {
            return;
        }
        this[Math.floor(x)+Math.floor(y)*size] += val;
    };
    return ret;
};

var nsArrayWrap = function(size, array) {
    var ret = new Object();
    ret.get = function(x, y, b) {
        b = b || 0;
        if (x < (-1+b) || y < (-1+b) || x > (size-b) || y > (size-b)) {
            return 0.0;
        }
        return array[Math.floor(x+1)+Math.floor(y+1)*(size+2)];
    };
    ret.set = function(x, y, val) {
        if (x < -1 || y < -1 || x > size || y > size) {
            return;
        }
        array[Math.floor(x+1)+Math.floor(y+1)*(size+2)] = val;
    };
    ret.inc = function(x, y, val) {
        if (x < -1 || y < -1 || x > size || y > size) {
            return;
        }
        array[Math.floor(x+1)+Math.floor(y+1)*(size+2)] += val;
    };
    return ret;
}

var pcount = Math.floor(125000*Math.pow(sz/768, 1.5));
var heatTransferRate = 0.5;
var heatDisRate = 0.95;
var pdamping = 0.995;
var nframes = (fwidth * fheight) * (frameSkip + 1);

var ex = {
    heat: newArr(sz, 0.0),
    xv: null,
    yv: null,
    part: new Array(pcount),
};

for (var i=0; i<pcount; i++) {
    var r = Math.random()*3, a = Math.random()*Math.PI*2.0;
    ex.part[i] = {
        x: sz/2 + Math.cos(a)*r,
        y: sz/2 + Math.sin(a)*r,
        xv: 0,
        yv: 0,
        heat: 10000.0
    };
}

var pal = [];
for (var i=0; i<64; i++) {
    pal.push([i, i, i]);
}
for (var i=0; i<64; i++) {
    pal.push([63+i*3, 63-i, 63-i]);
}
for (var i=0; i<64; i++) {
    pal.push([255, i*4, 0]);
}
for (var i=0; i<64; i++) {
    pal.push([255, 255, (i+1)*4])
}

var lut = new Array();

for (var xx=-3; xx<=3; xx++) {
    for (var yy=-3; yy<=3; yy++) {
        if (!xx && !yy) {
            continue;
        }
        var len = Math.sqrt(xx*xx+yy*yy);
        var dx = xx/len, dy = yy/len;
        var mag = 1.0 / len;
        lut.push([dx * mag, dy * mag]);
    }
}

var pngSub = new PNG({width: sz, height: sz, palette: true});
var smoothBfr = [
    newArr(sz, 0.0),
    newArr(sz, 0.0)
];

var nstokes = new NS({

    diffusion: 0.8,
    resolution: sz

});

var rframe = 0;
for (var frame=-startSkip; frame<nframes; frame++) {

    nstokes.update(function(D, U, V, res){

        ex.heat2 = nsArrayWrap(sz, D);
        ex.xv = nsArrayWrap(sz, U);
        ex.yv = nsArrayWrap(sz, V);

        for (var i=0; i<pcount; i++) {
            var p = ex.part[i];
            var heat = Math.min(p.heat*heatTransferRate, 1.0);
            ex.heat.inc(p.x-1, p.y-1, heat/8.8);
            ex.heat.inc(p.x-1, p.y+1, heat/8.8);
            ex.heat.inc(p.x+1, p.y-1, heat/8.8);
            ex.heat.inc(p.x+1, p.y+1, heat/8.8);
            ex.heat.inc(p.x-1, p.y, heat/4);
            ex.heat.inc(p.x+1, p.y, heat/4);
            ex.heat.inc(p.x, p.y-1, heat/4);
            ex.heat.inc(p.x, p.y+1, heat/4);
            ex.heat.inc(p.x, p.y, heat);
            var len = Math.sqrt(p.xv*p.xv+p.yv*p.yv);
            if (len > 0) {
                var nx = p.xv / len, ny = p.yv / len;
                if (len > 50.0) {
                    len = 50.0;
                }
                ex.xv.inc(p.x, p.y, nx*len*heat/10.0);
                ex.yv.inc(p.x, p.y, ny*len*heat/10.0);
            }
            p.heat -= p.heat * heatTransferRate;
        }

        for (var i=0; i<pcount; i++) {
            var p = ex.part[i];
            var tot = 0.0
            var h0 = ex.heat.get(p.x, p.y);

            var x = 0, y = 0, k = 0;

            for (var xx=-3; xx<=3; xx++) {
                for (var yy=-3; yy<=3; yy++) {
                    if (!xx && !yy) {
                        continue;
                    }
                    var h = ex.heat.get(p.x+xx, p.y+yy) - h0;
                    x += lut[k][0] * h;
                    y += lut[k][1] * h;
                    k += 1;
                }
            }

            var htransfer = Math.max(h0 - ex.heat.get(p.x+x, p.y+y), 0.01);
            p.heat += htransfer * heatTransferRate;
            ex.heat.set(p.x, p.y, Math.max(ex.heat.get(p.x, p.y) - htransfer, 0.0));
           
            p.xv += x * htransfer;
            p.yv += y * htransfer;

            p.xv *= pdamping;
            p.yv *= pdamping;

            p.x += p.xv/7.5;
            p.y += p.yv/7.5;
        }

        for (var i=0; i<(sz*sz); i++) {
            var x = i%sz, y = (i-(i%sz)) / sz;
            var h = ex.heat[i];
            ex.heat[i] = h * heatDisRate;
            ex.heat2.inc(x, y, h);
        }

    }, function(D, U, V, res){

        if (frame < 0)
            return;

        ex.heat2 = nsArrayWrap(sz, D);
        ex.xv = nsArrayWrap(sz, U);
        ex.yv = nsArrayWrap(sz, V);

        var t = Math.max(0, 1.0 - Math.pow(frame/nframes, 8.0));

        var k = 0;
        for (var i=0; i<(sz*sz); i++) {
            var x = i%sz, y = (i-(i%sz)) / sz;
            var h = ex.heat2.get(x, y);
            smoothBfr[k][i] = h;
        }
        for (; k<smooth; k++) {
            var k1 = k%2;
            var k2 = 1-k1;
            for (var x=0; x<sz; x++) {
                for (var y=0; y<sz; y++) {
                    smoothBfr[k2].set(
                        x, y,
                        (smoothBfr[k1].get(x, y)*0.65 + (smoothBfr[k1].get(x-1, y) + smoothBfr[k1].get(x+1, y) + smoothBfr[k1].get(x, y-1) + smoothBfr[k1].get(x, y+1)) * 0.35 * 0.25)
                    )
                }
            }
        }

        var dat = pngSub.data;
        for (var i=0; i<dat.length; i+=4) {
            var x = (i/4)%sz, y = (i/4-((i/4)%sz)) / sz;
            var vel = Math.sqrt(Math.pow(ex.xv.get(x,y), 2.0) + Math.pow(ex.yv.get(x,y), 2.0));
            var vv = smoothBfr[k%2][i/4];
            var v = Math.floor(Math.pow(Math.min(vv, 1), 0.5) * 255 * t);
            if (v < 63) {
                //v = Math.floor(v/4);
                //ex.heat[i/4] *= 0.4;
            }
            dat[i]   = pal[v][0];
            dat[i+1] = pal[v][1];
            dat[i+2] = pal[v][2];
            dat[i+3] = Math.floor(v * Math.min((vel+vv/6.0)*10.0, 1.0));
        }

        if (!(frame%(frameSkip+1))) {
            pngSub.pack().bitblt(png, 0, 0, sz, sz, (rframe%fwidth) * sz, Math.floor(rframe/fwidth) * sz);
            rframe += 1;
        }

    });

}

png.pack().pipe(outfile);