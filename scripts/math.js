// http://www.geeks3d.com/20100831/shader-library-noise-and-pseudo-random-number-generator-in-glsl/
Math.random3d = function(x,y,z) {

    var LFSR_Rand_Gen = function(n) {
        n = (n << 13) ^ n; 
        return (n * (n*n*15731+789221) + 1376312589) & 0x7fffffff;
    };
    var LFSR_Rand_Gen_f = LFSR_Rand_Gen;
 
    var ip = [ Math.floor(x), Math.floor(y), Math.floor(z) ];
    var u = [ x - ip[0], y - ip[1], z - ip[2] ];
    u[0] *= u[0] * (3.0-2.0*u[0]);
    u[1] *= u[1] * (3.0-2.0*u[1]);
    u[2] *= u[2] * (3.0-2.0*u[2]);

    var _n = ip[0] + ip[1]*57 + ip[2]*113;

    var mix = function (a,b,t) {
        return a*(1.-t) + b*t;
    };

    var res = mix(mix(mix(LFSR_Rand_Gen_f(_n+(0+57*0+113*0)),
                          LFSR_Rand_Gen_f(_n+(1+57*0+113*0)),u[0]),
                      mix(LFSR_Rand_Gen_f(_n+(0+57*1+113*0)),
                          LFSR_Rand_Gen_f(_n+(1+57*1+113*0)),u[0]),u[1]),
                 mix(mix(LFSR_Rand_Gen_f(_n+(0+57*0+113*1)),
                          LFSR_Rand_Gen_f(_n+(1+57*0+113*1)),u[0]),
                      mix(LFSR_Rand_Gen_f(_n+(0+57*1+113*1)),
                          LFSR_Rand_Gen_f(_n+(1+57*1+113*1)),u[0]),u[1]),u[2]);

    res = 1.0 - res*(1.0/1073741824.0);
    return res;
};

Math.cwRandom = function(power) {
    return Math.pow(Math.random(), power) * (Math.random() > 0.5 ? 0.5 : -0.5) + 0.5;
};

Math.isPow2 = function(v) {
    var x = Math.log2(v);
    return (~~x) === x;
};

Math.random3dSlow = function() {
    this.map = {};
    this.get = function(x,y,z) {
        x += 333.0;
        y += 333.0;
        z += 333.0;
        x = x/1000.0 - Math.floor(x/1000.0);
        y = y/1000.0 - Math.floor(y/1000.0);
        z = z/1000.0 - Math.floor(z/1000.0);
        var k = x+','+y+','+z;
        if (this.map[k] || this.map[k] === 0.0) {
            return this.map[k];
        }
        else {
            return this.map[k] = Math.random();
        }
    };
    this.dispose = function() {
        this.map = null;
    }
};

Math.random2d = function(x,y) {
    var x2 = 12.9898, y2 = 78.233;
    if (x === 0)
        x = 0.0001;
    var dot = (x*x2 + y*y2) / (Math.sqrt(x*x+y*y) * Math.sqrt(x2*x2+y2*y2));
    var whole = (Math.sin(dot)*0.5+0.5) * 43758.5453;
    return whole - Math.floor(whole);
};

Math.clamp = function(val, min, max)
{
    if (val < min)
        return min;
    else if (val > max)
        return max;
    else
        return val;
};

Math.pointLineDistanceU = function (l1, l2, p) {

    var dx = l2.x - l1.x;
    var dy = l2.y - l1.y;

    if (dx === 0 && dy === 0) {
        return 0.0;
    }

    var u = ((p.x - l1.x) * dx + (p.y - l1.y) * dy) / (dx * dx + dy * dy);
    return Math.clamp(u, 0.0, 1.0);

};

Math.pointLineDistance = function (l1, l2, p) {

    var u = Math.pointLineDistanceU(l1, l2, p);
    var pl = Math.interpolate(l1, l2, u);
    return Math.pointDistance(pl, p);

};

Math.interpolate = function (p1, p2, u) {

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;

    return new b2Vec2(dx*u + p1.x, dy*u + p1.y);

};

Math.smoothPoly = function (poly, f) {

    f = f || 0.1;

    var ret = new Array(poly.length*2);
    for (var i=0; i<poly.length; i++) {
        var i1 = (i-1+poly.length) % poly.length;
        var i2 = (i+1) % poly.length;
        ret[i*2] = Math.interpolate(poly[i], poly[i1], f);
        ret[i*2+1] = Math.interpolate(poly[i], poly[i2], f);
    }

    return ret;

};

Math.simplifyPoly = function (poly, threshold) {

    while (true) {
        var out = new Array(poly.length);
        for (var i=0; i<poly.length; i++) {
            out[i] = poly[i];
        }
        var change = false;
        var minDot = 1.0;
        var best = -1;
        for (var i=1; i<poly.length; i++) {
            var j = i-1;
            var k = (i+1) % poly.length;
            var x1 = poly[j].x - poly[k].x;
            var y1 = poly[j].y - poly[k].y;
            var x2 = poly[i].x - poly[k].x;
            var y2 = poly[i].y - poly[k].y;
            var len1 = Math.sqrt(x1*x1+y1*y1);
            var len2 = Math.sqrt(x2*x2+y2*y2);
            x1 /= len1; y1 /= len1;
            x2 /= len2; y2 /= len2;
            var dot = 1 - Math.abs(x1*x2+y1*y2);
            if (dot < threshold) {
                if (best === -1 || dot < minDot) {
                    minDot = dot;
                    best = i;
                }
                change = true;
            }
        }
        if (!change) {
            return out;
        }
        else {
            out.splice(best, 1);
            poly = out;
        }
    }
    return out;

};

