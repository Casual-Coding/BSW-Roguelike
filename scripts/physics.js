// BlockShip Wars Physics

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

		this.world = new b2World( new b2Vec2(0.0, 0.0) );

	};

	this.createObject = function (type, pos, angle, def){

		var obj = {
			bodyDef:    null,
			body:  	    null,
			shape:      null,
			fixtureDef: null,
		};

		obj.bodyDef = new b2BodyDef();
		obj.bodyDef.set_type( b2_dynamicBody );
		obj.bodyDef.set_position( pos );
		obj.bodyDef.set_angle( angle );
		obj.body = this.world.CreateBody( obj.bodyDef );

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
				obj.shape = createPolygonShape( verts );
				break;

			case 'box':

				var verts = [
					Math.rotVec2(new b2Vec2(-def.w * 0.5, -def.h * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2( def.w * 0.5, -def.h * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2( def.w * 0.5,  def.h * 0.5), def.offsetAngle),
					Math.rotVec2(new b2Vec2(-def.w * 0.5,  def.h * 0.5), def.offsetAngle)
				];
				obj.shape = createPolygonShape( verts );
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

	this.update = function (){

		this.world.Step(this.physicsDT, this.positionIterations, this.velocityIterations);

	};

}();