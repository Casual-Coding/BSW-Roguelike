// BSWR - Saw Motor Component

BSWG.component_SawMotor = {

    type: 'sawmotor',
    name: 'Saw Motor',

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'size',
        'rotKey'
    ],

    sbadd: [
        { title: 'Size 1', size: 1 },
        { title: 'Size 2', size: 2 },
        { title: 'Size 3', size: 3 }
    ],

    frontOffset: 0.0,

    init: function(args) {

        this.size   = args.size || 1;
        this.motor  = true;
        this.rotKey = BSWG.KEY.G;

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
            density: 3.0,
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
        this.meshObj1 = BSWG.generateBlockPolyMesh(this.obj, 0.7);
        this.selMeshObj1 = BSWG.genereteBlockPolyOutline(this.obj);
        //BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj1.mesh);
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: this.cverts, body: this.obj.body, comp: this }, 0.7, this.motorC, -0.1, 0.225);
        this.selMeshObj2 = BSWG.genereteBlockPolyOutline({ verts: this.cverts, body: this.obj.body }, this.motorC);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);
        this.meshObj3 = BSWG.generateBlockPolyMesh({ verts: this.averts, body: this.obj.body, comp: this }, 0.7, new b2Vec2(cjp.x*0.5, cjp.y), -0.2, 0.15);
        this.selMeshObj3 = BSWG.genereteBlockPolyOutline({ verts: this.averts, body: this.obj.body });
        BSWG.componentList.makeQueryable(this, this.meshObj3.mesh);

    },

    destroy: function() {

        this.meshObj1.destroy();
        this.selMeshObj1.destroy();
        this.meshObj2.destroy();
        this.selMeshObj2.destroy();
        this.meshObj3.destroy();
        this.selMeshObj3.destroy();

    },

    render: function(ctx, cam, dt) {

        this.selMeshObj1.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
        this.selMeshObj2.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
        this.selMeshObj3.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);

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
            w: 350, h: 50+32,
            key: this.rotKey,
            title: 'Blade spin',
            close: function (key) {
                if (key)
                    self.rotKey = key;
            }
        });

    },

    closeConfigMenu: function() {

    },

    update: function(dt) {

        var robj = null;
        for (var k in this.welds) {
            if (this.welds[k] && this.welds[k].obj.revolute) {
                robj = this.welds[k].obj;
                break;
            }
        }

        if (robj) {
            this.motorSpeed += this.motorAccel * dt;
            robj.vMotorSpeed = this.motorSpeed;
            this.motorSpeed -= (this.motorSpeed * dt);
            this.motorAccel = 0.0;
        }

        this.dispKeys['rotate'][0] = BSWG.KEY_NAMES[this.rotKey].toTitleCase();
        this.dispKeys['rotate'][2] = BSWG.input.KEY_DOWN(this.rotKey);

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
            if (keys[this.rotKey]) {
                this.motorAccel = 33.0;
            }
        }

    },

};