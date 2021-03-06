// BSWR - Blaster component

BSWG.component_Blaster = {

    type: 'blaster',
    name: 'Blaster',

    maxHP: 20,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'fireKey', 'fireKeyAlt', 'size'
    ],

    sbadd: [
        { title: 'Size 1', size: 1, value: 10 },
        { title: 'Size 2', size: 2, value: 40 }
    ],

    sbkey: [
        'size'
    ],

    frontOffset: Math.PI/2,

    category: 'weapon',

    getIconPoly: function (args) {
        return [Math.scalePolyZC([
            new b2Vec2(-0.245,  -0.3),
            new b2Vec2(-0.1,  0.3),
            new b2Vec2( 0.1,  0.3),
            new b2Vec2( 0.245,  -0.3)
        ].reverse(), args.size||1)];
    },

    init: function(args) {

        this.size = args.size || 1;
        this.energyShot = [0.5, 2.0][this.size-1];

        var offsetAngle = this.offsetAngle = 0.0;

        var verts = Math.scalePolyZC([
            Math.rotVec2(new b2Vec2(-0.245,  -0.3), offsetAngle),
            Math.rotVec2(new b2Vec2(-0.1,  0.3), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.1,  0.3), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.245,  -0.3), offsetAngle)
        ].reverse(), this.size);

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts: verts
        });

        this.fireKey = args.fireKey || BSWG.KEY.SPACE;
        this.fireKeyAlt = args.fireKeyAlt || this.fireKey;
        this.dispKeys = {
            'fire': [ '', new b2Vec2(0.0, 0.0) ],
        };

        this.jpoints = [ new b2Vec2(0.0, -0.3*this.size) ];

        this.thrustT = 0.0;
        this.kickBack = 0.0;

        BSWG.bpmReflect = 0.5;
        //BSWG.bpmSmoothNormals = true;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.6, new b2Vec2((verts[0].x+verts[3].x)*0.5, -0.25*this.size));
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.hp = this.maxHP = 20 * this.size * this.size;
        this.xpBase = 0.01 * this.size * this.size;

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

        if (BSWG.compActiveConfMenu) {
            BSWG.compActiveConfMenu.remove();
        }

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 450, h: 50+32,
            key: this.fireKey,
            altKey: this.fireKeyAlt,
            title: 'Blaster fire',
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

        if ((keys[this.fireKey] || keys[this.fireKeyAlt]) && !this.fireT && this.empDamp > 0.5 && this.onCC && this.onCC.useEnergy(this.energyShot)) {

            var pl = new b2Vec2(0.0, 0.35*this.size);
            var a = this.obj.body.GetAngle() - Math.PI/2.0;
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(pl);
            var p = BSWG.physics.localToWorld([pl], this.obj.body);
            p[0].x -= v.x*0.01;
            p[0].y -= v.y*0.01;

            BSWG.blasterList.add(p[0], new b2Vec2(-Math.cos(a)*51.0*(this.size*0.5+0.5) + v.x, -Math.sin(a)*51.0*(this.size*0.5+0.5) + v.y), v, this, null, null, null, this.size);
            accel = 1;

            this.fireT = 1.15 / 2;
            this.kickBack = 1.0 * this.size;

            p[0] = null;
            p = null;
        }
        
        if (accel)
        {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= -8.0;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);    
            this.thrustT = 0.3;
            force = null;
        }

    },

};