// BlockShip Wars Component

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

	},

	update: function(dt) {

	},

};

BSWG.component = function (desc, args) {

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