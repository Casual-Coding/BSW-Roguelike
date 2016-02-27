// BlockShip Wars Physics

BSWG.physics = new function(){

    this.physicsDT          = 1.0/60.0;
    this.positionIterations = 60;
    this.velocityIterations = 60;
    this.world              = null;
    this.maxWeldForce       = 5000.0;
    this.welds              = [];

    this.init = function (){

        var scan = function (map) {
            for (var key in map) {
                if (key.substring(0, 2) == 'b2' && key.length >= 3) {
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

        b2Vec2.prototype.THREE = function(z) {
            return new THREE.Vector3(this.x, this.y, z);
        };

        b2Vec2.prototype.particleWrap = function(z) {
            var pos = new THREE.Vector3(this.x, this.y, z);
            return function(vx, vy, vz) {
                pos.x += vx;
                pos.y += vy;
                pos.z += vz;
                return pos;
            };
        };

        if (!b2Vec2.prototype.clone) {
            b2Vec2.prototype.clone = function() {
                return new b2Vec2(this.x, this.y);
            };
        }

        this.world = new b2World( new b2Vec2(0.0, 0.0) );
        this.ground = this.world.CreateBody(new b2BodyDef());
        this.chandler = new b2ContactListener();
        this.chandler.PreSolve = this.collisionCallbackPre;
        this.chandler.PostSolve = this.collisionCallback;
        this.world.SetContactListener(this.chandler);

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

    this.createWeld = function (bodyA, bodyB, anchorA, anchorB, noCollide, normalA, normalB, motorA, motorB, noMotor) {

        var obj = {
            jointDef: null,
            joint:    null,
            age:      0,
            other:    null,
            revolute: motorA ? true : false,
            noMotor:  !!noMotor
        };

        if (!motorA) {
            obj.jointDef = new b2WeldJointDef();
            obj.jointDef.collideConnected = !noCollide;
        }
        else {
            obj.jointDef = new b2RevoluteJointDef();
            obj.jointDef.collideConnected = true;
            obj.jointDef.enableMotor = !obj.noMotor;
            if (obj.jointDef.enableMotor) {
                obj.jointDef.motorSpeed = 0.0;
                obj.jointDef.maxMotorTorque = bodyA.GetMass() * 30.0;
            }
        }
    
        obj.jointDef.bodyA = bodyA;
        obj.jointDef.bodyB = bodyB;
        obj.jointDef.localAnchorA = new b2Vec2( anchorA.x, anchorA.y );
        obj.jointDef.localAnchorB = new b2Vec2( anchorB.x, anchorB.y );

        if (!motorA) {

            var k = 64;
            var amt = Math.PI/16.0;
            var angle = bodyB.GetAngle();

            var na = Math.rotVec2(new b2Vec2(normalA.x, normalA.y), bodyA.GetAngle());

            while (--k >= 0) {

                var a1 = angle - amt;
                var a2 = angle + amt;

                var n1 = Math.rotVec2(normalB, a1);
                var n2 = Math.rotVec2(normalB, a2);

                var d1 = Math.pow(n1.x+na.x, 2.0) + Math.pow(n1.y+na.y, 2.0);
                var d2 = Math.pow(n2.x+na.x, 2.0) + Math.pow(n2.y+na.y, 2.0);

                if (d1 < d2) {
                    angle = a1;
                }
                else {
                    angle = a2;
                }

                amt /= 2.0;
            }

            angle -= bodyA.GetAngle();
            obj.jointDef.referenceAngle = angle;

        }

        obj.joint = this.world.CreateJoint( obj.jointDef );

        this.welds.push(obj);

        return obj;

    };

    this.removeWeld = function ( obj ) {

        for (var i=0; i<this.welds.length; i++) {
            if (this.welds[i] === obj) {
                this.welds.splice(i, 1);
                break;
            }
        }

        this.world.DestroyJoint( obj.joint );
        obj.joint = null;
        obj.jointDef = null;

    };

    this.mouseJoint = null;

    this.mousePosWorld = function () {

        var ps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var ret = BSWG.render.unproject3D(ps, 0.0);
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

        if (obj.type === 'multipoly') {
            var bestp = null;
            var best = null;
            for (var k=0; k<obj.verts.length; k++) {
                var verts = obj.verts[k];
                if (verts.length >= 2) {
                    var besti = -1;

                    for (var i=0; i<verts.length; i++) {
                        var p1 = verts[i],
                            p2 = verts[(i+1)%verts.length];
                        var dist = Math.pointLineDistance(p1, p2, p);
                        if (best === null || dist < best) {
                            best = dist;
                            besti = i;
                        }
                    }

                    if (besti >= 0) {

                        var p1 = verts[besti],
                            p2 = verts[(besti+1)%verts.length];

                        var dx = p2.x - p1.x,
                            dy = p2.y - p1.y;
                        var len = Math.sqrt(dx*dx + dy*dy);
                        dx /= len;
                        dy /= len;

                        bestp = new b2Vec2(dy, -dx);
                    }
                }
            }
            if (bestp) {
                return bestp;
            }
            else {
                return new b2Vec2(0, 0);
            }
        }

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

        return new b2Vec2(dy, -dx);

    };

    this.createObject = function (type, pos, angle, def) {

        var obj = {
            bodyDef:    null,
            body:       null,
            shape:      null,
            fixtureDef: null,
            verts:      [],
            radius:     0,
            type:       type
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
                for (var i=0; i<def.verts.length; i++) {
                    verts.push(Math.rotVec2(def.verts[i], def.offsetAngle));
                }
                obj.verts = verts;
                obj.shape = b2PolygonShape.AsArray(verts, verts.length);
                break;

            case 'multipoly':

                obj.shape = [];
                obj.verts = [];

                for (var j=0; j<def.verts.length; j++) {
                    var poly = def.verts[j];
                    var verts = new Array(poly.length);
                    for (var i=0; i<poly.length; i++) {
                        verts[i] = Math.rotVec2(poly[i], def.offsetAngle);
                    }
                    obj.verts.push(verts);
                    obj.shape.push(b2PolygonShape.AsArray(verts, verts.length));
                }
                break;

            case 'box':

                var verts = [
                    Math.rotVec2(new b2Vec2(-def.width * 0.5, -def.height * 0.5), def.offsetAngle),
                    Math.rotVec2(new b2Vec2( def.width * 0.5, -def.height * 0.5), def.offsetAngle),
                    Math.rotVec2(new b2Vec2( def.width * 0.5,  def.height * 0.5), def.offsetAngle),
                    Math.rotVec2(new b2Vec2(-def.width * 0.5,  def.height * 0.5), def.offsetAngle)
                ];

                if (def.triangle === -1)
                    verts.splice(0, 1);
                else if (def.triangle === 1)
                    verts.splice(1, 1);

                obj.verts = verts;
                obj.shape = b2PolygonShape.AsArray(verts, verts.length);
                break;

            default:
                break;
        }

        if (obj.type === 'multipoly') {
            obj.radius = 0;
            for (var i=0; i<obj.verts.length; i++) {
                for (var j=0; j<obj.verts[i].length; j++) {
                    var v = obj.verts[i][j];
                    obj.radius = Math.max(obj.radius,
                        v.x*v.x + v.y*v.y
                    );
                }
            }
            obj.radius = Math.sqrt(obj.radius);

            obj.fixture = new Array(obj.shape.length);
            for (var i=0; i<obj.shape.length; i++) {
                obj.fixtureDef.shape = obj.shape[i];
                obj.fixture[i] = obj.body.CreateFixture( obj.fixtureDef );
            }
        }
        else {
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
        }

        obj.body.ResetMassData();

        return obj;

    };

    this.getBounds = function(body) {
        var aabb = null;
        var fixture = body.GetFixtureList();
        while (fixture)
        {
            var fb = fixture.GetAABB();
            if (!aabb) {
                aabb = new b2AABB();
                aabb.lowerBound = new b2Vec2(fb.lowerBound.x, fb.lowerBound.y);
                aabb.upperBound = new b2Vec2(fb.upperBound.x, fb.upperBound.y);
            }
            else {
                aabb.Combine(aabb, fb);
            }
            fixture = fixture.GetNext();
        }
        return aabb;
    };

    this.getRadiusCenter = function(body) {
        var bounds = this.getBounds(body);
        var center = new b2Vec2(
            (bounds.lowerBound.x + bounds.upperBound.x) * 0.5,
            (bounds.lowerBound.y + bounds.upperBound.y) * 0.5
        );
        var r = Math.sqrt(
            Math.min(
                Math.distSqVec2(bounds.lowerBound, center),
                Math.distSqVec2(bounds.upperBound, center)
            )
        );
        return {
            p: center,
            r: r
        };
    };

    this.bodyDistance = function(a, b) {
        var arc = this.getRadiusCenter(a);
        var brc = this.getRadiusCenter(b);
        return Math.distVec2(arc.p, brc.p) - (arc.r + brc.r);
    };

    this.reset = function (){

    };

    this.lastDT = 1.0/60.0;

    this.update = function (dt){

        this.lastDT = dt;

        for (var i=0; i<this.welds.length; i++) {
            var t = this.welds[i].joint.GetReactionTorque(1.0/dt);
            var f = this.welds[i].joint.GetReactionForce(1.0/dt);
            var tn = Math.abs(t);
            var fn = Math.sqrt(f.x*f.x + f.y*f.y);
            if (Math.max(tn, fn) > this.maxWeldForce) {
                this.welds[i].broken = true;
            }
            if (this.welds[i].age > 10 && this.welds[i].age < 20 && !this.welds[i].revolute) {
                var ref = this.welds[i].jointDef.referenceAngle;
                var aref = this.welds[i].joint.GetBodyB().GetAngle() - this.welds[i].joint.GetBodyA().GetAngle();
                var diff = Math.abs(Math.atan2(Math.sin(aref-ref), Math.cos(aref-ref)));
                if (diff > (Math.PI/3600.0)) {
                    this.welds[i].broken = true;
                }
            }
            this.welds[i].age += 1;
        }

        this.world.Step(dt, this.positionIterations, this.velocityIterations);
        this.world.ClearForces();
        this.updateMouseDrag();

        for (var i=0; i<this.welds.length; i++) {
            if (this.welds[i].revolute && !this.welds[i].noMotor) {
                this.welds[i].joint.SetMotorSpeed(0);
            }
        }

    };

    this.collisionCallbackPre = function(contact) {
        if (contact.IsTouching()) {
            var ba = contact.GetFixtureA().GetBody();
            var bb = contact.GetFixtureB().GetBody();
            var ta = ba.GetLinearVelocity();
            var tb = bb.GetLinearVelocity();
            if (!ba.__lastVel) {
                ba.__lastVel = ta.clone();
            }
            else {
                ba.__lastVel.x = ta.x;
                ba.__lastVel.y = ta.y;
            }
            if (!bb.__lastVel) {
                bb.__lastVel = tb.clone();
            }
            else {
                bb.__lastVel.x = tb.x;
                bb.__lastVel.y = tb.y;
            }
        }
    }

    var self = this;

    this.collisionCallback = function(contact, impulse) {

        var ba = contact.GetFixtureA().GetBody();
        var bb = contact.GetFixtureB().GetBody();
        var ta = ba.GetLinearVelocity().clone();
        var tb = bb.GetLinearVelocity().clone();

        ta.x -= ba.__lastVel.x;
        ta.y -= ba.__lastVel.y;
        tb.x -= bb.__lastVel.x;
        tb.y -= bb.__lastVel.y;

        var forceA = (Math.lenVec2(ta) * ba.GetMass()) / self.lastDT;
        var forceB = (Math.lenVec2(tb) * bb.GetMass()) / self.lastDT;
        var tforce = forceA + forceB;

        if (tforce > 0.75) {
            var wm = new b2WorldManifold();
            contact.GetWorldManifold(wm);
            var p = wm.m_points[0];
            BSWG.render.boom.palette = chadaboom3D.fire_bright;
            for (var i=0; i<2; i++) {
                var a = Math.random() * Math.PI * 2.0;
                var v = [ba, bb][i].GetLinearVelocityFromWorldPoint(p);
                BSWG.render.boom.add(
                    p.particleWrap(0.0),
                    0.2*Math.pow(tforce, 0.125),
                    32,
                    0.3*Math.pow(tforce, 0.33),
                    4.0,
                    new b2Vec2(Math.cos(a)*tforce*0.005+v.x, Math.sin(a)*tforce*0.005+v.y).THREE(Math.random()*3.0)
                );
            }
        }

    };

}();