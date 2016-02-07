// BlockShip Wars Physics

BSWG.physics = new function(){

	this.physicsDT 			= 1.0/60.0;
	this.positionIterations = 60;
	this.velocityIterations = 60;
	this.world 				= null;

	this.init = function (){

		var scan = function (map) {
			for (var key in map) {
				if (key.substring(0, 2) == 'b2' && key.length >= 3)	{
					if (window[key]) {
						console.log('Collision: ' + key);
					}
					window[key] = map[key];
				}
				else if (typeof map[key] === 'object') {
					scan(map[key]);
				}
			}
		};
		scan(Box2D);

		b2Body.prototype.ApplyForceToCenter = function(v) {
			this.ApplyForce(v, this.GetWorldCenter());
		};

		this.world = new b2World( new b2Vec2(0.0, 0.0) );
		this.ground = this.world.CreateBody(new b2BodyDef());

	};

	this.localToWorld = function (vec, body) {

		if (vec instanceof Array) {
			var len = vec.length;
			var ret = new Array(len);
			for (var i=0; i<len; i++) {
				var tmp = body.GetWorldPoint(vec[i]);
				ret[i] = new b2Vec2(tmp.x, tmp.y);
			}
			return ret;
		}
		else {
			return body.GetWorldPoint(vec);
		}

	};

	this.createWeld = function (bodyA, bodyB, anchorA, anchorB, noCollide, normalA, normalB) {

		var obj = {
			jointDef: null,
			joint:    null
		};

		obj.jointDef = new b2WeldJointDef();
		obj.jointDef.bodyA = bodyA;
		obj.jointDef.bodyB = bodyB;
		obj.jointDef.localAnchorA = new b2Vec2( anchorA.x, anchorA.y );
		obj.jointDef.localAnchorB = new b2Vec2( anchorB.x, anchorB.y );
		obj.jointDef.collideConnected = !noCollide;
		var a1 = Math.atan2(normalA.y, normalA.x);
		var a2 = Math.atan2(normalB.y, normalB.x);
		var am = Math.min(Math.abs(a1), Math.abs(a2));
		if (am <= 0.0)
			am = Math.PI / 2.0;
		obj.jointDef.referenceAngle = Math.round((bodyB.GetAngle() - bodyA.GetAngle()) / am) * am;
		obj.joint = this.world.CreateJoint( obj.jointDef );

		return obj;

	};

	this.mouseJoint = null;

	this.mousePosWorld = function () {

		var cam = BSWG.game.cam;
		var viewport = BSWG.render.viewport;
		var ps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
		var ret = cam.toWorld(viewport, ps);
		return ret;

	};

	this.startMouseDrag = function (body, maxForce) {

		if (this.mouseJoint)
			this.endMouseDrag();

		var mouseJointDef = new b2MouseJointDef();
		mouseJointDef.bodyA = this.ground;
		mouseJointDef.bodyB = body;
		mouseJointDef.maxForce = maxForce || 10.0;
		mouseJointDef.target = this.mousePosWorld();
		this.mouseJoint = this.world.CreateJoint(mouseJointDef);
		//this.mouseJoint = Box2D.castObject(this.mouseJoint, b2MouseJoint);

	};

	this.endMouseDrag = function () {

		if (this.mouseJoint) {
			this.world.DestroyJoint( this.mouseJoint );
			this.mouseJoint = null;
		}

	};

	this.mouseDragSetMaxForce = function (maxForce) {

		if (this.mouseJoint) {
			this.mouseJoint.SetMaxForce(maxForce || 10.0);
		}

	};

	this.updateMouseDrag = function () {

		if (this.mouseJoint)
			this.mouseJoint.SetTarget(this.mousePosWorld());

	};

	this.getNormalAt = function (obj, p) {

		if (obj.verts.length < 2) {
			return new b2Vec2(0, 0);
		}

		var best = null;
		var besti = 0;

		for (var i=0; i<obj.verts.length; i++) {
			var p1 = obj.verts[i],
				p2 = obj.verts[(i+1)%obj.verts.length];
			var dist = Math.pointLineDistance(p1, p2, p);
			if (best === null || dist < best) {
				best = dist;
				besti = i;
			}
		}

		var p1 = obj.verts[besti],
			p2 = obj.verts[(besti+1)%obj.verts.length];

		var dx = p2.x - p1.x,
			dy = p2.y - p1.y;
		var len = Math.sqrt(dx*dx + dy*dy);
		dx /= len;
		dy /= len;

		return new b2Vec2(-dy, dx);

	};

	this.createObject = function (type, pos, angle, def) {

		var obj = {
			bodyDef:    null,
			body:  	    null,
			shape:      null,
			fixtureDef: null,
			verts:      [],
			radius:     0,
		};

		obj.bodyDef = new b2BodyDef();
		obj.bodyDef.type = b2Body.b2_dynamicBody;
		obj.bodyDef.position = pos;
		obj.bodyDef.angle = angle;
		obj.body = this.world.CreateBody( obj.bodyDef );
		obj.body.SetLinearDamping(0.1);
		obj.body.SetAngularDamping(0.1);

		obj.fixtureDef = new b2FixtureDef();
		obj.fixtureDef.density = def.density || 1.0;
		obj.fixtureDef.friction = (def.friction || def.friction === 0) ? def.friction : 0.5;
		
		switch (type)
		{
			case 'circle':

				obj.shape = new b2CircleShape();
				obj.shape.m_radius = def.radius;
				obj.radius = def.radius;
				break;

			case 'polygon':

				var verts = [];
				for (var i=0; i<def.verts.length; i++)
					verts.push(Math.rotVec2(def.verts[i], def.offsetAngle));
				obj.verts = verts;
				obj.shape = b2PolygonShape.AsArray(verts, verts.length);
				break;

			case 'box':

				var verts = [
					Math.rotVec2(new b2Vec2(-def.width * 0.5, -def.height * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2( def.width * 0.5, -def.height * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2( def.width * 0.5,  def.height * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2(-def.width * 0.5,  def.height * 0.5), def.offsetAngle)
				];
				obj.verts = verts;
				obj.shape = b2PolygonShape.AsArray(verts, verts.length);
				break;

			default:
				break;
		}

		if (obj.verts) {
			obj.radius = 0;
			for (var i=0; i<obj.verts.length; i++) {
				var v = obj.verts[i];
				obj.radius = Math.max(obj.radius,
					v.x*v.x + v.y*v.y
				);
			}
			obj.radius = Math.sqrt(obj.radius);
		}

		obj.fixtureDef.shape = obj.shape;
		obj.fixture = obj.body.CreateFixture( obj.fixtureDef );
		obj.body.ResetMassData();

		return obj;

	};

	this.reset = function (){

	};

	this.update = function (dt){

		this.world.Step(dt, this.positionIterations, this.velocityIterations);
		this.world.ClearForces();
		this.updateMouseDrag();

	};

}();