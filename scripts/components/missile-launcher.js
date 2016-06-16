// BSWR - Missile Launcher component

BSWG.component_MissileLauncher = {

    type: 'missile-launcher',
    name: 'Missile Launcher',

    maxHP: 50,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'fireKey'
    ],

    sbadd: [
        { title: 'Add' }
    ],

    frontOffset: Math.PI/2,

    init: function(args) {

        var offsetAngle = this.offsetAngle = 0.0;

        var verts = [
            Math.rotVec2(new b2Vec2(-0.45,  -0.3), offsetAngle),
            Math.rotVec2(new b2Vec2(-0.4,  0.85), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.4,  0.85), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.45,  -0.3), offsetAngle)
        ].reverse();

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts: verts
        });

        this.fireKey = args.fireKey || BSWG.KEY.SPACE;
        this.dispKeys = {
            'fire': [ '', new b2Vec2(0.0, 0.0) ],
        };

        this.jpoints = [ new b2Vec2(0.0, -0.3) ];

        this.thrustT = 0.0;
        this.kickBack = 0.0;

        BSWG.bpmReflect = 0.4;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.6, new b2Vec2((verts[0].x+verts[3].x)*0.5, 0.6));
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.xpBase = 0.02 * this.size;

    },

    destroy: function() {

        this.meshObj.destroy();
        this.selMeshObj.destroy();

    },

    render: function(ctx, cam, dt) {

        ctx.fillStyle = '#600';

        if (this.kickBack > 0.0) {
            BSWG.drawBlockPolyOffset = Math.rotVec2(new b2Vec2(0.0, -this.kickBack*0.2), this.obj.body.GetAngle());
            this.kickBack *= 0.95;
        }
        else {
            this.kickBack = 0.0;
        }

        this.meshObj.update([1.0, 0.9, 0.6, 1], 4, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
        
        //BSWG.drawBlockPoly(ctx, this.obj, 0.5, null, BSWG.componentHoverFn(this));
        BSWG.drawBlockPolyOffset = null;

    },

    update: function(dt) {

        if (this.dispKeys) {
            this.dispKeys['fire'][0] = BSWG.KEY_NAMES[this.fireKey].toTitleCase();
            this.dispKeys['fire'][2] = BSWG.input.KEY_DOWN(this.fireKey);
        }

        if (this.fireT) {
            this.fireT -= dt;
            if (this.fireT <= 0)
                this.fireT = 0.0;
        }

    },

    openConfigMenu: function() {

        if (BSWG.compActiveConfMenu)
            BSWG.compActiveConfMenu.remove();

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 350, h: 50+32,
            key: this.fireKey,
            title: 'Missile fire',
            close: function (key) {
                if (key)
                    self.fireKey = key;
            }
        });

    },

    closeConfigMenu: function() {

    },

    handleInput: function(keys) {

        var accel = 0;

        if (keys[this.fireKey] && !this.fireT) {

            var pl = new b2Vec2(0.0,  1.5);
            var a = this.obj.body.GetAngle() - Math.PI/2.0;
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(pl);
            var av = this.obj.body.GetAngularVelocity();
            var p = BSWG.physics.localToWorld([pl], this.obj.body);

            new BSWG.component(BSWG.component_Missile, {

                pos: p[0],
                angle: a,
                angVel: av * 0.5,
                vel: new b2Vec2(-Math.cos(a)*1.0 + v.x, -Math.sin(a)*1.0 + v.y)

            });

            var r = 0.5;
            var pl = new b2Vec2(0.0,  1.1);
            var p = BSWG.physics.localToWorld([pl], this.obj.body);

            for (var i=0; i<10; i++) {
                var a = Math.random() * Math.PI * 2.0;
                var r2 = Math.random() * r * 0.5;
                var p2 = new b2Vec2(p[0].x + Math.cos(a) * r2,
                                    p[0].y + Math.sin(a) * r2);
                BSWG.render.boom.palette = chadaboom3D.fire_bright;
                BSWG.render.boom.add(
                    p2.particleWrap(-0.2),
                    r*(3.5 + 2.5*Math.random())*0.7,
                    256,
                    1 + Math.pow(r, 1/3) * Math.random(),
                    2.0,
                    v.THREE(Math.random()*2.0),
                    null,
                    i < 1
                );
            }

            pl = a = v = av = p = null;

            accel = 1;

            this.fireT = 1.5/2;
            this.kickBack = 1.5;
        }
        
        if (accel)
        {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= -38.0 * 3;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);    
            this.thrustT = 0.3;
        }

    },

};