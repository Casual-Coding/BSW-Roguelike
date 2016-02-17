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

Math.pointDistance = function (p1, p2) {

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;

    return Math.sqrt(dx*dx+dy*dy);

}

// https://gist.github.com/wteuber/6241786
Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

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

Math.distSqVec2 = function(a, b) {
    var x = a.x - b.x, y = a.y - b.y;
    return x*x + y*y;
};