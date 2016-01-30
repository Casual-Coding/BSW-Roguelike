// BlockShip Wars Component

BSWG.component_CommandCenter = {

	init: function(args) {

		this.width  = 2;
		this.height = 3;

		this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
			width:  this.width,
			height: this.height
		});

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

	init: function(args) {

		this.width  = args.width || 1;
		this.height = args.height || 1;
		this.armour = args.armour || false;

		this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
			width:  this.width,
			height: this.height
		});

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

	},

	update: function(dt) {

	},

};

BSWG.component = function (desc, args) {

	this.handleInput = function(key) {};

	for (var key in desc)
		this[key] = desc[key];

	this.init(args);

	this.remove = function() {

		BSWG.componentList.remove(this);

	};

	this.removeSafe = function() {

		BSWG.componentList.compRemove.push(this);

	};

	this.baseRenderOver = function(ctx, cam, dt) {

		// <-- Render wires here

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
			this.compList[i].update(dt);

		len = this.compRemove.length;
		for (var i=0; i<len; i++)
			this.remove(this.compRemove[i]);
		this.compRemove.length = 0;

	};

	this.render = function (ctx, cam, dt) {

		var len = this.compList.length;
		for (var i=0; i<len; i++)
			this.compList[i].render(ctx, cam, dt);
		for (var i=0; i<len; i++)
			this.compList[i].baseRenderOver(ctx, cam, dt);
	};

}();