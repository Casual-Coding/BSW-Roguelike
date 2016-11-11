// BSWR - Railgun component

BSWG.railgunChargeTime = 6.0;

BSWG.component_Railgun = {

    type: 'railgun',
    name: 'Railgun',

    maxHP: 100,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'fireKey', 'fireKeyAlt'
    ],

    sbadd: [
        { title: 'Add', value: 150 }
    ],

    frontOffset: Math.PI/2,

    category: 'weapon',

    getIconPoly: function (args) {
        var size = args.size || 1;
        return [Math.scalePoly([
            new b2Vec2(-0.245, -0.3),
            new b2Vec2(-0.245,  0.0),
            new b2Vec2(-0.05,   1.0),
            new b2Vec2( 0.05,   1.0),
            new b2Vec2( 0.245,  0.0),
            new b2Vec2( 0.245, -0.3)
        ], size*3).reverse()];
    },

    init: function(args) {

        this.maxHP = this.hp = 100;

        var offsetAngle = this.offsetAngle = 0.0;

        var size = this.size = (args.size || 1);
        var verts = Math.scalePoly([
            new b2Vec2(-0.245, -0.3),
            new b2Vec2(-0.245,  0.0),
            new b2Vec2(-0.05,   1.0),
            new b2Vec2( 0.05,   1.0),
            new b2Vec2( 0.245,  0.0),
            new b2Vec2( 0.245, -0.3)
        ], size*3).reverse();

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts: verts
        });

        this.fireKey = args.fireKey || BSWG.KEY.R;
        this.fireKeyAlt = args.fireKeyAlt || this.fireKey;
        this.dispKeys = {
            'fire': [ '', new b2Vec2(0.0, 0.0) ],
        };

        this.jpoints = BSWG.createPolyJPoints(verts, [1, 2, 3], false);

        this.thrustT = 0.0;
        this.kickBack = 0.0;

        BSWG.bpmReflect = 0.5;
        //BSWG.bpmSmoothNormals = true;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.6, new b2Vec2((verts[0].x+verts[3].x)*0.5, -0.25));
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.xpBase = 0.15;
        this.charging = false;
        this.chargeT = 0.0;
        this.railChargeST = 0.0;

    },

    destroy: function() {

        this.meshObj.destroy();
        this.selMeshObj.destroy();

        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }

    },

    render: function(ctx, cam, dt) {

        ctx.fillStyle = '#600';

        if (this.kickBack > 0.0) {
            BSWG.drawBlockPolyOffset = Math.rotVec2(new b2Vec2(0.0, -this.kickBack*0.2), this.obj.body.GetAngle());
            this.kickBack *= 0.9;
        }
        else {
            this.kickBack = 0.0;
        }

        this.meshObj.update([0.05+3.75*this.railChargeST, 0.05, 0.05, 1], 4, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);
        
        BSWG.drawBlockPolyOffset = null;

    },

    update: function(dt) {

        if (!this.sound) {
            this.sound = new BSWG.soundSample();
            this.sound.play('railgun-charge', this.obj.body.GetWorldCenter().THREE(0.2), 0.0, 0.1, true);
        }
        else {
            var v = Math.clamp(this.size*this.railChargeST*4.0, 0, this.size*2);
            var pos = this.obj.body.GetWorldCenter().THREE(0.2);
            if (v>0) {
                BSWG.render.addScreenShake(pos, v*1.0);
            }
            this.sound.volume(v*0.25);
            this.sound.rate(Math.clamp(this.railChargeST/this.size*2.5, 0.1, 20));
            this.sound.position(pos);
            pos = null;
        }

        if (!this.onCC || this.destroyed) {
            this.charging = false;
        }

        if (this.dispKeys) {
            if (this.fireKey !== this.fireKeyAlt) {
                this.dispKeys['fire'][0] = BSWG.KEY_NAMES[this.fireKey].toTitleCase() + ' / ' + BSWG.KEY_NAMES[this.fireKeyAlt].toTitleCase();
            }
            else {
                this.dispKeys['fire'][0] = BSWG.KEY_NAMES[this.fireKey].toTitleCase();
            }
            this.dispKeys['fire'][2] = BSWG.input.KEY_DOWN(this.fireKey) || BSWG.input.KEY_DOWN(this.fireKeyAlt);
        }

        if (this.fireT) {
            this.railChargeST += (0.0 - this.railChargeST) * Math.min(dt*2.0, 1.0);
            this.fireT -= 1.0 * dt * ((this.onCC && this.onCC.fury) ? 1.35 : 1.0) * this.empDamp;
            if (this.fireT <= 0)
                this.fireT = 0.0;
        }
        else {
            var pl = new b2Vec2(0.0, (this.charging ? 0.85 : 0.85) * this.size * 3);
            var a = this.obj.body.GetAngle() - Math.PI/2.0;
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(pl);
            var p = BSWG.physics.localToWorld([pl], this.obj.body);
            p[0].x -= v.x*0.01;
            p[0].y -= v.y*0.01;

            if (this.charging) {
                this.chargeT = Math.clamp(this.chargeT + dt / BSWG.railgunChargeTime, 0, 1);
                this.railChargeST += (this.chargeT - this.railChargeST) * Math.min(dt*8.0, 1.0);
                if (Math._random() < this.chargeT) {
                    BSWG.render.boom.palette = chadaboom3D.fire;
                    BSWG.render.boom.add(
                        p[0].particleWrap(0.2),
                        (1.0+Math._random()*2.0)/2.5,
                        128,
                        1.25,
                        10.0,
                        new THREE.Vector3(Math._random()*3-1.5,Math._random()*3-1.5,Math._random()),
                        null,
                        Math._random() < 0.05
                    );
                }
            }
            else if (this.chargeT > (1/BSWG.railgunChargeTime)) {
                BSWG.blasterList.add(p[0], new b2Vec2(-Math.cos(a)*510.0 * this.chargeT * this.size + v.x, -Math.sin(a)*510.0 * this.chargeT * this.size + v.y), v, this, null, this.size, this.chargeT);

                this.fireT = 1.0;
                this.kickBack = 10.0 * this.chargeT;

                var a = this.obj.body.GetAngle() + Math.PI/2.0;
                var accel = -2000.0 * this.chargeT;
                this.obj.body.SetAwake(true);
                var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
                this.obj.body.ApplyForceToCenter(force);    
                this.thrustT = 0.3;
                force = null;

                this.chargeT = 0.0
                this.charging = false;
            }
            else {
                this.chargeT = Math.clamp(this.chargeT - dt / BSWG.railgunChargeTime, 0, 1);
                this.railChargeST += (0.0 - this.railChargeST) * Math.min(dt*2.0, 1.0);
            }

            p[0] = null;
            p = null;
        }

    },

    openConfigMenu: function() {

        if (BSWG.compActiveConfMenu)
            BSWG.compActiveConfMenu.remove();

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 450, h: 50+32,
            key: this.fireKey,
            altKey: this.fireKeyAlt,
            title: 'Railgun charge/fire',
            close: function (key, alt) {
                if (key) {
                    if (alt) {
                        self.fireKeyAlt = key;
                    }
                    else {
                        if (self.fireKey === self.fireKeyAlt) {
                            self.fireKeyAlt = key;
                        }
                        self.fireKey = key;
                    }
                }
            }
        });

    },

    closeConfigMenu: function() {

    },

    handleInput: function(keys) {

        this.charging = false;
        if ((keys[this.fireKey] || keys[this.fireKeyAlt]) && !this.fireT && this.empDamp > 0.5) {
            this.charging = true;
        }

    },

};