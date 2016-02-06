// BlockShip Wars Component

BSWG.compActiveConfMenu = null;

BSWG.component_minJMatch = 0.02;

BSWG.createBoxJPoints = function(w, h) {

	var jp = new Array();

	for (var y=0; y<h; y++) {
		jp.push(new b2Vec2(-w * 0.5, y - h * 0.5 + 0.5));
		jp.push(new b2Vec2( w * 0.5, y - h * 0.5 + 0.5));
	}

	if (!(h%2)) {
		jp.push(new b2Vec2(-w * 0.5, 0.0));
		jp.push(new b2Vec2( w * 0.5, 0.0));
	}

	for (var x=0; x<w; x++) {
		jp.push(new b2Vec2(x - w * 0.5 + 0.5, -h * 0.5));
		jp.push(new b2Vec2(x - w * 0.5 + 0.5,  h * 0.5));
	}

	if (!(w%2)) {
		jp.push(new b2Vec2(0.0, -h * 0.5));
		jp.push(new b2Vec2(0.0,  h * 0.5));
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
		ctx.moveTo(poly[0].x, poly[0].y);
		ctx.lineTo(poly[1].x, poly[1].y);
		ctx.lineTo(poly[2].x, poly[2].y);
		ctx.lineTo(poly[3].x, poly[3].y);
		ctx.closePath();

		ctx.fillStyle = '#888';
		ctx.fill();

		polyWorld = BSWG.physics.localToWorld([
			new b2Vec2(-this.width * 0.5 * 0.8, -this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, -this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, -this.height * 0.5 * 0.0),
			new b2Vec2(-this.width * 0.5 * 0.8, -this.height * 0.5 * 0.0)
		], this.obj.body);
		poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].x, poly[0].y);
		ctx.lineTo(poly[1].x, poly[1].y);
		ctx.lineTo(poly[2].x, poly[2].y);
		ctx.lineTo(poly[3].x, poly[3].y);
		ctx.closePath();

		ctx.fillStyle = '#fff';
		ctx.fill();

		polyWorld = BSWG.physics.localToWorld([
			new b2Vec2(-this.width * 0.5 * 0.8, this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, this.height * 0.5 * 0.85),
			new b2Vec2( this.width * 0.5 * 0.8, this.height * 0.5 * 0.15),
			new b2Vec2(-this.width * 0.5 * 0.8, this.height * 0.5 * 0.15)
		], this.obj.body);
		poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].x, poly[0].y);
		ctx.lineTo(poly[1].x, poly[1].y);
		ctx.lineTo(poly[2].x, poly[2].y);
		ctx.lineTo(poly[3].x, poly[3].y);
		ctx.closePath();

		ctx.fillStyle = '#66d';
		ctx.fill();

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

		if (rot) {
			this.obj.body.SetAwake(true);
			this.obj.body.ApplyTorque(rot*7.0);
		}
		
		if (accel) {
			var a = this.obj.body.GetAngle() + Math.PI/2.0;
			accel *= 5.0;
			this.obj.body.SetAwake(true);
			var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
			this.obj.body.ApplyForceToCenter(force);
		}

	},

};

