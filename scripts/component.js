// BlockShip Wars Component

BSWG.createBoxJPoints = function(w, h) {

	var jp = [];

	for (var y=0; y<h; y++) {
		jp.push(new b2Vec2(-w * 0.5, y - h * 0.5 + 0.5));
		jp.push(new b2Vec2( w * 0.5, y - h * 0.5 + 0.5));
	}

	for (var x=0; x<w; x++) {
		jp.push(new b2Vec2(x - w * 0.5 + 0.5, -h * 0.5));
		jp.push(new b2Vec2(x - w * 0.5 + 0.5,  h * 0.5));
	}

	return jp;

};

BSWG.component_CommandCenter = {

	type: 'cc',

	init: function(args) {

		this.width  = 2;
		this.height = 3;

		this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
			width:  this.width,
			height: this.height
		});

		this.jpoints = BSWG.createBoxJPoints(this.width, this.height);

	},

	render: function(ctx, cam, dt) {

		var polyWorld = BSWG.physics.localToWorld(this.obj.verts, this.obj.body);
		var poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].get_x(), poly[0].get_y());
		ctx.lineTo(poly[1].get_x(), poly[1].get_y());
		ctx.lineTo(poly[2].get_x(), poly[2].get_y());
		ctx.lineTo(poly[3].get_x(), poly[3].get_y());
		ctx.closePath();

		ctx.fillStyle = '#888';
		ctx.fill();

		polyWorld.destroy();
		poly.destroy();

		polyWorld = BSWG.physics.localToWorld([
			new b2Vec2(-this.width * 0.5 * 0.8, -this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, -this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, -this.height * 0.5 * 0.0),
			new b2Vec2(-this.width * 0.5 * 0.8, -this.height * 0.5 * 0.0)
		], this.obj.body);
		poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].get_x(), poly[0].get_y());
		ctx.lineTo(poly[1].get_x(), poly[1].get_y());
		ctx.lineTo(poly[2].get_x(), poly[2].get_y());
		ctx.lineTo(poly[3].get_x(), poly[3].get_y());
		ctx.closePath();

		ctx.fillStyle = '#fff';
		ctx.fill();

		polyWorld.destroy();
		poly.destroy();

		polyWorld = BSWG.physics.localToWorld([
			new b2Vec2(-this.width * 0.5 * 0.8, this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, this.height * 0.5 * 0.15),
			new b2Vec2(-this.width * 0.5 * 0.8, this.height * 0.5 * 0.15)
		], this.obj.body);
		poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].get_x(), poly[0].get_y());
		ctx.lineTo(poly[1].get_x(), poly[1].get_y());
		ctx.lineTo(poly[2].get_x(), poly[2].get_y());
		ctx.lineTo(poly[3].get_x(), poly[3].get_y());
		ctx.closePath();

		ctx.fillStyle = '#66d';
		ctx.fill();

		polyWorld.destroy();
		poly.destroy();

	},

	update: function(dt) {

	},

	handleInput: function(keys) {

		var rot = 0;
		var accel = 0;

		if (keys[BSWG.KEY.LEFT]) rot -= 1;
		if (keys[BSWG.KEY.RIGHT]) rot += 1;

		if (keys[BSWG.KEY.UP]) accel -= 1;
		if (keys[BSWG.KEY.DOWN]) accel += 1;

		if (rot)
			this.obj.body.ApplyTorque(rot*7.0);
		
		if (accel)
		{
			var a = this.obj.body.GetAngle() + Math.PI/2.0;
			accel *= 5.0;
			this.obj.body.ApplyForceToCenter(new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel));	
		}

	},

};

BSWG.component_Block = {

	type: 'block',

	init: function(args) {

		this.width  = args.width || 1;
		this.height = args.height || 1;
		this.armour = args.armour || false;

		this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
			width:  this.width,
			height: this.height
		});

		this.jpoints = BSWG.createBoxJPoints(this.width, this.height);

	},

	render: function(ctx, cam, dt) {

		var polyWorld = BSWG.physics.localToWorld(this.obj.verts, this.obj.body);
		var poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].get_x(), poly[0].get_y());
		ctx.lineTo(poly[1].get_x(), poly[1].get_y());
		ctx.lineTo(poly[2].get_x(), poly[2].get_y());
		ctx.lineTo(poly[3].get_x(), poly[3].get_y());
		ctx.closePath();

		ctx.fillStyle = BSWG.componentList.mouseOver === this ? '#aaa' : '#888';
		ctx.fill();

		polyWorld.destroy();
		poly.destroy();

	},

	update: function(dt) {

	},

};

