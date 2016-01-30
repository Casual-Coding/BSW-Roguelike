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

Array.prototype.destroy = function () {
	var len = this.len;
	for (var i=0; i<len; i++)
	{
		if (this[i].destroy)
			this[i].destroy();
		else
			b2free(this[i]);
	}
};

BSWG.physics = new function(){

	this.physicsDT 			= 1.0/60.0;
	this.positionIterations = 10;
	this.velocityIterations = 10;
	this.world 				= null;

	this.init = function (){

		for (var key in Box2D)
		{
			if (key.substring(0, 2) == 'b2' && key.length >= 3)
				window[key] = Box2D[key];
		}
		window['b2free'] = Box2D.destroy;

		this.world = new b2World( new b2Vec2(0.0, 0.0) );
		this.world.SetAllowSleeping(false);

	};

	this.localToWorld = function (vec, body) {

		if (typeof vec === typeof []) {
			var ret = [];
			var len = vec.length;
			for (var i=0; i<len; i++)
			{
				var tmp = body.GetWorldPoint(vec[i]);
				ret.push(new b2Vec2(tmp.get_x(), tmp.get_y()));
			}
			return ret;
		}
		else {
			return body.GetWorldPoint(vec);
		}

	};

	this.createObject = function (type, pos, angle, def){

		var obj = {
			bodyDef:    null,
			body:  	    null,
			shape:      null,
			fixtureDef: null,
			verts:      []
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

		obj.fixtureDef.set_shape( obj.shape );
		obj.body.CreateFixture( obj.fixtureDef );

		return obj;

	};

	this.reset = function (){

	};

	this.update = function (dt){

		this.world.Step(dt, this.positionIterations, this.velocityIterations);

	};

}();