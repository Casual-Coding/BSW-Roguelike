// BSWR - Detaching Thruster component

BSWG.component_DetacherLauncher = {

    type: 'detacherlauncher',
    name: 'Detaching Thruster',

    sortOrder:       1,
    hasConfig:       true,
    canMoveAttached: false,

    serialize: [
        'size',
        'launchKey'
    ],

    sbadd: [
        { title: 'Size 1', size: 1 },
        { title: 'Size 2', size: 2 },
        { title: 'Size 3', size: 3 }
    ],

    frontOffset: Math.PI,

    init: function(args) {

        this.size      = args.size || 2;
        this.launchKey = args.launchKey || BSWG.KEY.F;
        this.dispKeys = {
            'launch': [ '', new b2Vec2(0.0, 0.0) ],
        };
        this.fireT = 0.0;

        this.maxHP = this.size * 100 / 3;

        var verts = [
            new b2Vec2(this.size * -0.35, this.size * -0.25),
            new b2Vec2(this.size *  0.35, this.size * -0.25),
            new b2Vec2(this.size *  0.6, this.size * -0.125),
            new b2Vec2(this.size *  0.6, this.size *  0.125),
            new b2Vec2(this.size *  0.35, this.size *  0.25),
            new b2Vec2(this.size * -0.35, this.size *  0.25)
        ];

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts:  verts,
            smooth: 0.02
        });

        this.jpoints = BSWG.createPolyJPoints(verts, [1, 3], false);
        for (var i=0; i<this.jpoints.length; i++) {
            this.jpoints[i].detacher = i !== 3;
        }

        var arrowVerts = [
            new b2Vec2(this.size * ( 0.25 - 0.2), this.size *  0.125),
            new b2Vec2(this.size * (0.125 - 0.2), this.size *  0.125),
            new b2Vec2(this.size * (  0.0 - 0.2), this.size *  0.0),
            new b2Vec2(this.size * (0.125 - 0.2), this.size * -0.125),
            new b2Vec2(this.size * ( 0.25 - 0.2), this.size * -0.125)
        ];
        
        BSWG.bpmReflect = 0.2;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.7);
        BSWG.bpmReflect = 0.5;
        this.meshObj2 = BSWG.generateBlockPolyMesh({body: this.obj.body, verts: arrowVerts, comp: this}, 0.7, Math.polyCentroid(arrowVerts), 0.3);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.xpBase = 0.015 * this.size;
    },

    destroy: function() {

        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }
        this.meshObj.destroy();
        this.meshObj2.destroy();
        this.selMeshObj.destroy();

    },

    render: function(ctx, cam, dt) {

        this.meshObj.update([0.5, 0.7, 0.7, 1], 2, BSWG.compAnchored(this));
        this.meshObj2.update([1.0, 0.5, 0.2, 1], 3, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

    },

    renderOver: function(ctx, cam, dt) {

    },

    openConfigMenu: function() {

        if (BSWG.compActiveConfMenu)
            BSWG.compActiveConfMenu.remove();

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 350, h: 50+32,
            key: this.launchKey,
            title: 'Launch',
            close: function (key) {
                if (key)
                    self.launchKey = key;
            }
        });

    },

    closeConfigMenu: function() {

    },

    update: function(dt) {

        if (!this.sound) {
            this.sound = new BSWG.soundSample();
            this.sound.play('thruster', this.obj.body.GetWorldCenter().THREE(0.2), 1.0, Math._random()*0.1+1.0/(this.size*0.5+0.5), true);
        }

        if (this.dispKeys) {
            this.dispKeys['launch'][0] = BSWG.KEY_NAMES[this.launchKey].toTitleCase();
            this.dispKeys['launch'][2] = BSWG.input.KEY_DOWN(this.launchKey);
        }
        if (this.fireT > 0) {

            var p = Math.rotVec2(new b2Vec2(this.size * 0.4, 0.0));
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(p);
            var a = this.obj.body.GetAngle() + Math.PI + Math._random()*Math.PI/8.0 - Math.PI/16.0;
            v.x -= Math.cos(a) * 6;
            v.y -= Math.sin(a) * 6;
            p = BSWG.physics.localToWorld(p, this.obj.body);

            var T = Math.clamp(this.fireT - 6, 0.0, 0.3);

            if (T > 0.01) {
                BSWG.render.boom.palette = chadaboom3D.blue_bright;
                BSWG.render.boom.add(
                    p.particleWrap(0.025),
                    1.0*T*5.0*this.size,
                    32,
                    0.3*T*5.0,
                    4.0,
                    v.THREE(Math._random()*2.0),
                    null,
                    false
                );
                var a = this.obj.body.GetAngle() + Math.PI;
                var accel = 20.0 * [1,3,7][this.size-1];
                this.obj.body.SetAwake(true);
                var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
                this.obj.body.ApplyForceToCenter(force);
            }

            this.fireT -= dt;

        }
        else
            this.fireT = 0.0;

        this.sound.volume(Math.clamp(this.fireT-6,0,1) * (this.size/2) * 3.25);
        this.sound.position(this.obj.body.GetWorldCenter().THREE(0.2));
    },

    handleInput: function(keys) {

        if (keys[this.launchKey] && !this.fireT) {

            for (var k=0; k<this.jpoints.length; k++) {
                if (this.welds[k] && k !== 3) {
                    this.welds[k].obj.broken = true;
                }
            }

            this.fireT = 8.0;
            for (var i=-10; i<=10; i++) {
                var p = Math.rotVec2(new b2Vec2(0.4*this.size, 0.0));
                var v = this.obj.body.GetLinearVelocityFromLocalPoint(p);
                var a = this.obj.body.GetAngle() + Math.PI + (i/10) * Math.PI/2.7;
                v.x -= Math.cos(a) * 4;
                v.y -= Math.sin(a) * 4;
                p = BSWG.physics.localToWorld(p, this.obj.body);

                BSWG.render.boom.palette = chadaboom3D.blue_bright;
                BSWG.render.boom.add(
                    p.particleWrap(0.025),
                    1.35*0.3*5.0*this.size,
                    32,
                    0.3*0.3*5.0,
                    4.0,
                    v.THREE(Math._random()*2.0),
                    null,
                    false
                );

                if (i === 0) {
                    var sizet = Math.clamp((1.35*0.3*5.0 * this.size)/10, 0, 1) * (Math._random() * 0.1 + 0.95);
                    new BSWG.soundSample().play('explosion', p.particleWrap(0.025 * this.size), Math.pow(sizet, 0.5)*0.65, Math.clamp(0.675/(sizet*0.75+0.25), 0.25, 2.0)*0.65);
                }
            }
        }
    }

};