BSWG.nextCompID = 1;
BSWG.component = function (desc, args) {

	this.handleInput = function(key) {};

	for (var key in desc)
		this[key] = desc[key];

	this.id = BSWG.nextCompID++;
	this.jpoints = [];
	this.jmatch = [];
	this.jmatch = -1;
	this.welds = {};

	this.init(args);

	this.remove = function() {

		BSWG.componentList.remove(this);

	};

	this.removeSafe = function() {

		BSWG.componentList.compRemove.push(this);

	};

	this.baseRenderOver = function(ctx, cam, dt) {

		// <-- Render wires here

		var jpw = BSWG.physics.localToWorld(this.jpoints, this.obj.body);
		var jp = cam.toScreenList(BSWG.render.viewport, jpw);

		var map = {};
		for (var i=0; i<this.jmatch.length; i++) {
			map[this.jmatch[i][0]] = true;
		}

		for (var i=0; i<jp.length; i++) {
			ctx.beginPath();
			var r = map[i]?(this.jmhover===i?160:110):80;
			if (this.welds[i])
				r = 110;
        	ctx.arc(jp[i].get_x(), jp[i].get_y(), r * cam.z, 0, 2*Math.PI);
        	ctx.fillStyle = map[i]?(this.jmhover===i?'#2f2':'#8f8'):'#aaa';
            ctx.globalAlpha = 0.9;
        	if (this.welds[i])
        	{
        		ctx.fillStyle = '#ccf';
        		ctx.globalAlpha = 1.0;
        	}
            ctx.fill();
   		}
   		ctx.globalAlpha = 1.0;

		jpw.destroy();
		jp.destroy();

	};

	this.baseUpdate = function(dt) {

		if (!BSWG.game.editMode)
			return;

		this.jmatch = [];
		this.jmhover = -1;

		var _p = this.obj.body.GetWorldCenter();
		var p = new b2Vec2(_p.get_x(), _p.get_y());
		var cl = BSWG.componentList.withinRadius(p, this.obj.radius+0.5);

		var jpw = BSWG.physics.localToWorld(this.jpoints, this.obj.body);

        var mps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var mp = BSWG.game.cam.toWorld(BSWG.render.viewport, mps);

        var mind = 10.0;
        for (var i=0; i<jpw.length; i++) {
        	var tp = jpw[i];
        	var d = Math.pow(tp.get_x() - mp.get_x(), 2.0) +
        			Math.pow(tp.get_y() - mp.get_y(), 2.0);
        	if (d < mind)
        	{
        		this.jmhover = i;
        		mind = d;
        	}
        }
        if (mind > 0.075)
        	this.jmhover = -1;

		for (var i=0; i<cl.length; i++) {
			if (cl[i] !== this) {
				var jpw2 = BSWG.physics.localToWorld(cl[i].jpoints, cl[i].obj.body);

				for (var k1=0; k1<jpw.length; k1++)
					for (var k2=0; k2<jpw2.length; k2++)
					{
						var p1 = jpw[k1];
						var p2 = jpw2[k2];
						var d2 = Math.pow(p1.get_x() - p2.get_x(), 2.0) +
								 Math.pow(p1.get_y() - p2.get_y(), 2.0);
						if (d2 < 0.05) {
							this.jmatch.push([
								k1, cl[i], k2
							]);
							break;
						}
					}

				jpw2.destroy();
			}
		}

		if (this.jmhover >= 0 && BSWG.input.MOUSE_PRESSED('left')) {
			for (var i=0; i<this.jmatch.length; i++) {
				if (this.jmatch[i][0] === this.jmhover && this.jmatch[i][1].id > this.id) {
					if (!this.welds[i]) {
						var obj = BSWG.physics.createWeld(this.obj.body, this.jmatch[i][1].obj.body,
														  this.jpoints[this.jmatch[i][0]],
														  this.jmatch[i][1].jpoints[this.jmatch[i][2]]);
						this.welds[this.jmatch[i][0]] = obj;
						this.jmatch[i][1].welds[this.jmatch[i][2]] = obj;
					}
				}
			}
		}

		[p, mp, mps].destroy();
		jpw.destroy();

	};

	this.pointIn = function(p) {

		return !!this.obj.fixture.TestPoint(p);

	};

	this.getLocalPoint = function(p) {

		var p2 = this.obj.body.GetLocalPoint(p);
		return new b2Vec2(p2.get_x(), p2.get_y());

	};

	this.getWorldPoint = function(p) {

		var p2 = this.obj.body.GetWorldPoint(p);
		return new b2Vec2(p2.get_x(), p2.get_y());

	};

	this.addForce = function (f, p) {

		if (!p)
			this.obj.body.ApplyForceToCenter(f);
		else
			this.obj.body.ApplyForce(f, p);

	};

	BSWG.componentList.add(this);

};

BSWG.componentList = new function () {

	this.compList = [];
	this.compRemove = [];

	this.clear = function () {

		while (this.compList.length)
			this.compList[0].remove();

		this.compRemove = [];

	};

	this.add = function (comp) {

		this.compList.push(comp);
		return true;

	};

	this.remove = function (comp) {

		for (var i=0; i<this.compList.length; i++)
			if (this.compList[i] === comp) {
				this.compList.splice(i, 1);
				return true;
			}
		return false;

	};

	this.update = function (dt) {

		var len = this.compList.length;
		for (var i=0; i<len; i++)
		{
			this.compList[i].baseUpdate(dt);
			this.compList[i].update(dt);
		}

		len = this.compRemove.length;
		for (var i=0; i<len; i++)
			this.remove(this.compRemove[i]);
		this.compRemove.length = 0;

	};

	this.render = function (ctx, cam, dt) {

		var p = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
		var pw = cam.toWorld(BSWG.render.viewport, p);
		this.mouseOver = this.atPoint(pw);
		[p, pw].destroy();

		var len = this.compList.length;
		for (var i=0; i<len; i++)
			this.compList[i].render(ctx, cam, dt);
		for (var i=0; i<len; i++)
			this.compList[i].baseRenderOver(ctx, cam, dt);
	};

	this.atPoint = function (p) {

		var len = this.compList.length;
		for (var i=0; i<len; i++)
			if (this.compList[i].pointIn(p))
				return this.compList[i];
		return null;

	};

	this.withinRadius = function (p, r) {
		var ret = [];
		var len = this.compList.length;
		for (var i=0; i<len; i++)
		{
			var p2 = this.compList[i].obj.body.GetWorldCenter();
			var dist = Math.pow(p2.get_x() - p.get_x(), 2.0) +
					   Math.pow(p2.get_y() - p.get_y(), 2.0);
			if (dist < Math.pow(r+this.compList[i].obj.radius, 2.0))
				ret.push(this.compList[i]);
		}
		return ret;
	}

}();