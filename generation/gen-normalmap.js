// > npm install node-png --save
// > npm install seedrandom

var fs = require('fs'),
    PNG = require('node-png').PNG,
    seedrandom = require('seedrandom').xor4096;

var type = process.argv[2] || 'death-metal';
var sz = parseInt(process.argv[3] || '1024');
var outfilePNG = (process.argv[4] || 'out') + '.png';
var outfile = fs.createWriteStream(outfilePNG);
var png = new PNG({width: sz, height: sz});

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

var hmap = newArr(sz, 0.0);
var bmap = newArr(sz, 1.0);

var prepComp = function(v) {
    return Math.max(0, Math.min(255, Math.floor(v * 255)));
};

Math.random2d = function(x,y) {
    var x2 = 12.9898, y2 = 78.233;
    x += 1000; y += 1000;
    if (x === 0)
        x = 0.0001;
    var dot = (x*x2 + y*y2);// / (Math.sqrt(x*x+y*y) * Math.sqrt(x2*x2+y2*y2));
    var whole = (Math.sin(dot)*0.5+0.5) * 43758.5453;
    return whole - Math.floor(whole);
};

switch (type) {
    case 'death-metal':

        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var h = 0.0;
                h += Math.pow(2, -1) * Math.random2d(Math.floor(x/64), Math.floor(y/64));
                h += Math.pow(2, -2) * Math.random2d(Math.floor(x/23), Math.floor(y/23));
                //h += Math.pow(2, -4) * Math.random2d(Math.floor(x/6), Math.floor(y/6));
                hmap.set(x, y, h);
                bmap.set(x, y, h)
            }
        }

        for (var i=0; i<50; i++) {

            var w = Math.pow(Math.random(), 3.0) * 3 + 1;

            var x = Math.floor(Math.random() * sz / (32)) * (32);
            var y = Math.floor(Math.random() * sz / (32)) * (32);

            w = (w-1) * 2 + 1;

            var r = Math.random();
            var dx = r < 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
            var dy = r > 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
            

            var dent = Math.random() < 0.2 ? -1 : 1;

            var len = Math.floor(Math.pow(Math.random(),0.1)*sz);

            for (var j=0; j<len; j++) {

                for (var w0=0; w0<=w; w0++) {

                    var x0 = x + dx * j + w0 * dy,
                        y0 = y + dy * j + w0 * dx;
                    var x1 = x + dx * j - w0 * dy,
                        y1 = y + dy * j - w0 * dx;
                    var h = w/(w0+1)*0.05;
                    if (dent < 0) {
                        h *= -0.5;
                        hmap.set(x0, y0, Math.min(hmap.get(x0, y0), h));
                        hmap.set(x1, y1, Math.min(hmap.get(x1, y1), h));
                        bmap.set(x0, y0, Math.min(hmap.get(x0, y0), h));
                        bmap.set(x1, y1, Math.min(hmap.get(x1, y1), h));
                    }
                    else {
                        h += 1.0;
                        hmap.set(x0, y0, Math.max(hmap.get(x0, y0), h));
                        hmap.set(x1, y1, Math.max(hmap.get(x1, y1), h));
                        bmap.set(x0, y0, Math.max(hmap.get(x0, y0), h));
                        bmap.set(x1, y1, Math.max(hmap.get(x1, y1), h));
                    }
                }
            }

        }

        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                bmap.set(x, y, Math.pow(bmap.get(x, y), 1.0))
            }
        }

        break;
    default:
        break;
}

var dat = png.data;
for (var i=0; i<dat.length; i+=4) {

    var x = (i/4) % sz, y = ((i/4)-(i/4)%sz)/sz;

    var sx = hmap.get(x+1, y) - hmap.get(x-1, y);
    var sy = hmap.get(x, y+1) - hmap.get(x, y-1);

    var dx = -sx*64, dy = 2; dz = sy*64;
    var len = Math.sqrt(dx*dx+dy*dy+dz*dz);
    if (len < 0.000001) {
        dx = dy = dz = 0.0;
    }
    else {
        dx /= len; dy /= len; dz /= len;
    }

    dat[i]   = prepComp((dx + 1.0) * 0.5);
    dat[i+2] = prepComp((dy + 1.0) * 0.5);
    dat[i+1] = prepComp((dz + 1.0) * 0.5);
    dat[i+3] = prepComp(bmap.get(x, y));
}

png.pack().pipe(outfile).on('close', function(){
    //images(outfilePNG).save(outfileJPG, {quality: 100});
});