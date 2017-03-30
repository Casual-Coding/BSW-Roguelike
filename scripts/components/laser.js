// BSWR - Laser component

BSWG.component_Laser = {

    type: 'laser',
    name: 'Laser',

    maxHP: 40,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'fireKey',
        'fireKeyAlt'
    ],

    allKeys: [
        'fireKey',
        'fireKeyAlt'
    ],

    sbadd: [
        { title: 'Add', value: 50 }
    ],

    frontOffset: Math.PI/2,

    category: 'weapon',

    getIconPoly: function (args) {
        return [Math.smoothPoly([
            new b2Vec2(-0.4,  -0.3),
            new b2Vec2(-0.5,  -0.1),
            new b2Vec2(-0.15,  0.85),
            new b2Vec2( 0.15,  0.85),
            new b2Vec2( 0.5,  -0.1),
            new b2Vec2( 0.4,  -0.3)
        ].reverse(), 0.02)];
    },

    init: function(args) {

        this.energySecond = 7.5;

        this.pwepRating = 8;

        var offsetAngle = this.offsetAngle = 0.0;

        var verts = [
            Math.rotVec2(new b2Vec2(-0.4,  -0.3), offsetAngle),
            Math.rotVec2(new b2Vec2(-0.5,  -0.1), offsetAngle),
            Math.rotVec2(new b2Vec2(-0.15,  0.85), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.15,  0.85), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.5,  -0.1), offsetAngle),
            Math.rotVec2(new b2Vec2( 0.4,  -0.3), offsetAngle)
        ].reverse();

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts: verts,
            smooth: 0.02
        });

        this.fireKey = args.fireKey || BSWG.KEY.SPACE;
        this.fireKeyAlt = args.fireKeyAlt || this.fireKey;
        this.dispKeys = {
            'fire': [ '', new b2Vec2(0.0, 0.0) ],
        };

        this.jpoints = [ new b2Vec2(0.0, -0.3) ];

        this.thrustT = 0.0;
        this.kickBack = 0.0;

        BSWG.bpmReflect = 0.6;
        //BSWG.bpmSmoothNormals = true;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.6, new b2Vec2((verts[1].x+verts[5].x)*0.5, 0.2));
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.xpBase = 0.03 * this.size;

    },

    destroy: function() {

        this.meshObj.destroy();
        this.selMeshObj.destroy();
        if (this.laser) {
            BSWG.laserList.remove(this.laser);
            this.laser = null;
        }

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

        this.meshObj.update([1.0, 0.6, 0.35, 1], 4, BSWG.compAnchored(this));
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

        if (this.laser && !this.onCC) {
            BSWG.laserList.remove(this.laser);
            this.laser = null;
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
            title: 'Laser fire',
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

        if ((keys[this.fireKey] || keys[this.fireKeyAlt]) && this.empDamp > 0.5 && this.onCC && this.onCC.useEnergy(this.energySecond * BSWG.render.dt)) {

            accel = 1;

            this.fireT = 1.5;
            this.kickBack = Math.clamp(this.kickBack + BSWG.render.dt * 2.0, 0.0, 1.5);

            if (this.laser) {
                this.laser.set(this.obj.body.GetWorldCenter(), this.obj.body.GetAngle());
            }
            else {
                this.laser = BSWG.laserList.add(this.obj.body.GetWorldCenter(), this.obj.body.GetAngle(), this);
            }
        }
        else if (this.laser) {
            BSWG.laserList.remove(this.laser);
            this.laser = null;
        }
        
        if (accel)
        {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= -2.0;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);    
            this.thrustT = 0.3;
        }

    },

};