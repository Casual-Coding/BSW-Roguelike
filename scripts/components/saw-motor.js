// BSWR - Saw Motor Component

BSWG.component_SawMotor = {

    type: 'sawmotor',
    name: 'Saw Motor',

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'size',
        'rotKey',
        'rotKeyAlt'
    ],

    allKeys: [
        'rotKey',
        'rotKeyAlt'
    ],

    sbadd: [
        { title: 'Size 1', size: 1, value: 5 },
        { title: 'Size 2', size: 2, value: 10 },
        { title: 'Size 3', size: 3, value: 20 }
    ],

    sbkey: [
        'size',
    ],

    attStrength: 2.0,

    frontOffset: 0.0,

    category: 'movement',

    getIconPoly: function (args) {
        var size   = args.size || 1;
        var motor  = true;

        var verts = Math.smoothPoly([
            new b2Vec2(size *  0.5, size * -0.5),
            new b2Vec2(size *  0.65,            -0.2),
            new b2Vec2(size *  0.65,             0.2),
            new b2Vec2(size *  0.5, size *  0.5)
        ], 0.05);

        var motorC = new b2Vec2(size * 1.3, 0.0);

        var len = 6;
        var cverts = new Array(len);
        var r = size * 0.6 * 0.3;
        for (var i=0; i<len; i++) {
            var a = (i/len)*Math.PI*2.0;
            cverts[i] = new b2Vec2(
                motorC.x + Math.cos(a) * r,
                motorC.y + Math.sin(a) * r
            );
        }

        var averts = [
            new b2Vec2(size *  0.5,        size * -0.2),
            new b2Vec2(motorC.x+size*0.05, motorC.y-size*0.1),
            new b2Vec2(motorC.x+size*0.05, motorC.y+size*0.1),
            new b2Vec2(size *  0.5,        size *  0.2)
        ];

        return [verts, cverts, averts];
    },

    init: function(args) {

        this.size   = args.size || 1;
        this.motor  = true;
        this.rotKey = args.rotKey || BSWG.KEY.SPACE;
        this.rotKeyAlt = args.rotKeyAlt || this.rotKey;
        this.energySecond = [1.0, 3.0, 9.0][this.size-1];

        this.maxHP = this.size * 70 / 3;

        this.motorAccel = 0.0;
        this.motorSpeed = 0.0;

        var verts = [
            new b2Vec2(this.size *  0.5, this.size * -0.5),
            new b2Vec2(this.size *  0.65,            -0.2),
            new b2Vec2(this.size *  0.65,             0.2),
            new b2Vec2(this.size *  0.5, this.size *  0.5)
        ];

        this.motorC = new b2Vec2(this.size * 1.3, 0.0);

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts:   verts,
            density: 6.0,
            smooth:  0.05
        });

        this.jpoints = BSWG.createPolyJPoints(verts, [0, 1, 2], true);

        this.dispKeys = {
            'rotate': [ '', new b2Vec2(this.motorC.x, this.motorC.y) ],
        };

        var cjp = new b2Vec2(this.motorC.x, this.motorC.y);
        cjp.motorType = (this.motor ? 1 : 2) * 10 + this.size+2;
        this.jpoints.push(cjp);

        var len = 6;
        this.cverts = new Array(len);
        var r = this.size * 0.6 * 0.3;
        for (var i=0; i<len; i++) {
            var a = (i/len)*Math.PI*2.0;
            this.cverts[i] = new b2Vec2(
                this.motorC.x + Math.cos(a) * r,
                this.motorC.y + Math.sin(a) * r
            );
        }

        this.averts = [
            new b2Vec2(this.size *  0.5, this.size * -0.2),
            new b2Vec2(cjp.x+this.size*0.05,          cjp.y-this.size*0.1),
            new b2Vec2(cjp.x+this.size*0.05,          cjp.y+this.size*0.1),
            new b2Vec2(this.size *  0.5, this.size *  0.2)
        ];
        
        //BSWG.blockPolySmooth = 0.05;
        BSWG.bpmReflect = 0.2;
        this.meshObj1 = BSWG.generateBlockPolyMesh(this.obj, 0.7);
        this.selMeshObj1 = BSWG.genereteBlockPolyOutline(this.obj);
        //BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj1.mesh);
        BSWG.bpmReflect = 0.5;
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: this.cverts, body: this.obj.body, comp: this }, 0.7, this.motorC, -0.1, 0.225);
        this.selMeshObj2 = BSWG.genereteBlockPolyOutline({ verts: this.cverts, body: this.obj.body, comp: this }, this.motorC);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);
        BSWG.bpmReflect = 0.5;
        this.meshObj3 = BSWG.generateBlockPolyMesh({ verts: this.averts, body: this.obj.body, comp: this }, 0.7, new b2Vec2(cjp.x*0.5, cjp.y), -0.2, 0.15);
        this.selMeshObj3 = BSWG.genereteBlockPolyOutline({ verts: this.averts, body: this.obj.body, comp: this });
        BSWG.componentList.makeQueryable(this, this.meshObj3.mesh);

        this.xpBase = 0.025 * this.size;

    },

    destroy: function() {

        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }

        this.meshObj1.destroy();
        this.selMeshObj1.destroy();
        this.meshObj2.destroy();
        this.selMeshObj2.destroy();
        this.meshObj3.destroy();
        this.selMeshObj3.destroy();

    },

    render: function(ctx, cam, dt) {

        this.selMeshObj1.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);
        this.selMeshObj2.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);
        this.selMeshObj3.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

        this.meshObj1.update([0.5, 0.6, 0.5, 1], 2, BSWG.compAnchored(this));
        this.meshObj2.update([0.1, 0.7, 0.8, 1], 4, BSWG.compAnchored(this));
        this.meshObj3.update([0.4, 0.4, 0.4, 1], 3, BSWG.compAnchored(this));

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
            w: 450, h: 50+32,
            key: this.rotKey,
            altKey: this.rotKeyAlt,
            title: 'Blade spin',
            close: function (key, alt) {
                if (key) {
                    if (alt) {
                        self.rotKeyAlt = key;
                    }
                    else {
                        if (self.rotKey === self.rotKeyAlt) {
                            self.rotKeyAlt = key;
                        }
                        self.rotKey = key;
                    }
                }
            }
        });

    },

    closeConfigMenu: function() {

    },

    update: function(dt) {

        if (!this.sound) {
            this.sound = new BSWG.soundSample();
            this.sound.play('saw', this.obj.body.GetWorldCenter().THREE(0.2), 1.0, Math._random()*0.1+0.5/this.size, true);
        }

        var robj = null;
        for (var k in this.welds) {
            if (this.welds[k] && this.welds[k].obj.revolute) {
                robj = this.welds[k].obj;
                break;
            }
        }

        if (this.onCC && robj && robj.objA && robj.objA.comp && robj.objA.comp.onCC && robj.objB && robj.objB.comp && robj.objB.comp.onCC) {
            this.motorSpeed += this.motorAccel * dt;
            robj.vMotorSpeed = this.motorSpeed;
            this.motorSpeed -= (this.motorSpeed * dt);
            this.motorAccel = 0.0;
            this.sound.volume(Math.clamp(this.motorSpeed/100,0,1) * (this.size/2) * 2.0);
            this.sound.rate(Math.clamp(this.motorSpeed/100,0.05,1) / (this.size/2) * 8.0);
            this.sound.position(this.obj.body.GetWorldCenter().THREE(0.2));
        }
        else {
            this.sound.volume(0.0);
            this.motorAccel = 0.0;
            if (robj) {
                this.motorSpeed -= (this.motorSpeed * dt);
                robj.vMotorSpeed = this.motorSpeed;
            }
        }

        if (this.dispKeys) {
            if (this.rotKey !== this.rotKeyAlt) {
                this.dispKeys['rotate'][0] = BSWG.KEY_NAMES[this.rotKey].toTitleCase() + ' / ' + BSWG.KEY_NAMES[this.rotKeyAlt].toTitleCase();
            }
            else {
                this.dispKeys['rotate'][0] = BSWG.KEY_NAMES[this.rotKey].toTitleCase();
            }
            this.dispKeys['rotate'][2] = BSWG.input.KEY_DOWN(this.rotKey) || BSWG.input.KEY_DOWN(this.rotKeyAlt);
        }
    },

    handleInput: function(keys) {

        var robj = null;
        for (var k in this.welds) {
            if (this.welds[k] && this.welds[k].obj.revolute) {
                robj = this.welds[k].obj;
                break;
            }
        }

        if (robj) {
            if (keys[this.rotKey] || keys[this.rotKeyAlt]) {
                if (this.onCC && this.onCC.useEnergy(this.energySecond * BSWG.render.dt)) {
                    this.motorAccel = 65.0 * ((this.onCC && this.onCC.spinUp) ? 2 : 1) * this.empDamp;
                }
            }
        }

    },

};