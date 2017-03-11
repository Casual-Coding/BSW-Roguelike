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
    ret.setBleed = function(x, y, val) {
        this.set(x, y, Math.min(val, 1));
        if (val > 1) {
            this.setBleed(x-1, y, (val-1)*0.25);
            this.setBleed(x+1, y, (val-1)*0.25);
            this.setBleed(x, y-1, (val-1)*0.25);
            this.setBleed(x, y+1, (val-1)*0.25);
        }
    };
    ret.incBleed = function(x, y, val) {
        this.inc(x, y, Math.max(-1, Math.min(val, 1)));
        if (val > 1) {
            this.incBleed(x-1, y, (val-1)*0.5);
            this.incBleed(x+1, y, (val-1)*0.5);
            this.incBleed(x, y-1, (val-1)*0.5);
            this.incBleed(x, y+1, (val-1)*0.5);
        }
        else if (val < -1) {
            this.incBleed(x-1, y, (val + 1)*0.5);
            this.incBleed(x+1, y, (val + 1)*0.5);
            this.incBleed(x, y-1, (val + 1)*0.5);
            this.incBleed(x, y+1, (val + 1)*0.5);
        }
    };
    var rot = function(v) {
        while (v<0) {
            v += size;
        }
        while (v>=size) {
            v -= size;
        }
        return v;
    };
    ret.getRot = function(x, y) {
        x = rot(x); y = rot(y);
        return ret.get(x,y);
    };
    ret.setRot = function(x, y, val) {
        x = rot(x); y = rot(y);
        return ret.set(x,y,val);
    };
    ret.incRot = function(x, y, val) {
        x = rot(x); y = rot(y);
        return ret.inc(x,y,val);
    };
    ret.normalize = function() {
        var minv = 10000, maxv = -10000;
        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {
                var v = this.get(x, y);
                minv = Math.min(minv, v);
                maxv = Math.max(maxv, v);
            }
        }
        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {
                var v = this.get(x, y);
                this.set(x, y, (v-minv) / (maxv-minv));
            }
        }
    };
    return ret;
};

var hmap = newArr(sz, 0.0);
var bmap = newArr(sz, 1.0);

var prepComp = function(v) {
    return Math.max(0, Math.min(255, Math.floor(v * 255)));
};

Math.random2dSeed = Math.random();

Math.random2d = function(x,y) {
    var x2 = 12.9898, y2 = 78.233;
    x += 1000*Math.random2dSeed; y += 1000;
    if (x === 0)
        x = 0.0001;
    var dot = (x*x2 + y*y2);// / (Math.sqrt(x*x+y*y) * Math.sqrt(x2*x2+y2*y2));
    var whole = (Math.sin(dot)*0.5+0.5) * 43758.5453;
    return whole - Math.floor(whole);
};

var genPerlin = function(sz, min, max, k, exSmooth) {
    var ret = newArr(sz, 0.0);
    var h = max - min;
    var sz2 = sz / 4;
    var l = 0.5;
    exSmooth = exSmooth || 0;
    while (k--) {
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var xx = x/sz2;
                var yy = y/sz2;
                var xxi = Math.floor(xx);
                var yyi = Math.floor(yy);
                var d = Math.pow((xx-xxi)*2-1, 2.0) + Math.pow((yy-yyi)*2-1, 2.0);
                if (d>1) {
                    if ((xx-xxi) > 0.75) { xxi += 1 }
                    else if ((xx-xxi) < 0.25) { xxi -= 1 }
                    if ((yy-yyi) > 0.75) { yyi += 1 }
                    else if ((yy-yyi) < 0.25) { yyi -= 1 }
                }
                var v = Math.random2d(xxi, yyi) * l;
                ret.inc(x, y, v);
            }
        }
        for (var j=0; j<((k/2)*(k/2)+exSmooth); j++) {
            for (var x=0; x<sz; x++) {
                for (var y=0; y<sz; y++) {
                    ret.setRot(x, y,
                        (ret.getRot(x, y) + 
                        ret.getRot(x-1, y) + 
                        ret.getRot(x, y-1) + 
                        ret.getRot(x+1, y) + 
                        ret.getRot(x, y+1)) / 5.0
                    );
                }
            }
        }
        l *= 0.75;
        sz2 *= 0.5;
    }
    for (var x=0; x<sz; x++) {
        for (var y=0; y<sz; y++) {
            ret.set(x, y, ret.get(x, y) * (max-min) + min);
        }
    }
    return ret;
};

