// BSWR - Missile object

BSWG.missileDmg = 7.0;
BSWG.missileSplashRadius = 1.5;

BSWG.component_Missile = {

    type: 'missile',

    sortOrder:       3,
    hasConfig:       false,
    canMoveAttached: false,

    serialize: false,

    maxHP: 3,

    noGrab: true,

    init: function(args) {

        this.size     = args.size || 1;
        this.fireT    = 0.0;
        this.source   = args.source;
        this.ltype    = args.ltype || 0;
        this.specProj = null;

        var verts = this.ltype === 0 ?
            [
                new b2Vec2(this.size * -0.35, this.size * -0.25),
                new b2Vec2(this.size *  0.5,  this.size *  0.0),
                new b2Vec2(this.size *  0.35, this.size *  0.25)
            ]
                :
            [];

        if (this.ltype > 0) {
            for (var i=0; i<10; i++) {
                var a = i/10*Math.PI*2;
                verts.push(
                    new b2Vec2(
                        this.size * Math.cos(a) * 0.45,
                        this.size * Math.sin(a) * 0.45
                    )
                );
            }
        }

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts:  verts,
            smooth: 0.0,
            offsetAngle: -Math.PI/8.0,
            restitution: 0.75
        });

        this.ghost = this.ltype > 0

        verts = null;
        
        if (this.ltype === BSWG.MSL_TYPE.MISSILE) {
            BSWG.bpmReflect = 0.6;
            this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.7);
            BSWG.componentList.makeQueryable(this, this.meshObj.mesh);
            this.fireT = 2.5;
        }
        else {
            this.fireT = 1000.0;
        }


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
        if (this.ltype === BSWG.MSL_TYPE.MISSILE) {
            this.meshObj.destroy();
            this.meshObj = null;
        }

    },

    render: function(ctx, cam, dt) {

        if (this.ltype === BSWG.MSL_TYPE.MISSILE) {
            this.meshObj.update([1.0, 0.9, 0.7, this.obj && this.obj.body && this.obj.body.__lastHit ? 0.0 : 1.0], 6);
        }

    },

    renderOver: function(ctx, cam, dt) {

    },

    update: function(dt) {

        if (!this.specProj && this.ltype > 0 && this.p() && this.fireT > 0) {
        
            var ttype = 'torpedo';
            if (this.ltype === BSWG.MSL_TYPE.TORPEDO) {
                ttype = 'torpedo';
            }
            else if (this.ltype === BSWG.MSL_TYPE.EMP) {
                ttype = 'emp';
            }
            
            this.specProj = new BSWG.specProj(BSWG.specProj_TorpedoOrEMP, {
                type: ttype,
                follow: this,
                source: this.source,
                scale: 0.825
            });

            BSWG.componentList.makeQueryable(this, this.specProj.mesh);
        }

        if (this.specProj && this.specProj.detonated) {
            this.fireT = 0;
        }

        if (!this.sound) {
            this.sound = new BSWG.soundSample();
            this.sound.play('thruster', this.obj.body.GetWorldCenter().THREE(0.2), 1.0, Math._random()*0.1+1.5/this.size, true);
        }

        if (this.ltype === BSWG.MSL_TYPE.MISSILE) {
            if (!this.exaust) {
                this.exaust = new BSWG.exaust(this.obj.body, new b2Vec2(0.15, 0.0), 0.35, 0, 0.05, BSWG.exaustFire);
            }
            this.exaust.strength = Math.clamp(this.fireT*3.0 * (this.obj && this.obj.body && this.obj.body.__lastHit ? 0.0 : 1.0), 0, 1);
        }

        if (this.fireT > 0 && !this.obj.body.__lastHit && !this.nextDestroy && this.empDamp > 0.5) {

            var p = Math.rotVec2(new b2Vec2(this.size * 0.6, 0.0));
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(p);
            var a = this.obj.body.GetAngle() + Math.PI + Math._random()*Math.PI/8.0 - Math.PI/16.0;
            v.x -= Math.cos(a) * 6;
            v.y -= Math.sin(a) * 6;
            p = BSWG.physics.localToWorld(p, this.obj.body);

            var T = Math.clamp(this.fireT, 0.0, 0.3);

            if (T > 0.01) {
                var a = this.obj.body.GetAngle() + Math.PI;
                var accel = 3.75 * [1,2.75,2.75][this.ltype];
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
                    if (this.ltype === BSWG.MSL_TYPE.MISSILE) {
                        if (this.obj.body.__lastHit) {
                            var list = BSWG.componentList.withinRadiusShielded(this.obj.body.GetWorldCenter().clone(), BSWG.missileSplashRadius);
                            for (var i=0; i<list.length; i++) {
                                if (list[i] !== this) {
                                    list[i].takeDamage(BSWG.missileDmg * (1.0 - (list[i].__shieldedPercent || 0.0)), this.source || null);
                                }
                            }
                            list = null;
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
                    else {
                        if (this.specProj) {
                            this.specProj.detonate(v);
                        }
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