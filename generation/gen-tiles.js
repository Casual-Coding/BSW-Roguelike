// > npm install node-png --save
// > npm install seedrandom

var fs = require('fs'),
    PNG = require('node-png').PNG,
    seedrandom = require('seedrandom').xor4096;

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
            this.setBleed(x-1, y, (val-1)*0.75);
            this.setBleed(x+1, y, (val-1)*0.75);
            this.setBleed(x, y-1, (val-1)*0.75);
            this.setBleed(x, y+1, (val-1)*0.75);
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
    return ret;
};

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

var genRipples = function(sz, min, max, exSmooth, rippleScale) {

    var ret = newArr(sz, 0.0);

    var lst = new Array(~~(16 / (rippleScale / 0.3)));
    for (var i=0; i<lst.length; i++) {
        lst[i] = {
            str: Math.pow(Math.random(), rippleScale),
            x: Math.random()*sz,
            y: Math.random()*sz
        };
        lst[i].str2 = lst[i].str / (rippleScale / 0.3);
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
                    v += (Math.sin((d/lst[i].str)/(12*(rippleScale / 0.3))) * 0.5 + 0.5) * lst[i].str2 * 0.2 * (1-d/(sz/2));
                }
            }
            ret.setRot(x, y, v);
        }
    }

    for (var j=0; j<(exSmooth||0); j++) {
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

    var maxv = 0.0;
    for (var x=0; x<sz; x++) {
        for (var y=0; y<sz; y++) {
            maxv = Math.max(maxv, ret.get(x, y));
        }
    }
    for (var x=0; x<sz; x++) {
        for (var y=0; y<sz; y++) {
            ret.set(x, y, (ret.get(x, y)/maxv) * (max-min) + min);
        }
    }

    return ret;

};

