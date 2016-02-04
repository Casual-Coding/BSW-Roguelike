// BlockShip Wars Physics

window.b2createPolygonShape = function (vertices) {
    var shape = new Box2D.b2PolygonShape();            
    var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
    var offset = 0;
    for (var i=0;i<vertices.length;i++) {
        Box2D.setValue(buffer+(offset), vertices[i].get_x(), 'float'); // x
        Box2D.setValue(buffer+(offset+4), vertices[i].get_y(), 'float'); // y
        offset += 8;
    }            
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    shape.Set(ptr_wrapped, vertices.length);
    return shape;
};

window.__DC = 0;

Array.prototype.destroy = function () {
	var len = this.length;
	for (var i=0; i<len; i++)
	{
		if (typeof this[i] === 'object' && this[i].destroy)
			this[i].destroy();
		else
		{
			window.__DC += 1;
			Box2D.destroy(this[i]);
		}
	}
};

BSWG.physics = new function(){

	var fnToStringI = 1;
	var fnToString = function () {
		if (!this.prototype.____FNTSI) {
			this.prototype.____FNTSI = fnToStringI ++;
		}
		return "" + this.prototype.____FNTSI;
	};

	this.physicsDT 			= 1.0/60.0;
	this.positionIterations = 60;
	this.velocityIterations = 60;
	this.world 				= null;

	this.init = function (){

		for (var key in Box2D)
		{
			if (typeof Box2D[key] === "function")
				Box2D[key].toString = fnToString;
			if (key.substring(0, 2) == 'b2' && key.length >= 3)
				window[key] = Box2D[key];
		}

		this.world = new b2World( new b2Vec2(0.0, 0.0) );
		this.ground = this.world.CreateBody(new b2BodyDef());

	};

	this.localToWorld = function (vec, body) {

		if (typeof vec === 'object') {
			var len = vec.length;
			var ret = new Array(len);
			for (var i=0; i<len; i++) {
				var tmp = body.GetWorldPoint(vec[i]);
				ret[i] = new b2Vec2(tmp.get_x(), tmp.get_y());
			}
			return ret;
		}
		else {
			return body.GetWorldPoint(vec);
		}

	};

	this.createWeld = function (bodyA, bodyB, anchorA, anchorB, noCollide) {

		var obj = {
			jointDef: null,
			joint:    null
		};

		obj.jointDef = new b2RevoluteJointDef();
		obj.jointDef.set_bodyA( bodyA );
		obj.jointDef.set_bodyB( bodyB );
		obj.jointDef.set_localAnchorA( new b2Vec2( anchorA.get_x(), anchorA.get_y() ) );
		obj.jointDef.set_localAnchorB( new b2Vec2( anchorB.get_x(), anchorB.get_y() ) );
		obj.jointDef.set_collideConnected( !noCollide );
		obj.joint = this.world.CreateJoint( obj.jointDef );

		return obj;

	};

	this.mouseJoint = null;

	this.mousePosWorld = function () {

		var cam = BSWG.game.cam;
		var viewport = BSWG.render.viewport;
		var ps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
		var ret = cam.toWorld(viewport, ps);
		[ps].destroy();
		return ret;

	};

	this.startMouseDrag = function (body, maxForce) {

		if (this.mouseJoint)
			this.endMouseDrag();

		var mouseJointDef = new b2MouseJointDef();
		mouseJointDef.set_bodyA(this.ground);
		mouseJointDef.set_bodyB(body);
		mouseJointDef.set_maxForce(maxForce || 10.0);
		mouseJointDef.set_target(this.mousePosWorld());
		this.mouseJoint = this.world.CreateJoint(mouseJointDef);
		this.mouseJoint = Box2D.castObject(this.mouseJoint, b2MouseJoint);

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
		obj.bodyDef.set_type( b2_dynamicBody );
		obj.bodyDef.set_position( pos );
		obj.bodyDef.set_angle( angle );
		obj.body = this.world.CreateBody( obj.bodyDef );
		obj.body.SetLinearDamping(0.1);
		obj.body.SetAngularDamping(0.1);

		obj.fixtureDef = new b2FixtureDef();
		obj.fixtureDef.set_density( def.density || 1.0 );
		obj.fixtureDef.set_friction( (def.friction || def.friction === 0) ? def.friction : 0.5 );
		
		switch (type)
		{
			case 'circle':

				obj.shape = new b2CircleShape();
				obj.shape.set_m_radius( def.radius );
				obj.radius = def.radius;
				break;

			case 'polygon':

				var verts = [];
				for (var i=0; i<def.verts.length; i++)
					verts.push(Math.rotVec2(def.verts[i], def.offsetAngle));
				obj.verts = verts;
				obj.shape = b2createPolygonShape( verts );
				break;

			case 'box':

				var verts = [
					Math.rotVec2(new b2Vec2(-def.width * 0.5, -def.height * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2( def.width * 0.5, -def.height * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2( def.width * 0.5,  def.height * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2(-def.width * 0.5,  def.height * 0.5), def.offsetAngle)
				];
				obj.verts = verts;
				obj.shape = b2createPolygonShape( verts );
				break;

			default:
				break;
		}

		if (obj.verts) {
			obj.radius = 0;
			for (var i=0; i<obj.verts.length; i++)
			{
				var v = obj.verts[i];
				obj.radius = Math.max(obj.radius,
					v.get_x()*v.get_x() + v.get_y()*v.get_y()
				);
			}
			obj.radius = Math.sqrt(obj.radius);
		}

		obj.fixtureDef.set_shape( obj.shape );
		obj.fixture = obj.body.CreateFixture( obj.fixtureDef );

		return obj;

	};

	this.reset = function (){

	};

	this.update = function (dt){

		this.world.Step(dt, this.positionIterations, this.velocityIterations);
		this.updateMouseDrag();

	};

}();