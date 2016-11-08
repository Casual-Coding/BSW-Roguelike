// BSWR - Missile Launcher component

BSWG.MSL_TYPE = {
    MISSILE: 0,
    TORPEDO: 1,
    EMP:     2
};
BSWG.MSL_SCALE = {
    0: 1.0, // Missile
    1: 2.0, // Torpedo
    2: 2.0  // EMP
};
BSWG.MSL_COOLDOWN = {
    0: 1.5/2, // Missile
    1: 6,     // Torpedo
    2: 8,     // EMP
}

BSWG.component_MissileLauncher = {

    type: 'missile-launcher',
    name: 'Launchers',

    maxHP: 50,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'fireKey',
        'fireKeyAlt',
        'ltype'
    ],

    sbkey: [
        'ltype'
    ],

    sbadd: [
        { title: 'Missile', ltype: BSWG.MSL_TYPE.MISSILE, value: 25 },
        { title: 'Torpedo', ltype: BSWG.MSL_TYPE.TORPEDO, value: 75 },
        { title: 'EMP',     ltype: BSWG.MSL_TYPE.EMP,     value: 75 }
    ],

    frontOffset: Math.PI/2,

    category: 'weapon',

    getIconPoly: function (args) {
        var scale = BSWG.MSL_SCALE[args.ltype||0];
        if (args.type === BSWG.MSL_TYPE.EMP) {
            return [[
                new b2Vec2(-0.45 * scale, -0.3  * scale),
                new b2Vec2(-0.35 * scale,  0.85 * scale),
                new b2Vec2( 0.35 * scale,  0.85 * scale),
                new b2Vec2( 0.45 * scale, -0.3  * scale)
            ].reverse()];
        }
        else {
            return [[
                new b2Vec2(-0.45 * scale,  -0.3 * scale),
                new b2Vec2(-0.4  * scale,  0.85 * scale),
                new b2Vec2( 0.4  * scale,  0.85 * scale),
                new b2Vec2( 0.45 * scale,  -0.3 * scale)
            ].reverse()];
        }
    },

    init: function(args) {

        this.ltype = args.ltype || 0;

        if (this.ltype > 0) {
            this.maxHP *= 4;
        }

        var offsetAngle = this.offsetAngle = 0.0;

        var scale = BSWG.MSL_SCALE[this.ltype];
        var verts = this.ltype === BSWG.MSL_TYPE.EMP ?
            [
                Math.rotVec2(new b2Vec2(-0.45 * scale,  -0.3 * scale), offsetAngle),
                Math.rotVec2(new b2Vec2(-0.35 * scale,  0.85 * scale), offsetAngle),
                Math.rotVec2(new b2Vec2( 0.35 * scale,  0.85 * scale), offsetAngle),
                Math.rotVec2(new b2Vec2( 0.45 * scale,  -0.3 * scale), offsetAngle)
            ].reverse()
                :
            [
                Math.rotVec2(new b2Vec2(-0.45 * scale,  -0.3 * scale), offsetAngle),
                Math.rotVec2(new b2Vec2(-0.4  * scale,  0.85 * scale), offsetAngle),
                Math.rotVec2(new b2Vec2( 0.4  * scale,  0.85 * scale), offsetAngle),
                Math.rotVec2(new b2Vec2( 0.45 * scale,  -0.3 * scale), offsetAngle)
            ].reverse();

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts: verts
        });

        var defKey = BSWG.KEY.SPACE;
        if (this.ltype === BSWG.MSL_TYPE.TORPEDO) {
            defKey = BSWG.KEY.T;
        }
        else if (this.ltype === BSWG.MSL_TYPE.EMP) {
            defKey = BSWG.KEY.E;
        }

        this.fireKey = args.fireKey || defKey;
        this.fireKeyAlt = args.fireKeyAlt || this.fireKey;
        this.dispKeys = {
            'fire': [ '', new b2Vec2(0.0, 0.0) ],
        };

        this.jpoints = [ new b2Vec2(0.0, -0.3 * scale) ];

        this.thrustT = 0.0;
        this.kickBack = 0.0;

        BSWG.bpmReflect = 0.4;
        //BSWG.bpmSmoothNormals = true;
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

        if (this.ltype === BSWG.MSL_TYPE.MISSILE) {
            this.meshObj.update([1.0, 0.9, 0.6, 1], 4, BSWG.compAnchored(this));
        }
        else if (this.ltype === BSWG.MSL_TYPE.TORPEDO) {
            this.meshObj.update([1.0, 0.5 * Math.clamp(1-this.fireT,0,1), 0.0, 1], 4, BSWG.compAnchored(this));   
        }
        else if (this.ltype === BSWG.MSL_TYPE.EMP) {
            this.meshObj.update([0.0, 0.5 * Math.clamp(1-this.fireT,0,1), 1.0, 1], 4, BSWG.compAnchored(this));   
        }
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);
        
        //BSWG.drawBlockPoly(ctx, this.obj, 0.5, null, BSWG.componentHoverFn(this));
        BSWG.drawBlockPolyOffset = null;

    },

    update: function(dt) {

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
            this.fireT -= dt * ((this.onCC && this.onCC.fury) ? 1.35 : 1.0) * this.empDamp;
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
            w: 450, h: 50+32,
            key: this.fireKey,
            altKey: this.fireKeyAlt,
            title: 'Launch',
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

        var accel = 0;

        if ((keys[this.fireKey] || keys[this.fireKeyAlt]) && !this.fireT && this.empDamp > 0.5) {

            var pl = new b2Vec2(0.0, this.ltype === BSWG.MSL_TYPE.MISSILE ? 1.5 : 2.25);
            var a = this.obj.body.GetAngle() - Math.PI/2.0;
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(pl);
            var av = this.obj.body.GetAngularVelocity();
            var p = BSWG.physics.localToWorld([pl], this.obj.body);

            new BSWG.component(BSWG.component_Missile, {

                pos: p[0],
                angle: a,
                angVel: av * 0.5,
                vel: new b2Vec2(-Math.cos(a)*1.0 + v.x, -Math.sin(a)*1.0 + v.y),
                source: this,
                ltype: this.ltype

            });

            var r = 0.5;
            var pl = new b2Vec2(0.0,  1.1);
            var p = BSWG.physics.localToWorld([pl], this.obj.body);

            for (var i=0; i<10; i++) {
                var a = Math._random() * Math.PI * 2.0;
                var r2 = Math._random() * r * 0.5;
                var p2 = new b2Vec2(p[0].x + Math.cos(a) * r2,
                                    p[0].y + Math.sin(a) * r2);
                BSWG.render.boom.palette = chadaboom3D.fire_bright;
                BSWG.render.boom.add(
                    p2.particleWrap(-0.2),
                    r*(3.5 + 2.5*Math._random())*0.7,
                    256,
                    1 + Math.pow(r, 1/3) * Math._random(),
                    2.0,
                    v.THREE(Math._random()*2.0),
                    null,
                    i < 1
                );
            }

            pl = a = v = av = p = null;

            accel = 1 * (this.ltype > 0 ? 4 : 1);

            this.fireT = BSWG.MSL_COOLDOWN[this.ltype];
            this.kickBack = 1.5 * (this.ltype > 0 ? 4 : 1);
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