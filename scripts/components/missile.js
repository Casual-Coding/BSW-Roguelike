// BSWR - Missile object

BSWG.missileDmg = 7;

BSWG.component_Missile = {

    type: 'missile',

    sortOrder:       3,
    hasConfig:       false,
    canMoveAttached: false,

    serialize: false,

    maxHP: 3,

    init: function(args) {

        this.size      = args.size || 1;
        this.fireT = 0.0;

        var verts = [
            new b2Vec2(this.size * -0.35, this.size * -0.25),
            new b2Vec2(this.size *  0.5,  this.size *  0.0),
            new b2Vec2(this.size *  0.35, this.size *  0.25)
        ];

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts:  verts,
            smooth: 0.0,
            offsetAngle: -Math.PI/8.0,
            restitution: 0.75
        });

        verts = null;
        
        BSWG.bpmReflect = 0.6;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.7);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.fireT = 2.5;
        this.nextDestroy = false;
    },

    destroy: function() {

        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }
        if (this.exaust) {
            this.exaust.remove();
            this.exaust = null;
        }
        this.meshObj.destroy();
        this.meshObj = null;

    },

    render: function(ctx, cam, dt) {

        this.meshObj.update([1.0, 0.9, 0.7, 1], 6);

    },

    renderOver: function(ctx, cam, dt) {

    },

    update: function(dt) {

        if (!this.sound) {
            this.sound = new BSWG.soundSample();
            this.sound.play('thruster', this.obj.body.GetWorldCenter().THREE(0.2), 1.0, Math._random()*0.1+1.5/this.size, true);
        }

        if (!this.exaust) {
            this.exaust = new BSWG.exaust(this.obj.body, new b2Vec2(0.15, 0.0), 0.35, 0, 0.05, BSWG.exaustFire);
        }
        this.exaust.strength = Math.clamp(this.fireT*3.0, 0, 1);

        if (this.fireT > 0 && (this.obj.body.__lastForce||0.0) < 0.01 && !this.nextDestroy) {

            var p = Math.rotVec2(new b2Vec2(this.size * 0.6, 0.0));
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(p);
            var a = this.obj.body.GetAngle() + Math.PI + Math._random()*Math.PI/8.0 - Math.PI/16.0;
            v.x -= Math.cos(a) * 6;
            v.y -= Math.sin(a) * 6;
            p = BSWG.physics.localToWorld(p, this.obj.body);

            var T = Math.clamp(this.fireT, 0.0, 0.3);

            if (T > 0.01) {
                /*BSWG.render.boom.palette = chadaboom3D.fire_bright;
                BSWG.render.boom.add(
                    p.particleWrap(0.025),
                    1.0*T*4.0*this.size,
                    32,
                    0.7*T*1.25,
                    4.0,
                    v.THREE(Math._random()*2.0)
                );*/
                var a = this.obj.body.GetAngle() + Math.PI;
                var accel = 3.75 * [1,3,7][this.size-1];
                this.obj.body.SetAwake(true);
                var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
                this.obj.body.ApplyForceToCenter(force);
            }

            this.fireT -= dt;

        }
        else {

            if (!this.nextDestroy) {
                this.nextDestroy = true;
            }
            else {
                if (this.fireT > 0.0) {
                    var v = (this.obj.body.__lastHit ? this.obj.body.__lastHit.GetLinearVelocity() : new b2Vec2(0,0)).clone();
                    if (this.obj.body.__lastHit) {
                        if (this.obj.body.__lastHit.__comp) {
                            this.obj.body.__lastHit.__comp.takeDamage(BSWG.missileDmg);
                        }
                    }
                    BSWG.render.boom.palette = chadaboom3D.fire_bright;
                    BSWG.render.boom.add(
                        this.obj.body.GetWorldCenter().particleWrap(0.05),
                        1.0*4.0*this.size*1.5,
                        128,
                        1.0,
                        1.5,
                        v.THREE(Math._random()*2.0)
                    );
                    for (var i=0; i<16; i++) {
                        var a = Math._random()*Math.PI*2.0;
                        var r = Math._random()*3.0+0.5;
                        BSWG.render.boom.palette = chadaboom3D.fire_bright;
                        BSWG.render.boom.add(
                            this.obj.body.GetWorldCenter().particleWrap(0.05),
                            1.0*4.0*this.size*(0.25+Math._random()*0.15),
                            32,
                            1.0,
                            4.0,
                            new b2Vec2(v.x+Math.cos(a)*r, v.y+Math.sin(a)*r).THREE(Math._random()*2.0)
                        );
                    }
                }

                this.fireT = 0.0;
                this.removeSafe();
            }
        }

        this.sound.volume(Math.clamp(this.fireT,0,1) * (this.size/2) * 0.75);
        this.sound.position(this.obj.body.GetWorldCenter().THREE(0.2));
    }

};