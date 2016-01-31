BSWG.control_Button = {

	render: function (ctx, viewport) {

		ctx.font = '16px Helvetica';

		if (this.selected)
			ctx.strokeStyle = '#8f8';
		else
			ctx.strokeStyle = '#fff';
		if (this.selected)
			ctx.fillStyle = 'rgba(101,205,101,' + (this.mouseIn ? 1.0 : 0.8) + ')';
		else
			ctx.fillStyle = 'rgba(205,205,205,' + (this.mouseIn ? 1.0 : 0.8) + ')';
			

		ctx.lineWidth = 2.0;

		ctx.fillRect(this.p.x, this.p.y, this.w, this.h);
		ctx.strokeRect(this.p.x, this.p.y, this.w, this.h);

		ctx.lineWidth = 1.0;

		ctx.textAlign = 'center';
		ctx.fillStyle = '#000';

		ctx.fillText(this.text, this.p.x + this.w*0.5, this.p.y + this.h*0.5+6);

		ctx.textAlign = 'left';

	},

	update: function () {



	},

};

BSWG.uiControl = function (desc, args) {

	if (!args) args = {};

	this.render = function (ctx, viewport) { };
	this.update = function ( ) { };

	for (var k in desc) {
		this[k] = desc[k];
	}

	this.p = { x: args.x || 0, y: args.y || 0 };
	this.w = args.w || 40;
	this.h = args.h || 40;
	this.click = args.click || null;
	this.text = args.text || "";
	this.selected = args.selected || null;

	this.remove = function () {

		BSWG.ui.remove(this);

	};

	BSWG.ui.add(this);

	this._update = function () {

		var mx = BSWG.input.MOUSE('x');
		var my = BSWG.input.MOUSE('y');

		if (mx >= this.p.x && my >= this.p.y && mx < (this.p.x + this.w) && my < (this.p.y + this.h))
			this.mouseIn = true;
		else
			this.mouseIn = false;

		if (this.mouseIn && this.click && BSWG.input.MOUSE_PRESSED('left'))
			this.click(this);

		this.update();

	};

};

BSWG.ui = new function () {

	this.list = [];

	this.clear = function ( ) {
		this.list.length = 0;
	};

	this.render = function (ctx, viewport) {
		for (var i=0; i<this.list.length; i++)
			this.list[i].render(ctx, viewport);
	};

	this.update = function () {
		for (var i=0; i<this.list.length; i++)
			this.list[i]._update();
	};

	this.remove = function(el) {
		for (var i=0; i<this.list.length; i++)
			if (this.list[i] === el)
			{
				this.list.splice(i, 1);
				return true;
			}
		return false;
	};

	this.add = function(el) {
		this.remove(el);
		this.list.push(el);
	};

}();