switch (type) {
    case 'cracks':
        var list = new Array(16*2);
        for (var i=0; i<list.length; i+=2) {
            var x = Math.random()*sz*0.6 + sz*0.2,
                y = Math.random()*sz*0.6 + sz*0.2,
                a = Math.random()*Math.PI*2.0;
            list[i] = {
                x: x,
                y: y,
                a: a,
                str: Math.random()*4+4
            };
            list[i+1] = {
                x: x,
                y: y,
                a: a + (Math.random()*Math.PI/16 - Math.PI/32) + Math.PI,
                str: Math.random()*4+4
            };
        }
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                hmap.set(x, y, 1.0);
                bmap.set(x, y, 1.0);
            }
        }
        var t = 0;
        while (list.length) {
            t += 1;
            for (var i=0; i<list.length; i++) {
                var C = list[i];
                C.str -= 0.005;
                if (C.str <= 0 || C.x < 0 || C.y < 0 || C.x >= sz || C.y >= sz) {
                    list.splice(i, 1);
                    i --;
                    continue;
                }
                hmap.incBleed(C.x, C.y, -C.str);
                bmap.incBleed(C.x, C.y, -C.str);
                C.a += Math.random()*Math.PI/16 - Math.PI/32;
                C.x += Math.cos(C.a); C.y += Math.sin(C.a);
                if (Math.pow(Math.random(), 0.25) < (C.str / 16)) {
                    list.push({
                        x: C.x,
                        y: C.y,
                        a: C.a + (Math.random()*Math.PI/5 + Math.PI/5) * (Math.random() < 0.5 ? 1 : -1),
                        str: C.str * 0.4
                    });
                    list[list.length-1].x += Math.cos(list[list.length-1].a);
                    list[list.length-1].y += Math.sin(list[list.length-1].a);
                }
            }
        }
        break;

    case 'grass':
        var p = genPerlin(sz, 0.0, 1.0, 12);
        var lst = new Array(256);
        for (var i=0; i<lst.length; i++) {
            lst[i] = {
                str: Math.pow(Math.random(), 0.3),
                x: Math.random()*sz,
                y: Math.random()*sz
            };
        }
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var xx = x, yy = y;
                var v = 0;
                for (var i=0; i<lst.length; i++) {
                    var dx = xx-lst[i].x, dy = yy-lst[i].y;
                    dx = Math.min(Math.abs(dx), Math.min(Math.abs(dx+sz), Math.abs(dx-sz)));
                    dy = Math.min(Math.abs(dy), Math.min(Math.abs(dy+sz), Math.abs(dy-sz)));
                    var d = Math.sqrt(dx*dx+dy*dy);
                    var r = lst[i].str * sz/3;
                    if (d <= r) {
                        v = Math.max(v, Math.sin((r - d)/r*Math.PI*0.5) * lst[i].str * 0.8 * (p.getRot(x,y)*0.3+0.7));
                    }
                }
                hmap.setRot(x, y, v);
                bmap.setRot(x, y, v);
            }
        }
        hmap.normalize();
        break;

    case 'water':
        var lst = new Array(48);
        for (var i=0; i<lst.length; i++) {
            lst[i] = {
                str: Math.pow(Math.random(), 0.3),
                x: Math.random()*sz,
                y: Math.random()*sz
            };
        }
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var xx = x, yy = y;
                var v = 0;
                for (var i=0; i<lst.length; i++) {
                    var dx = xx-lst[i].x, dy = yy-lst[i].y;
                    dx = Math.min(Math.abs(dx), Math.min(Math.abs(dx+sz), Math.abs(dx-sz)));
                    dy = Math.min(Math.abs(dy), Math.min(Math.abs(dy+sz), Math.abs(dy-sz)));
                    var d = Math.sqrt(dx*dx+dy*dy);
                    if (d <= sz/2) {
                        v += (Math.sin((d/lst[i].str)/12) * 0.5 + 0.5) * lst[i].str * 0.2 * (1-d/(sz/2));
                    }
                }
                hmap.setRot(x, y, v);
                bmap.setRot(x, y, v);
            }
        }
        hmap.normalize();
        break;

    case 'snow':
        var lst = new Array(256);
        for (var i=0; i<lst.length; i++) {
            lst[i] = {
                str: Math.pow(Math.random(), 0.3),
                x: Math.random()*sz,
                y: Math.random()*sz
            };
        }
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var xx = x, yy = y;
                var v = 0;
                for (var i=0; i<lst.length; i++) {
                    var dx = xx-lst[i].x, dy = yy-lst[i].y;
                    dx = Math.min(Math.abs(dx), Math.min(Math.abs(dx+sz), Math.abs(dx-sz)));
                    dy = Math.min(Math.abs(dy), Math.min(Math.abs(dy+sz), Math.abs(dy-sz)));
                    var d = Math.sqrt(dx*dx+dy*dy);
                    var r = lst[i].str * sz/3;
                    if (d <= r) {
                        v = Math.max(v, Math.sin((r - d)/r*Math.PI*0.5) * lst[i].str * 0.8 * (Math.random()*0.05+0.95));
                    }
                }
                hmap.setRot(x, y, v);
                bmap.setRot(x, y, v);
            }
        }
        hmap.normalize();
        break;

    case 'sand':
        var lst = new Array(1024);
        for (var i=0; i<lst.length; i++) {
            lst[i] = {
                str: Math.pow(Math.random(), 0.3) / 3,
                x: Math.random()*sz,
                y: Math.random()*sz
            };
        }
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var xx = x, yy = y;
                var v = 0;
                for (var i=0; i<lst.length; i++) {
                    var dx = xx-lst[i].x, dy = yy-lst[i].y;
                    dx = Math.min(Math.abs(dx), Math.min(Math.abs(dx+sz), Math.abs(dx-sz)));
                    dy = Math.min(Math.abs(dy), Math.min(Math.abs(dy+sz), Math.abs(dy-sz)));
                    var d = Math.sqrt(dx*dx+dy*dy);
                    var r = lst[i].str * sz/3;
                    if (d <= r) {
                        v = Math.max(v, Math.sin((r - d)/r*Math.PI*0.5) * lst[i].str * 0.8 * 3.0 * (Math.random()*0.2+0.8));
                    }
                }
                hmap.setRot(x, y, v);
                bmap.setRot(x, y, v);
            }
        }
        hmap.normalize();
        break;        

    case 'rock':
        var lst = new Array(512);
        for (var i=0; i<lst.length; i++) {
            lst[i] = {
                str: Math.pow(Math.random(), 0.3) / 3,
                x: Math.random()*sz,
                y: Math.random()*sz,
                a: Math.random()*Math.PI*2.0
            };
            if (i>256) {
                lst[i].str /= 5.0;
            }
            lst[i].ca = Math.cos(lst[i].a);
            lst[i].sa = Math.sin(lst[i].a);
        }
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var xx = x, yy = y;
                var v = 0;
                for (var i=0; i<lst.length; i++) {
                    var _dx = (xx-lst[i].x), _dy = (yy-lst[i].y);
                    var dx = _dx * lst[i].ca - _dy * lst[i].sa;
                    var dy = _dy * lst[i].ca + _dx * lst[i].sa;
                    dx = Math.min(Math.abs(dx), Math.min(Math.abs(dx+sz), Math.abs(dx-sz)));
                    dy = Math.min(Math.abs(dy), Math.min(Math.abs(dy+sz), Math.abs(dy-sz)));
                    var d = Math.max(dx, dy);
                    var r = lst[i].str * sz/3;
                    if (d <= r) {
                        v = Math.max(v, Math.sin((r - d)/r*Math.PI*0.5) * lst[i].str * 0.8 * 3.0 * (Math.random()*0.1+0.9));
                    }
                }
                hmap.setRot(x, y, v);
                bmap.setRot(x, y, v);
            }
        }
        hmap.normalize();
        break; 

    case 'cloud':
        Math.random2dSeed = Math.random()*40;
        var p = genPerlin(sz, 0.0, 1.0, 12, 5);
        var r = sz/2-2;
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var dx = x-sz/2, dy = y-sz/2;
                var len = Math.sqrt(dx*dx+dy*dy);
                if (len <= r) {
                    var t = 1-len/r;
                    t = Math.sin(t*Math.PI/2);
                    t = Math.pow(t*(t+(Math.max(p.get(x,y)-0.65, 0))*0.5), 2.0);
                    hmap.set(x, y, Math.pow(t, 2.5));
                    bmap.set(x, y, t);
                }
                else {
                    hmap.set(x, y, 0.);
                    bmap.set(x, y, 0.);                  
                }
            }
        }
        //hmap.normalize();
        break;

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

        for (var i=0; i<50*Math.pow(sz/256, 1.5); i++) {

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

    case 'death-metal-hud':

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

        for (var i=0; i<75*Math.pow(sz/256, 1.5); i++) {

            var w = Math.pow(Math.random(), 3.0) * 3 + 1;

            var x = Math.floor(Math.random() * sz / (8)) * (8);
            var y = Math.floor(Math.random() * sz / (8)) * (8);

            w = (w-1) * 2 + 1;

            var r = Math.random();
            var dx = r <  0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
            var dy = r >= 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
            
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

    var sx = hmap.getRot(x+1, y) - hmap.getRot(x-1, y);
    var sy = hmap.getRot(x, y+1) - hmap.getRot(x, y-1);

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
    dat[i+3] = prepComp(bmap.getRot(x, y));
}

png.pack().pipe(outfile).on('close', function(){
    //images(outfilePNG).save(outfileJPG, {quality: 100});
});