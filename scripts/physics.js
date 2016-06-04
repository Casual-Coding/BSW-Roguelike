// BlockShip Wars Physics

BSWG.hitDmg  = 0.01;
BSWG.meleDmg = 4.5;
BSWG.meleDef = 10.0;

BSWG.physics = new function(){

    this.physicsDT          = 1.0/60.0; // not used
    this.positionIterations = 32;
    this.velocityIterations = 32;
    this.world              = null;
    this.maxWeldForce       = 15000.0;
    this.welds              = [];
    this.objects            = [];
    this.baseDamping        = 0.225;

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
            return new THREE.Vector3(this.x, this.y, z);
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

    this.weldID = 1;
    this.createWeld = function (bodyA, bodyB, anchorA, anchorB, noCollide, normalA, normalB, motorA, motorB, noMotor) {

        var obj = {
            jointDef: null,
            joint:    null,
            age:      0,
            other:    null,
            revolute: motorA ? true : false,
            noMotor:  !!noMotor,
            objA:     null,
            objB:     null,
            id:       this.weldID++
        };

        for (var i=0; i<this.objects.length; i++) {
            if (this.objects[i].body === bodyA) {
                obj.objA = this.objects[i];
            }
            if (this.objects[i].body === bodyB) {
                obj.objB = this.objects[i];
            }
        }

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
                obj.jointDef.maxMotorTorque = bodyA.GetMass() * 90.0;
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
        obj.objA.welds.push(obj);
        obj.objB.welds.push(obj);

        this.welds.push(obj);

        return obj;

    };

    this.removeWeld = function ( obj ) {

        if (!obj) {
            return;
        }

        var found = false;

        for (var i=0; i<this.welds.length; i++) {
            if (this.welds[i].id === obj.id) {
                this.welds[i] = null;
                this.welds.splice(i, 1);
                found = true;
                break;
            }
        }

        if (!found) {
            return;
        }

        var remWeld = function(obj, search) {
            for (var j=0; j<obj.welds.length; j++) {
                if (obj.welds[j].id === search.id) {
                    obj.welds.splice(j, 1);
                    j --;
                }
            }
        };

        for (var i=0; i<this.objects.length; i++) {
            if (this.objects[i].id === obj.objA.id) {
                remWeld(this.objects[i], obj);
            }
            if (this.objects[i].id === obj.objB.id) {
                remWeld(this.objects[i], obj);
            }
        }

        this.world.DestroyJoint( obj.joint );
        obj.joint = null;
        obj.jointDef = null;
        obj.objA = null;
        obj.objB = null;

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

    this.objID = 1;

    this.createObject = function (type, pos, angle, def) {

        var obj = {
            bodyDef:    null,
            body:       null,
            shape:      null,
            fixtureDef: null,
            verts:      [],
            radius:     0,
            type:       type,
            welds:      [],
            id:         this.objID ++,
            static:     def && def.static
        };

        obj.bodyDef = new b2BodyDef();
        if (!obj.static) {
            obj.bodyDef.type = b2Body.b2_dynamicBody;
        }
        obj.bodyDef.position = pos;
        obj.bodyDef.angle = angle;
        obj.body = this.world.CreateBody( obj.bodyDef );
        obj.body.SetLinearDamping(this.baseDamping);
        obj.body.SetAngularDamping(this.baseDamping);

        obj.body.__mele = !!def.isMele;

        obj.fixtureDef = new b2FixtureDef();
        obj.fixtureDef.density = def.density || 1.0;
        obj.fixtureDef.friction = (def.friction || def.friction === 0) ? def.friction : 0.25;
        obj.fixtureDef.restitution = def.restitution || 0.0;
       
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
                if (def.smooth) {
                    verts = Math.smoothPoly(verts, def.smooth);
                }

                obj.verts = verts;
                obj.shape = b2PolygonShape.AsArray(Math.scalePoly(verts, 0.99), verts.length);
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
                    if (def.smooth) {
                        verts = Math.smoothPoly(verts, def.smooth);
                    }
                    obj.verts.push(verts);
                    obj.shape.push(b2PolygonShape.AsArray(Math.scalePoly(verts, 0.99), verts.length));
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

                if (def.smooth) {
                    verts = Math.smoothPoly(verts, def.smooth);
                }

                obj.verts = verts;
                obj.shape = b2PolygonShape.AsArray(Math.scalePoly(verts, 0.99), verts.length);
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
                if (def.frictionList) {
                    obj.fixtureDef.friction = def.frictionList[i];
                }
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

        this.objects.push(obj);

        return obj;

    };

    this.removeObject = function(obj) {

        if (!obj) {
            return;
        }

        obj.comp = null;
        if (obj.body) {
            obj.body.__comp = null;
        }

        while (obj.welds && obj.welds.length > 0) {
            this.removeWeld(obj.welds[0]);
        }
        obj.welds = null;

        var found = false;

        for (var i=0; i<this.objects.length; i++) {
            if (this.objects[i].id === obj.id) {
                found = true;
                this.objects[i] = null;
                this.objects.splice(i, 1);
                break;
            }
        }

        if (!found) {
            return;
        }

        this.world.DestroyBody(obj.body);
        obj.body = null;
        obj.fixture = null;
        obj.fixtureDef = null;
        obj.shape = null;
        obj.verts = null;

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

    this.bodyDistancePoint = function(a, b, br) {
        var arc = this.getRadiusCenter(a);
        return Math.distVec2(arc.p, b) - (arc.r + br);
    };

    this.scrapes = [];

    this.reset = function (){

        for (var i=0; i<this.scrapes.length; i++) {
            this.scrapes[i].a.stop();
            this.scrapes[i].b.stop();
            this.scrapes[i].a = null;
            this.scrapes[i].b = null;
            delete this.scrapes[i].a;
            delete this.scrapes[i].b;
            this.scrapes[i] = null;
        }
        this.scrapes = [];

        while (this.welds.length) {
            this.removeWeld(this.welds[0]);
        }

        while (this.objects.length) {
            this.removeObject(this.objects[0]);
        }

        if (this.mouseJoint) {
            this.world.DestroyJoint(this.mouseJoint);
            this.mouseJoint = null;
        }

        this.lastDT = 1.0/60.0;

    };

    this.lastDT = 1.0/60.0;

    this.framen = 0;

    this.update = function (dt){

        this.lastDT = dt;

        for (var i=0; i<this.welds.length; i++) {
            var t = this.welds[i].joint.GetReactionTorque(1.0/dt);
            var f = this.welds[i].joint.GetReactionForce(1.0/dt);
            var tn = Math.abs(t);
            var fn = Math.sqrt(f.x*f.x + f.y*f.y);
            var mwf = this.maxWeldForce;
            var compA = this.welds[i].objA ? this.welds[i].objA.comp : null;
            var compB = this.welds[i].objB ? this.welds[i].objB.comp : null;
            var atts = Math.max(
                (compA && compA.attStrength) ? compA.attStrength : 1.0,
                (compB && compB.attStrength) ? compB.attStrength : 1.0
            );
            var minHealth = Math.min(compA ? compA.hp / compA.maxHP : 1.0,
                                     compB ? compB.hp / compB.maxHP : 1.0);
            mwf *= (Math.pow(minHealth, 1/atts)-0.25);
            if (Math.max(tn, fn) > mwf) {
                this.welds[i].broken = true;
            }
            if (this.welds[i].age > 10 && this.welds[i].age < 20 && !this.welds[i].revolute) {
                var ref = this.welds[i].jointDef.referenceAngle;
                var aref = this.welds[i].joint.GetBodyB().GetAngle() - this.welds[i].joint.GetBodyA().GetAngle();
                var diff = Math.abs(Math.atan2(Math.sin(aref-ref), Math.cos(aref-ref)));
                if (diff > (Math.PI/360.0)) {
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

        for (var i=0; i<this.scrapes.length; i++) {
            var S = this.scrapes[i];
            if ((S.lframe + 2) < this.framen) {
                S.a.stop();
                S.b.stop();
                S.a = null;
                S.b = null;
                S.lp = null;
                delete S.lp;
                delete S.a;
                delete S.b;
                delete S.lframe;
                var contact = S.parent;
                contact._sound = null;
                delete contact._sound;
                S.parent = null;
                delete S.parent;
                this.scrapes[i] = null;
                this.scrapes.splice(i, 1);
            }
            S = null;
        }

        this.framen += 1;

    };

    var wm = null;

    this.collisionCallbackPre = function(contact) {
        var ba = contact.GetFixtureA().GetBody();
        var bb = contact.GetFixtureB().GetBody();
        ba.__lastForce = 0;
        bb.__lastForce = 0;
        ba = bb = contact = null;
    }

    var self = this;

    this.collisionCallback = function(contact, _impulse) {

        var impulse = 0;
        for (var i=0; i<_impulse.normalImpulses.length; i++) {
            impulse = Math.max(impulse, _impulse.normalImpulses[i]);
        }

        if (!wm) {
             wm = new b2WorldManifold();
        }

        var ba = contact.GetFixtureA().GetBody();
        var bb = contact.GetFixtureB().GetBody();
        contact.GetWorldManifold(wm);
        var p = wm.m_points[0];
        var ta = ba.GetLinearVelocityFromWorldPoint(p);
        var tb = bb.GetLinearVelocityFromWorldPoint(p);

        var ma = ba.GetMass(), mb = bb.GetMass();

        var forceA = impulse / self.lastDT;
        var forceB = impulse / self.lastDT;

        var p3 = p.THREE(0.2);
        var S = contact._sound || null;
        var newSound = !S;

        if (newSound) {
            S = contact._sound = {
                a: new BSWG.soundSample(),
                b: new BSWG.soundSample(),
                lframe: self.framen,
                parent: contact,
                va: 0, vb: 0, ra: 0, rb: 0, lp: p3
            }
            S.a.play('scrape', p3, 1.0, 1.0, true);
            S.b.play('scrape', p3, 1.0, 1.0, true);
            self.scrapes.push(S);
        }

        S.a.volume(S.va = Math.clamp(forceA / 2, 0, 1.75));
        S.b.volume(S.vb = Math.clamp(forceB / 2, 0, 1.75));
        S.a.rate(S.ra = 0.35 / (ma / 2.5));
        S.b.rate(S.rb = 0.35 / (mb / 2.5));
        S.a.position(p3);
        S.b.position(p3);
        S.lframe = self.framen;
        S.lp.set(p3.x, p3.y, p3.z);

        if (newSound) {
            new BSWG.soundSample().play('bump', S.lp, S.va/2.0, S.ra);
            new BSWG.soundSample().play('bump', S.lp, S.vb/2.0, S.rb);               
        }

        p3 = null;
        S = null;

        var tforce = forceA + forceB;

        ba.__lastForce += forceA;
        bb.__lastForce += forceB;
        ba.__lastHit = bb;
        bb.__lastHit = ba;

        if (tforce > 1.0) {

            if (ba.__comp && bb.__comp) {
                ba.__comp.takeDamage(forceA * (ba.__mele ? 1/BSWG.meleDef : 1)
                                            * (bb.__mele ? BSWG.meleDmg : 1) * BSWG.hitDmg, bb.__comp);
                bb.__comp.takeDamage(forceB * (bb.__mele ? 1/BSWG.meleDef : 1)
                                            * (ba.__mele ? BSWG.meleDmg : 1) * BSWG.hitDmg, ba.__comp);
            }

            if (Math.random() < 1/2) {
                var a = Math.random() * Math.PI * 2.0;
                var v = [ta, tb][Math.floor(Math.random()*10000) % 2];
                BSWG.render.boom.palette = chadaboom3D.fire_bright;
                BSWG.render.boom.add(
                    p.particleWrap(0.0),
                    0.35*Math.pow(tforce, 0.125),
                    32,
                    0.1*Math.pow(tforce, 0.33),
                    4.0,
                    new b2Vec2(Math.cos(a)*tforce*0.005+v.x, Math.sin(a)*tforce*0.005+v.y).THREE(Math.random()*3.0)
                );
                v = null;
            }
        }

        ta = tb = ba = bb = contact = null;

    };

}();