BSWG.component_Blaster = {

	type: 'blaster',

	init: function(args) {

		var offsetAngle = this.offsetAngle = 0.0;

		var verts = [
			Math.rotVec2(new b2Vec2(-0.3, -0.3), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.3, -0.3), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.3,  0.3), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.05,  1.5), offsetAngle),
			Math.rotVec2(new b2Vec2(-0.05,  1.5), offsetAngle),
			Math.rotVec2(new b2Vec2(-0.3,  0.3), offsetAngle)
		];

		this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
			verts: verts
		});

		this.jpoints = [ new b2Vec2(0.0, -0.3),
						 new b2Vec2(-0.3, 0.0),
						 new b2Vec2(0.3, 0.0) ];

		this.fireKey = args.fireKey || BSWG.KEY.SPACE;
		this.thrustT = 0.0;

	},

	render: function(ctx, cam, dt) {

		var polyWorld = BSWG.physics.localToWorld(this.obj.verts, this.obj.body);
		var poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].x, poly[0].y);
		ctx.lineTo(poly[1].x, poly[1].y);
		ctx.lineTo(poly[2].x, poly[2].y);
		ctx.lineTo(poly[3].x, poly[3].y);
		ctx.lineTo(poly[4].x, poly[4].y);
		ctx.lineTo(poly[5].x, poly[5].y);
		ctx.closePath();

		ctx.fillStyle = '#f55';
		ctx.fill();

	},

	update: function(dt) {

		if (this.fireT) {
			this.fireT -= dt;
			if (this.fireT <= 0)
				this.fireT = 0.0;
		}

	},

	openConfigMenu: function() {

		if (BSWG.compActiveConfMenu)
			BSWG.compActiveConfMenu.remove();

		var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

		var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-100, y: p.y-25,
            w: 200, h: 50,
            key: this.fireKey,
            close: function (key) {
            	if (key)
                	self.fireKey = key;
            }
        });

	},

	closeConfigMenu: function() {

	},

	handleInput: function(keys) {

		var accel = 0;

		if (keys[this.fireKey] && !this.fireT) {

			var a = this.obj.body.GetAngle() - Math.PI/2.0;

			var pl = new b2Vec2(0.0,  1.5);
			var p = BSWG.physics.localToWorld([pl], this.obj.body);

			BSWG.blasterList.add(p[0], new b2Vec2(-Math.cos(a)*15.0, -Math.sin(a)*15.0));
			accel = 1;

			this.fireT = 0.5;
		}
		
		if (accel)
		{
			var a = this.obj.body.GetAngle() + Math.PI/2.0;
			accel *= -8.0;
			this.obj.body.SetAwake(true);
			var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
			this.obj.body.ApplyForceToCenter(force);	
			this.thrustT = 0.3;
		}

	},

};

