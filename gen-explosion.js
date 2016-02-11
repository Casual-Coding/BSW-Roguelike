// > npm install node-png --save

var fs = require('fs'),
    PNG = require('node-png').PNG;

var sz = parseInt(process.argv[2] || '768');
var outfile = fs.createWriteStream((process.argv[3] || 'out') + '.png');
var png = new PNG({width: sz*12, height: sz*10});

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

var pcount = ~~(50000*Math.pow(sz/768, 1.5));
var heatTransferRate = 0.95;
var heatDisRate = 0.9;
var pdamping = 0.995;
var nframes = 2 * 60;

var ex = {
    heat: newArr(sz, 0.0),
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

for (var frame=0; frame<nframes; frame++) {

    for (var i=0; i<pcount; i++) {
        var p = ex.part[i];
        var heat = Math.min(p.heat*heatTransferRate, 1.0);
        ex.heat.inc(p.x-1, p.y-1, heat/2.2);
        ex.heat.inc(p.x-1, p.y+1, heat/2.2);
        ex.heat.inc(p.x+1, p.y-1, heat/2.2);
        ex.heat.inc(p.x+1, p.y+1, heat/2.2);
        ex.heat.inc(p.x-1, p.y, heat/2);
        ex.heat.inc(p.x+1, p.y, heat/2);
        ex.heat.inc(p.x, p.y-1, heat/2);
        ex.heat.inc(p.x, p.y+1, heat/2);
        ex.heat.inc(p.x, p.y, heat);
        p.heat -= p.heat * heatTransferRate;
    }

    var t = Math.max(0, 1.0 - Math.pow(frame/nframes, 8.0));

    var dat = pngSub.data;
    for (var i=0; i<dat.length; i+=4) {
        var vv = ex.heat[i/4];
        vv += (i/4>=1?ex.heat[i/4-1]:0) + (i/4<(sz*sz-1)?ex.heat[i/4+1]:0) + (i/4>=sz?ex.heat[i/4-sz]:0) + (i/4<(sz*sz-sz)?ex.heat[i/4+sz]:0);
        vv /= 5;
        var v = Math.floor(Math.pow(Math.min(vv / 10, 1), 0.5) * 255 * t);
        dat[i]   = pal[v][0];
        dat[i+1] = pal[v][1];
        dat[i+2] = pal[v][2];
        dat[i+3] = v;
        ex.heat[i/4] *= heatDisRate;
    }

    pngSub.pack().bitblt(png, 0, 0, sz, sz, (frame%12) * sz, Math.floor(frame/12) * sz);

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

}

png.pack().pipe(outfile);