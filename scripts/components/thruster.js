// BSWR - Thruster component

BSWG.component_Thruster = {

    type: 'thruster',

    sortOrder: 2,

    hasConfig: true,

    init: function(args) {

        var offsetAngle = this.offsetAngle = 0.0;

        var verts = [
            Math.rotVec2(new b2Vec2(-0.2, -0.5), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.2, -0.5), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.4,  0.5), offsetAngle),
            Math.rotVec2(new b2Vec2(-0.4,  0.5), offsetAngle)
        ];

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts: verts
        });

        this.dispKeys = {
            'thrust': [ '', new b2Vec2(0.0, 0.0) ],
        };

        this.jpoints = [ new b2Vec2(0.0, 0.5) ];

        this.thrustKey = args.thrustKey || BSWG.KEY.UP;
        this.thrustT = 0.0;

        BSWG.blockPolySmooth = 0.1;

        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.65, new b2Vec2((this.obj.verts[2].x + this.obj.verts[3].x) * 0.5,
                                                                             (this.obj.verts[2].y + this.obj.verts[3].y) * 0.5 - 0.25));
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

    },

    render: function(ctx, cam, dt) {

        this.meshObj.update([0.1, 0.75, 0.8, 1], 1/0.75);
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);

    },

    update: function(dt) {

        if (this.dispKeys) {
            this.dispKeys['thrust'][0] = BSWG.KEY_NAMES[this.thrustKey].toTitleCase();
            this.dispKeys['thrust'][2] = BSWG.input.KEY_DOWN(this.thrustKey);
        }

        if (this.thrustT > 0) {

            var p = Math.rotVec2(new b2Vec2(0.0, -0.55));
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(p);
            var a = this.obj.body.GetAngle() + Math.PI/2.0 + Math.random()*Math.PI/8.0 - Math.PI/16.0;
            v.x -= Math.cos(a) * 6;
            v.y -= Math.sin(a) * 6;
            p = BSWG.physics.localToWorld(p, this.obj.body);

            BSWG.render.boom.palette = chadaboom3D.fire;
            BSWG.render.boom.add(
                p.particleWrap(0.025),
                1.0*this.thrustT*5.0,
                32,
                0.3*this.thrustT*5.0,
                4.0,
                v.THREE(Math.random()*2.0)
            );

            this.thrustT -= dt;

        }
        else
            this.thrustT = 0.0;

    },

    openConfigMenu: function() {

        if (BSWG.compActiveConfMenu)
            BSWG.compActiveConfMenu.remove();

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 350, h: 50+32,
            key: this.thrustKey,
            title: 'Thruster fire',
            close: function (key) {
                if (key)
                    self.thrustKey = key;
            }
        });

    },

    closeConfigMenu: function() {

    },

    handleInput: function(keys) {

        var accel = 0;

        if (keys[this.thrustKey]) accel += 1;
        
        if (accel)
        {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= 20.0;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);
            this.thrustT = 0.3;
        }

    },

};