BSWG.component_Thruster = {

	type: 'thruster',

	init: function(args) {

		var offsetAngle = this.offsetAngle = 0.0;

		var verts = [
			Math.rotVec2(new b2Vec2(-0.2, -0.5), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.2, -0.5), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.4,  0.5), offsetAngle),
			Math.rotVec2(new b2Vec2(-0.4,  0.5), offsetAngle)
		];

		this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
			verts: verts
		});

		this.jpoints = [ new b2Vec2(0.0, 0.5) ];

		this.thrustKey = args.thrustKey || BSWG.KEY.UP;
		this.thrustT = 0.0;

	},

	render: function(ctx, cam, dt) {

		var polyWorld = BSWG.physics.localToWorld(this.obj.verts, this.obj.body);
		var poly = cam.toScreenList(BSWG.render.viewport, polyWorld);

		ctx.beginPath();
		ctx.moveTo(poly[0].x, poly[0].y);
		ctx.lineTo(poly[1].x, poly[1].y);
		ctx.lineTo(poly[2].x, poly[2].y);
		ctx.lineTo(poly[3].x, poly[3].y);
		ctx.closePath();

		ctx.fillStyle = '#aea';
		ctx.fill();

		if (this.thrustT > 0) {

			var tpl = [
				Math.rotVec2(new b2Vec2(-0.2, -0.5), this.offsetAngle),
				Math.rotVec2(new b2Vec2( 0.0, -0.5 - this.thrustT * (2.0 + Math.random())), this.offsetAngle),
				Math.rotVec2(new b2Vec2( 0.2, -0.5), this.offsetAngle)
			];
			var tpw = BSWG.physics.localToWorld(tpl, this.obj.body);
			var tp = cam.toScreenList(BSWG.render.viewport, tpw);

			ctx.beginPath();
			ctx.moveTo(tp[0].x, tp[0].y);
			ctx.lineTo(tp[1].x, tp[1].y);
			ctx.lineTo(tp[2].x, tp[2].y);
			ctx.closePath();

			ctx.globalAlpha = Math.min(this.thrustT / 0.3, 1.0);

			var r = Math.random();
			if (r<0.5)
				ctx.fillStyle = '#f40';
			else if (r<0.75)
				ctx.fillStyle = '#ff0';
			else
				ctx.fillStyle = '#fff';
			ctx.fill();

			ctx.globalAlpha = 1.0;

			this.thrustT -= dt;

		}
		else
			this.thrustT = 0.0;

	},

	update: function(dt) {

	},

	openConfigMenu: function() {

		if (BSWG.compActiveConfMenu)
			BSWG.compActiveConfMenu.remove();

		var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

		var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-100, y: p.y-25,
            w: 200, h: 50,
            key: this.thrustKey,
            close: function (key) {
            	if (key)
                	self.thrustKey = key;
            }
        });

	},

	closeConfigMenu: function() {

	},

	handleInput: function(keys) {

		var accel = 0;

		if (keys[this.thrustKey]) accel += 1;
		
		if (accel)
		{
			var a = this.obj.body.GetAngle() + Math.PI/2.0;
			accel *= 20.0;
			this.obj.body.SetAwake(true);
			var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
			this.obj.body.ApplyForceToCenter(force);
			this.thrustT = 0.3;
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
		ctx.moveTo(poly[0].x, poly[0].y);
		ctx.lineTo(poly[1].x, poly[1].y);
		ctx.lineTo(poly[2].x, poly[2].y);
		ctx.lineTo(poly[3].x, poly[3].y);
		ctx.closePath();

		ctx.fillStyle = BSWG.componentList.mouseOver === this ? '#aaa' : '#888';
		ctx.fill();

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
	this.jpoints = new Array();
	this.jmatch = new Array();
	this.jmatch = -1;
	this.welds = new Object();
	this.onCC = null;
	if (this.type === 'cc')
		this.onCC = this;

	this.init(args);

	if (this.jpoints && this.jpoints.length && this.obj) {

		this.jpointsNormals = new Array(this.jpoints.length);
		for (var i=0; i<this.jpointsNormals.length; i++) {
			this.jpointsNormals[i] = BSWG.physics.getNormalAt(this.obj, this.jpoints[i]);
		}

	}

	this.remove = function() {

		BSWG.componentList.remove(this);

	};

	this.removeSafe = function() {

		BSWG.componentList.compRemove.push(this);

	};

	this.baseRenderOver = function(ctx, cam, dt) {

		// <-- Render wires here

		if (!this.jpointsw)
			return;

		var jp = cam.toScreenList(BSWG.render.viewport, this.jpointsw);

		var map = {};
		for (var i=0; i<this.jmatch.length; i++) {
			map[this.jmatch[i][0]] = true;
		}

		for (var i=0; i<jp.length; i++) {
			ctx.beginPath();
			var r = map[i]?(this.jmhover===i?160:110):80;
			if (this.welds[i])
				r = 110;
        	ctx.arc(jp[i].x, jp[i].y, r * cam.z, 0, 2*Math.PI);
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

	};

	this.cacheJPW = function() {
		if (this.jpointsw) {
			this.jpointsw = null;
		}
		this.jpointsw = BSWG.physics.localToWorld(this.jpoints, this.obj.body);
	};

	this.baseUpdate = function(dt) {

		if (!BSWG.game.editMode)
			return;

		if (!this.jpointsw)
			return;

		this.jmatch = new Array();
		this.jmhover = -1;

		var _p = this.obj.body.GetWorldCenter();
		var p = new b2Vec2(_p.x, _p.y);
		var cl = BSWG.componentList.withinRadius(p, this.obj.radius+0.5);

		var jpw = this.jpointsw;

        var mps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var mp = BSWG.game.cam.toWorld(BSWG.render.viewport, mps);

        var mind = 10.0;
        for (var i=0; i<jpw.length; i++) {
        	var tp = jpw[i];
        	var d = Math.pow(tp.x - mp.x, 2.0) +
        			Math.pow(tp.y - mp.y, 2.0);
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
				var jpw2 = cl[i].jpointsw;

				for (var k1=0; k1<jpw.length; k1++)
					for (var k2=0; k2<jpw2.length; k2++)
					{
						var p1 = jpw[k1];
						var p2 = jpw2[k2];
						var d2 = Math.pow(p1.x - p2.x, 2.0) +
								 Math.pow(p1.y - p2.y, 2.0);
						if (d2 < BSWG.component_minJMatch) {
							this.jmatch.push([
								k1, cl[i], k2
							]);
							break;
						}
					}
			}
		}

		if (this.jmhover >= 0 && BSWG.input.MOUSE_PRESSED('left')) {
			for (var i=0; i<this.jmatch.length; i++) {
				if (this.jmatch[i][0] === this.jmhover && this.jmatch[i][1].id > this.id) {
					if (!this.welds[this.jmatch[i][0]]) {
						var obj = BSWG.physics.createWeld(this.obj.body, this.jmatch[i][1].obj.body,
														  this.jpoints[this.jmatch[i][0]],
														  this.jmatch[i][1].jpoints[this.jmatch[i][2]],
														  true,
														  this.jpointsNormals[this.jmatch[i][0]],
														  this.jmatch[i][1].jpointsNormals[this.jmatch[i][2]]);

						if (this.onCC && !this.jmatch[i][1].onCC)
							this.jmatch[i][1].onCC = this.onCC;
						if (!this.onCC && this.jmatch[i][1].onCC)
							this.onCC = this.jmatch[i][1].onCC;

						this.welds[this.jmatch[i][0]] = obj;
						this.jmatch[i][1].welds[this.jmatch[i][2]] = obj;
					}
				}
			}
		}

	};

	this.pointIn = function(p) {

		return !!this.obj.fixture.TestPoint(p);

	};

	this.getLocalPoint = function(p) {

		var p2 = this.obj.body.GetLocalPoint(p);
		return new b2Vec2(p2.x, p2.y);

	};

	this.getWorldPoint = function(p) {

		var p2 = this.obj.body.GetWorldPoint(p);
		return new b2Vec2(p2.x, p2.y);

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

	this.compList = new Array();
	this.compRemove = new Array();

	this.clear = function () {

		while (this.compList.length)
			this.compList[0].remove();

		this.compRemove.length = 0;

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

	this.handleInput = function (cc, keys) {

		var len = this.compList.length;
		for (var i=0; i<len; i++)
		{
			if (!cc || this.compList[i].onCC === cc)
			{
				this.compList[i].handleInput(keys);
			}
		}

		if (this.mouseOver && this.mouseOver.openConfigMenu && this.mouseOver.onCC && BSWG.input.MOUSE_PRESSED('right') && BSWG.game.editMode)
		 	this.mouseOver.openConfigMenu();

	};

	this.update = function (dt) {

		var len = this.compList.length;
		for (var i=0; i<len; i++) {
			this.compList[i].cacheJPW();
		}
		for (var i=0; i<len; i++) {
			this.compList[i].baseUpdate(dt);
			this.compList[i].update(dt);
		}

		len = this.compRemove.length;
		for (var i=0; i<len; i++) {
			this.remove(this.compRemove[i]);
		}
		this.compRemove.length = 0;

	};

	this.render = function (ctx, cam, dt) {

		var p = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
		var pw = cam.toWorld(BSWG.render.viewport, p);
		this.mouseOver = this.atPoint(pw);

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
		var ret = new Array();
		var len = this.compList.length;
		for (var i=0; i<len; i++)
		{
			var p2 = this.compList[i].obj.body.GetWorldCenter();
			var dist = Math.pow(p2.x - p.x, 2.0) +
					   Math.pow(p2.y - p.y, 2.0);
			if (dist < Math.pow(r+this.compList[i].obj.radius, 2.0))
				ret.push(this.compList[i]);
		}
		return ret;
	}

}();