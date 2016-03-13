// BSWR - Blaster component

BSWG.component_Blaster = {

    type: 'blaster',

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'fireKey'
    ],

    init: function(args) {

        var offsetAngle = this.offsetAngle = 0.0;

        var verts = [
            Math.rotVec2(new b2Vec2(-0.225,  -0.3), offsetAngle),
            Math.rotVec2(new b2Vec2(-0.1,  1.0), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.1,  1.0), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.225,  -0.3), offsetAngle)
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

        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.6, new b2Vec2((verts[0].x+verts[3].x)*0.5, -0.25));
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

    },

    destroy: function() {

        this.meshObj.destroy();
        this.selMeshObj.destroy();

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

        this.meshObj.update([1.0, 0.6, 0.05, 1], 4, BSWG.compAnchored(this));
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
            title: 'Blaster fire',
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

            var pl = new b2Vec2(0.0,  1.05);
            var a = this.obj.body.GetAngle() - Math.PI/2.0;
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(pl);
            var p = BSWG.physics.localToWorld([pl], this.obj.body);
            p[0].x -= v.x*0.01;
            p[0].y -= v.y*0.01;

            BSWG.blasterList.add(p[0], new b2Vec2(-Math.cos(a)*15.0 + v.x, -Math.sin(a)*15.0 + v.y), v, this);
            accel = 1;

            this.fireT = 0.5;
            this.kickBack = 1.0;
        }
        
        if (accel)
        {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= -8.0;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);    
            this.thrustT = 0.3;
        }

    },

};