var genPerlin = function(sz, min, max, k, off, exSmooth, bleedF, iszf) {
    var ret = newArr(sz, 0.0);
    var h = max - min;
    var sz2 = sz / (iszf || 4);
    var l = 0.5;
    while (k--) {
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                var xx = (x+off)/sz2;
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
        for (var j=0; j<((k/2)*(k/2)); j++) {
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
        l *= 0.65;
        sz2 *= 0.5;
    }
    if (bleedF) {
        for (var x=0; x<sz; x++) {
            for (var y=0; y<sz; y++) {
                ret.setBleed(ret.get(x, y) * bleedF);
            }
        }        
    }
    for (var j=0; j<(exSmooth||0); j++) {
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
    var maxv = 0.0;
    for (var x=0; x<sz; x++) {
        for (var y=0; y<sz; y++) {
            maxv = Math.max(maxv, ret.get(x, y));
        }
    }
    for (var x=0; x<sz; x++) {
        for (var y=0; y<sz; y++) {
            ret.set(x, y, (ret.get(x, y)/maxv) * (max-min) + min);
        }
    }
    return ret;
};

var tileTypes = {
    'mountain': {
        minHeight: 0.45,
        maxHeight: 1.0,
        transitionTo: 0.0,
        downTransition: true,
        insideVariations: 4,
        taperPower: 2.0,
        bleedF: 25.0,
        iszF: 1.5,
        texType: 'perlin',
        taperComb: function(a,b) {
            return a*b;
        },
        perlinFilter: function(v) {
            return Math.pow(v, 4);
        }
    },
    'land': {
        minHeight: 0.28,
        maxHeight: 0.4,
        transitionTo: 0.0,
        downTransition: true,
        insideVariations: 4,
        iszF: 1.0,
        taperPower: 1.5,
        texType: 'perlin',
        taperComb: function(a,b) {
            return a*b;
        },
        perlinFilter: function(v) {
            return Math.pow(v, 2.1);
        },
        smooth: 32
    },
    'rockland': {
        minHeight: 0.28,
        maxHeight: 0.575,
        transitionTo: 0.0,
        downTransition: true,
        insideVariations: 4,
        taperPower: 0.75,
        texType: 'perlin',
        taperComb: function(a,b) {
            return a*b;
        },
        perlinFilter: function(v) {
            return Math.pow(v, 1.1);
        },
        smooth: 0
    },
    'sand': {
        minHeight: 0.28,
        maxHeight: 0.45,
        transitionTo: 0.0,
        downTransition: true,
        insideVariations: 4,
        taperPower: 0.5,
        texType: 'ripples',
        rippleScale: 0.6,
        taperComb: function(a,b) {
            return a*b;
        },
        perlinFilter: function(v) {
            return Math.pow(v, 0.5);
        },
        smooth: 16
    },
    'snow': {
        minHeight: 0.28,
        maxHeight: 0.45,
        transitionTo: 0.0,
        downTransition: true,
        insideVariations: 4,
        taperPower: 0.5,
        texType: 'ripples',
        rippleScale: 0.3,
        taperComb: function(a,b) {
            return a*b;
        },
        perlinFilter: function(v) {
            return Math.pow(v, 0.5);
        },
        smooth: 16
    },
    'below': {
        minHeight: 0.01,
        maxHeight: 0.25,
        insideVariations: 4,
        taperPower: 1.5,
        texType: 'perlin',
        taperComb: function(a,b) {
            return a*b;
        },
        perlinFilter: function(v) {
            return Math.pow(v, 4.0);
        }
    }
};

var tileType = (process.argv[2] || 'mountain').toLowerCase();
var tileSize = parseInt(process.argv[3] || '512');
var outfilePNG = (process.argv[4] || ('tileset-' + tileType + '-' + tileSize)) + '.png';
var outfile = fs.createWriteStream(outfilePNG);

var setWidth = 3;
var sz = tileSize * setWidth;
var png = new PNG({width: sz, height: sz});
var tInfo = tileTypes[tileType] || tileTypes['mountain'];

H = newArr(sz, 0.0);

// Setup tiling graph

var L = new Array(setWidth * setWidth);
var R = new Array(setWidth * setWidth);
var U = new Array(setWidth * setWidth);
var D = new Array(setWidth * setWidth);
var OFF = new Array(setWidth * setWidth);
var TAPER = new Array(setWidth * setWidth);
var PINVX = new Array(setWidth * setWidth);
var PINVY = new Array(setWidth * setWidth);

for (var i=0; i<L.length; i++) {
    L[i] = new Array();
    R[i] = new Array();
    U[i] = new Array();
    D[i] = new Array();
    PINVX[i] = false;
    PINVY[i] = false;
}

for (var xo=0; xo<3; xo++) {
    for (var yo=0; yo<3; yo++) {
        var i = xo + yo*3;
        OFF[i] = [ xo*tileSize, yo*tileSize ];
        if (xo > 0) {
            L[i].push((xo-1) + yo*3);
        }
        if (yo > 0) {
            U[i].push(xo + (yo-1)*3);
        }
        if (xo < 2) {
            R[i].push((xo+1) + yo*3);
        }
        if (yo < 2) {
            D[i].push(xo + (yo+1)*3);
        }
        var tx1 = 1, ty1 = 1,
            tx2 = 1, ty2 = 1;
        if (xo === 1) {
            L[i].push(i);
            R[i].push(i);
        }
        else if (xo === 0) {
            tx1 = 0;
        }
        else if (xo === 2) {
            tx2 = 0;
        }
        if (yo === 1) {
            U[i].push(i);
            D[i].push(i);
        }
        else if (yo === 0) {
            ty1 = 0;
        }
        else if (yo === 2) {
            ty2 = 0;
        }
        TAPER[i] = [ tx1, tx2, ty1, ty2 ];
    }
}

// Tiling get/set functions

var UNQ = function(list) {
    list = list.sort();
    for (var i=1; i<list.length; i++) {
        if (list[i-1] === list[i]) {
            list.splice(i, 1);
            i -= 1;
            continue;
        }
    }
};

var GETI = function(id, x, y) {
    var ids = [ id ];

    var k = 0;
    while ((x < 0 || x >= tileSize) && k < 1) {
        var xo = x < 0 ? 1 : -1;
        var newIds = [];
        for (var i=0; i<ids.length; i++) {
            var k = ids[i];
            if (xo < 0) {
                for (var j=0; j<L[k].length; j++) {
                    newIds.push(L[k][j]);
                }
            }
            else if (xo > 0) {
                for (var j=0; j<R[k].length; j++) {
                    newIds.push(R[k][j]);
                }
            }
        }
        x += xo * tileSize;
        ids = newIds;
        UNQ(ids);
        k ++;
    }

    if (x < 0 || x >= tileSize) {
        return null;
    }

    var k = 0;
    while ((y < 0 || y >= tileSize) && k < 1) {
        var yo = y < 0 ? 1 : -1;
        var newIds = [];
        for (var i=0; i<ids.length; i++) {
            var k = ids[i];
            if (yo < 0) {
                for (var j=0; j<U[k].length; j++) {
                    newIds.push(U[k][j]);
                }
            }
            else if (yo > 0) {
                for (var j=0; j<D[k].length; j++) {
                    newIds.push(D[k][j]);
                }
            }
        }
        y += yo * tileSize;
        ids = newIds;
        UNQ(ids);
        k ++;
    }

    if (y < 0 || y >= tileSize) {
        return null;
    }
    
    return {
        list: ids,
        x: x,
        y: y
    };
};

var MAX = function(id, x, y) {

    var r = GETI(id, x, y);
    if (!r) {
        return 0.0;
    }

    var v = 0.0;
    for (var i=0; i<r.list.length; i++) {
        var j = r.list[i];
        var off = OFF[j];
        var X = off[0] + r.x,
            Y = off[1] + r.y;
        v = Math.max(v, H.get(X, Y));
    }

    return v;

};

var MIN = function(id, x, y) {

    var r = GETI(id, x, y);
    if (!r) {
        return 0.0;
    }

    var v = r.list.length ? 1.0 : 0.0;
    for (var i=0; i<r.list.length; i++) {
        var j = r.list[i];
        var off = OFF[j];
        var X = off[0] + r.x,
            Y = off[1] + r.y;
        v = Math.min(v, H.get(X, Y));
    }

    return v;

};

var MIN = function(id, x, y) {

    var r = GETI(id, x, y);
    if (!r) {
        return 0.0;
    }

    var v = r.list.length ? 1.0 : 0.0;
    for (var i=0; i<r.list.length; i++) {
        var j = r.list[i];
        var off = OFF[j];
        var X = off[0] + r.x,
            Y = off[1] + r.y;
        v = Math.min(v, H.get(X, Y));
    }

    return v;

};

var SET = function(id, x, y, setv) {

    var r = GETI(id, x, y);
    if (!r) {
        return;
    }

    for (var i=0; i<r.list.length; i++) {
        var j = r.list[i];
        var u = r.x / tileSize,
            v = r.y / tileSize;
        var taper = TAPER[j];
        u = Math.pow(u * (taper[1] - taper[0]) + taper[0], tInfo.taperPower);
        v = Math.pow(v * (taper[3] - taper[2]) + taper[2], tInfo.taperPower);
        var t = tInfo.taperComb(u, v);
        var off = OFF[j];
        var X = off[0] + r.x,
            Y = off[1] + r.y;
        H.set(X, Y, setv*t);
    }
    
};

// Fill with perlin
Math.seedrandom();
var k = 17;
if (tileSize === 512) {
    k = 12;
}
else if (tileSize === 256) {
    k = 10;
}
else if (tileSize === 124) {
    k = 8;
}
else if (tileSize === 64) {
    k = 6;
}
var P = null;
if (tInfo.texType == 'ripples') {
    P = genRipples(tileSize, 0.0, 1.0, tInfo.smooth||0, tInfo.rippleScale||0.3);
} else { // 'perlin'
    P = genPerlin(tileSize, 0.0, 1.0, k, Math.random()*100000.0, tInfo.smooth||0, tInfo.bleedF||0, tInfo.iszF);
}
for (var x=0; x<tileSize; x++) {
    for (var y=0; y<tileSize; y++) {
        var dx = Math.abs(x-tileSize*0.5) / (tileSize*0.5),
            dy = Math.abs(y-tileSize*0.5) / (tileSize*0.5);
        var t = Math.min(dx, dy);
        var x2 = x, y2 = y;
        if (x >= tileSize*0.5) {
            x2 -= tileSize*0.5;
        }
        else {
            x2 += tileSize*0.5;
        }
        if (y >= tileSize*0.5) {
            y2 -= tileSize*0.5;
        }
        else {
            y2 += tileSize*0.5;
        }        
        var val = P.get(x, y) * (1-t) + P.getRot(x2, y2) * t;
        P.set(x, y, val);
    }
}
for (var i=0; i<OFF.length; i++) {
    if (OFF[i]) {
        var off = OFF[i];
        for (var x=0; x<tileSize; x++) {
            for (var y=0; y<tileSize; y++) {
                var v = P.get(x, y);
                H.set(off[0] + x, off[1] + y, v);
                //SET(i, x, y, v);
            }
        }
    }
}

// Normalize
var maxv = 0;
for (var x=0; x<sz; x++) {
    for (var y=0; y<sz; y++) {
        maxv = Math.max(maxv, H.get(x, y));
    }
}

for (var x=0; x<sz; x++) {
    for (var y=0; y<sz; y++) {
        H.set(x, y, H.get(x, y) / maxv);
    }
}

// Final mask
for (var i=0; i<OFF.length; i++) {
    if (OFF[i]) {
        var off = OFF[i];
        for (var x=0; x<tileSize; x++) {
            for (var y=0; y<tileSize; y++) {
                var v = H.get(off[0] + x, off[1] + y);
                if (tInfo.perlinFilter) {
                    v = tInfo.perlinFilter(v);
                }
                SET(i, x, y, v * (tInfo.maxHeight - tInfo.minHeight) + tInfo.minHeight);
            }
        }
    }
}

// Output

var dat = png.data;
for (var i=0; i<dat.length; i+=4) {

    var x = (i/4) % sz, y = ((i/4)-(i/4)%sz)/sz;

    dat[i]   = prepComp(H.get(x, y));
    dat[i+2] = prepComp(H.get(x, y));
    dat[i+1] = prepComp(H.get(x, y));
    dat[i+3] = prepComp(1);
}

png.pack().pipe(outfile).on('close', function(){
    //images(outfilePNG).save(outfileJPG, {quality: 100});
});