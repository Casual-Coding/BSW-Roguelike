Math.clamp = function(val, min, max)
{
    if (val < min)
        return min;
    else if (val > max)
        return max;
    else
        return val;
};

// https://gist.github.com/wteuber/6241786
Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

Math.rotVec2 = function(vec, angle)
{
	var x = vec.get_x(),
		y = vec.get_y();
	if (!angle)
		return new b2Vec2(x, y);
	var ca = Math.cos(angle),
		sa = Math.sin(angle);
	return new b2Vec2(
		x * ca - y * sa,
		y * ca + x * sa
	);
};