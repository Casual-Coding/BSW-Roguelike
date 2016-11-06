// BSWR - Thruster component

BSWG.component_Thruster = {

    type: 'thruster',
    name: 'Thruster',

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'thrustKey',
        'thrustKeyAlt',
        'size'
    ],
    
    sbkey: [
        'size',
    ],

    sbadd: [
        { title: 'Size 1', size: 1, value: 4 },
        { title: 'Size 2', size: 2, value: 20 },
    ],

    frontOffset: -Math.PI/2,

    category: 'movement',

    getIconPoly: function (args) {
        var size = args.size || 1;
        return [Math.smoothPoly([
            new b2Vec2(-0.2 * size, -0.5 * size),
            new b2Vec2( 0.2 * size, -0.5 * size),
            new b2Vec2( 0.4 * size,  0.5 * size),
            new b2Vec2(-0.4 * size,  0.5 * size)
        ].reverse(), 0.1)];
    },

    init: function(args) {

        var offsetAngle = this.offsetAngle = 0.0;

        this.size = args.size || 1;

        this.maxHP = this.size * this.size * 125 / 4;

        var verts = [
            Math.rotVec2(new b2Vec2(-0.2 * this.size, -0.5 * this.size), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.2 * this.size, -0.5 * this.size), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.4 * this.size,  0.5 * this.size), offsetAngle),
            Math.rotVec2(new b2Vec2(-0.4 * this.size,  0.5 * this.size), offsetAngle)
        ];

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts:  verts,
            smooth: 0.1
        });

        this.dispKeys = {
            'thrust': [ '', new b2Vec2(0.0, 0.0) ],
        };

        this.jpoints = [ new b2Vec2(0.0, 0.5 * this.size) ];

        this.thrustKey = args.thrustKey || BSWG.KEY.W;
        this.thrustKeyAlt = args.thrustKeyAlt || this.thrustKey;
        this.thrustT = 0.0;

        //BSWG.blockPolySmooth = 0.1;

        BSWG.bpmReflect = 0.5;
        BSWG.bpmSmoothNormals = true;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.65, new b2Vec2((verts[2].x + verts[3].x) * 0.5,
                                                                             (verts[2].y + verts[3].y) * 0.5 - 0.25 * this.size), null, 0.3);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        //BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.soundT = 0.0;

        this.xpBase = 0.015 * this.size;

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
        this.selMeshObj.destroy();
        this.meshObj = null;
        this.selMeshObj = null;

    },

    render: function(ctx, cam, dt) {

        var spt = Math.clamp((this.onCC && this.onCC.speed) ? this.onCC.speed : 0, 0, 1);
        this.meshObj.update([0.1*(1-spt)+spt*.5, 0.75*(1-spt)+1*spt, 0.8*(1-spt)+spt*.5, 1], 1/0.75, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

    },

    update: function(dt) {

        if (this.onCC) {
            if (!this.sound) {
                this.sound = new BSWG.soundSample();
                this.israte = Math._random()*0.1+0.5/this.size;
                this.sound.play('thruster', this.obj.body.GetWorldCenter().THREE(0.2), 1.0, this.israte, true);
            }
            if (!this.exaust) {
                this.exaust = new BSWG.exaust(this.obj.body, new b2Vec2(0.0, -0.2 * this.size), 0.5 * this.size, -Math.PI*0.5, 0.125, BSWG.exaustFire);
            }
            var spt = Math.clamp((this.onCC && this.onCC.speed) ? (this.onCC.speed * .5 + 1) : 1, 0, 1.5);
            this.exaust.strength = Math.clamp(this.soundT*7.0, 0, 1) * spt;
        }
        else {
            if (this.sound) {
                this.sound.stop();
                this.sound = null;
            }
            if (this.exaust) {
                this.exaust.remove();
                this.exaust = null;
            }
        }

        if (this.dispKeys) {
            if (this.thrustKey !== this.thrustKeyAlt) {
                this.dispKeys['thrust'][0] = BSWG.KEY_NAMES[this.thrustKey].toTitleCase() + ' / ' + BSWG.KEY_NAMES[this.thrustKeyAlt].toTitleCase();
            }
            else {
                this.dispKeys['thrust'][0] = BSWG.KEY_NAMES[this.thrustKey].toTitleCase();
            }
            this.dispKeys['thrust'][2] = BSWG.input.KEY_DOWN(this.thrustKey) || BSWG.input.KEY_DOWN(this.thrustKeyAlt);
        }


        if (this.thrustT > 0) {

            /*var p = Math.rotVec2(new b2Vec2(0.0, -0.55 * this.size));
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(p);
            var a = this.obj.body.GetAngle() + Math.PI/2.0 + Math._random()*Math.PI/8.0 - Math.PI/16.0;
            v.x -= Math.cos(a) * 6 * this.size;
            v.y -= Math.sin(a) * 6 * this.size;
            p = BSWG.physics.localToWorld(p, this.obj.body);

            BSWG.render.boom.palette = chadaboom3D.fire;
            BSWG.render.boom.add(
                p.particleWrap(0.04),
                1.0*this.thrustT*3.5 * this.size,
                32,
                0.3*this.thrustT*3.0,
                4.0,
                v.THREE(Math._random()*2.0)
            );

            p = v = null;*/

            this.thrustT -= dt;

        }
        else
            this.thrustT = 0.0;

        this.soundT += (this.thrustT - this.soundT) * dt * 4.0;

        if (this.sound) {
            var spt = Math.clamp((this.onCC && this.onCC.speed) ? (this.onCC.speed * .5 + 1) : 1, 0, 1.5);
            this.sound.volume(Math.clamp(this.soundT,0,1) * (this.size/2) * 2.0 * spt);
            this.sound.rate(this.israte * spt)
            this.sound.position(this.obj.body.GetWorldCenter().THREE(0.2));
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
            key: this.thrustKey,
            altKey: this.thrustKeyAlt,
            title: 'Thruster fire',
            close: function (key, alt) {
                if (key) {
                    if (alt) {
                        self.thrustKeyAlt = key;
                    }
                    else {
                        if (self.thrustKey === self.thrustKeyAlt) {
                            self.thrustKeyAlt = key;
                        }
                        self.thrustKey = key;
                    }
                }
            }
        });

    },

    closeConfigMenu: function() {

    },

    handleInput: function(keys) {

        var accel = 0;

        if (keys[this.thrustKey] || keys[this.thrustKeyAlt]) accel += 1;

        accel *= this.empDamp;

        if (accel && this.thrustT < 0.025) { // add shockwave
            for (var i=-10; i<=10; i++) {
                var p = Math.rotVec2(new b2Vec2(0.0, -0.55 * this.size));
                var v = this.obj.body.GetLinearVelocityFromLocalPoint(p);
                var a = this.obj.body.GetAngle() + Math.PI/2.0 + (i/10) * Math.PI/2.7;
                v.x -= Math.cos(a) * 4;
                v.y -= Math.sin(a) * 4;
                p = BSWG.physics.localToWorld(p, this.obj.body);

                BSWG.render.boom.palette = chadaboom3D.fire_bright;
                BSWG.render.boom.add(
                    p.particleWrap(0.025 * this.size),
                    1.35*0.3*5.0 * this.size,
                    32,
                    0.3*0.3*5.0,
                    4.0,
                    v.THREE(Math._random()*2.0),
                    null,
                    false
                );

                if (i === 0) {
                    var sizet = Math.clamp((1.35*0.3*5.0 * this.size)/10, 0, 1) * (Math._random() * 0.1 + 0.95);
                    new BSWG.soundSample().play('explosion', p.particleWrap(0.025 * this.size), Math.pow(sizet, 0.5)*0.35, Math.clamp(0.675/(sizet*0.75+0.25), 0.25, 2.0)*0.65);
                }

                p = v = null;
            }
        }
        
        if (accel)
        {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= 20.0 * [1,3][this.size-1];
            var spt = Math.clamp((this.onCC && this.onCC.speed) ? (this.onCC.speed * .5 + 1) : 1, 0, 1.5);
            accel *= spt;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);
            this.thrustT = 0.3;
            force = null;
        }

    },

};