Math.pointDistance = function (p1, p2) {

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;

    return Math.sqrt(dx*dx+dy*dy);

};

// https://gist.github.com/wteuber/6241786
Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

Math.angleBetween = function (a,b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    return Math.atan2(dy, dx);
};

Math.angleDist = function (a,b) {
    return Math.atan2(Math.sin(a-b), Math.cos(a-b));
};

Math.pointBetween = function(c, a1, a2, p) {
    a1 = Math.atan2(Math.sin(a1), Math.cos(a1));
    a2 = Math.atan2(Math.sin(a2), Math.cos(a2));
    if (a2 <= a1) {
        a2 += Math.PI * 2.0;
    }
    if (a2-a1 >= Math.PI * 2.0) {
        return true;
    }
    var ca = (a1+a2)*0.5;
    var ad = Math.abs(ca - a2);
    var dx1 = p.x - c.x, dy1 = p.y - c.y;
    var dx2 = Math.cos(ca), dy2 = Math.sin(ca);
    var len1 = Math.sqrt(dx1*dx1+dy1*dy1);
    if (!len1) {
        return true;
    }
    dx1 /= len1; dy1 /= len1;
    var ad2 = dx1*dx2+dy1*dy2;
    if (Math.abs(ad2) > Math.cos(ad)) {
        return true;
    }
    else {
        return false;
    }
}

Math.rotPoly = function(poly, angle) {
    for (var i=0; i<poly.length; i++) {
        poly[i] = Math.rotVec2(poly[i], angle);
    }
    return poly;
}

Math.rotVec2 = function(vec, angle)
{
    var x = vec.x,
        y = vec.y;
    if (!angle)
        return new b2Vec2(x, y);
    var ca = Math.cos(angle),
        sa = Math.sin(angle);
    return new b2Vec2(
        x * ca - y * sa,
        y * ca + x * sa
    );
};

Math.lenVec2 = function(vec) {
    return Math.sqrt(vec.x*vec.x + vec.y*vec.y);
};

Math.lenSqVec2 = function(vec) {
    return vec.x*vec.x + vec.y*vec.y;
};

Math.distVec2 = function(a, b) {
    var x = a.x - b.x, y = a.y - b.y;
    return Math.sqrt(x*x + y*y);
};

// http://stackoverflow.com/questions/4247889/area-of-intersection-between-two-circles
Math.circleIntersectionArea = function(p0, p1, r0, r1) {
    var rr0 = r0 * r0;
    var rr1 = r1 * r1;
    var d = Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y));

    // Circles do not overlap
    if (d > r1 + r0)
    {
        return 0;
    }
    // Circle1 is completely inside circle0
    else if (d <= Math.abs(r0 - r1) && r0 >= r1)
    {
        // Return area of circle1
        return Math.PI * rr1;
    }
    // Circle0 is completely inside circle1
    else if (d <= Math.abs(r0 - r1) && r0 < r1)
    {
        // Return area of circle0
        return Math.PI * rr0;
    }
    // Circles partially overlap
    else
    {
        var phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * r0 * d))) * 2;
        var theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * r1 * d))) * 2;
        var area1 = 0.5 * theta * rr1 - 0.5 * rr1 * Math.sin(theta);
        var area2 = 0.5 * phi * rr0 - 0.5 * rr0 * Math.sin(phi);

        // Return area of intersection
        return area1 + area2;
    }
};

Math.distSqVec2 = function(a, b) {
    var x = a.x - b.x, y = a.y - b.y;
    return x*x + y*y;
};


// http://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon
Math.polyCentroid = function(p) {

    var ret = new b2Vec2(0, 0);    
    var sa = 0.0, x0 = 0.0, y0 = 0.0, x1 = 0.0, y1 = 0.0, a = 0.0;
    var len = p.length;

    for (var i=0; i<len-1; i++) {
        x0 = p[i].x;
        y0 = p[i].y;
        x1 = p[i+1].x;
        y1 = p[i+1].y;
        a = x0*y1 - x1*y0;
        sa += a;
        ret.x += (x0 + x1)*a;
        ret.y += (y0 + y1)*a;
    }

    sa *= 0.5;
    ret.x /= (6.0*sa);
    ret.y /= (6.0*sa);

    return ret;    
};

Math.scalePoly = function(poly, s, sy, cz) {

    sy = sy || s;

    var c = cz ? new b2Vec2(0, 0) : Math.polyCentroid(poly);
    var len = poly.length;
    var ret = new Array(len);
    for (var i=0; i<len; i++) {
        ret[i] = new b2Vec2(
            (poly[i].x - c.x) * s + c.x,
            (poly[i].y - c.y) * sy + c.y
        );
    }
    return ret;

};

Math.scalePolyZC = function(poly, s, sy) {
    return Math.scalePoly(poly, s, sy, true);
}

Math.translatePoly = function(poly, x, y) {

    var len = poly.length;
    var ret = new Array(len);
    for (var i=0; i<len; i++) {
        ret[i] = new b2Vec2(
            poly[i].x + x,
            poly[i].y + y
        );
    }
    return ret;
}

// http://alienryderflex.com/polygon/
Math.pointInPoly = function(p, poly) {

    var i, j = poly.length-1;
    var oddNodes = false;

    for (i=0; i<poly.length; i++) {
        if (poly[i].y<p.y && poly[j].y>=p.y || poly[j].y<p.y && poly[i].y>=p.y) {
            if (poly[i].x+(p.y-poly[i].y)/(poly[j].y-poly[i].y)*(poly[j].x-poly[i].x)<p.x) {
                oddNodes = !oddNodes;
            }
        }
        j = i;
    }

    return oddNodes;
};