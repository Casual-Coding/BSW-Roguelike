// BSWR - Block component

BSWG.component_PowerCore = {

    type: 'powercore',
    name: 'Power Core',

    sortOrder: 3,

    hasConfig: false,

    serialize: [
        'size',
        'armour'
    ],

    sbkey: [
        'size',
        'armour'
    ],

    sbadd: [
        { title: 'Size 1', size: 1, armour: false, value: 3*1*2 },
        { title: 'Size 2', size: 2, armour: false, value: 3*4*2 },
        { title: 'Size 3', size: 3, armour: false, value: 3*9*2 },
        { title: 'Size 1 Armoured', size: 1, armour: true, value: 3*1*8 },
        { title: 'Size 2 Armoured', size: 2, armour: true, value: 3*4*8 },
        { title: 'Size 3 Armoured', size: 3, armour: true, value: 3*9*8 }
    ],

    category: 'block',

    getIconPoly: function (args) {
        var width    = args.size || 1;
        var height   = args.size || 1;
        var armour   = args.armour || false;

        var verts = [
            new b2Vec2(-width * 0.5, -height * 0.5),
            new b2Vec2( width * 0.5, -height * 0.5),
            new b2Vec2( width * 0.5,  height * 0.5),
            new b2Vec2(-width * 0.5,  height * 0.5)
        ];

        var th = 1.5; // 2.0;
        var plusVerts = Math.scalePolyZC([
            new b2Vec2(-.3, .15/th),
            new b2Vec2(-.3, -.15/th),
            new b2Vec2(-.15/th, -.15/th),
            new b2Vec2(-.15/th, -.3),
            new b2Vec2(.15/th, -.3),
            new b2Vec2(.15/th, -.15/th),
            new b2Vec2(.3, -.15/th),
            new b2Vec2(.3, .15/th),
            new b2Vec2(.15/th, .15/th),
            new b2Vec2(.15/th, .3),
            new b2Vec2(-.15/th, .3),
            new b2Vec2(-.15/th, .15/th)
        ], args.size || 1);

        return [Math.smoothPoly(verts, armour ? 0.08 : 0.03), plusVerts];
    },

    init: function(args) {

        this.size   = args.size || 1;
        this.armour = args.armour || false;

        this.energyGain = this.energyGainBase = [4, 16, 48][this.size-1];

        this.maxHP = 2 * this.size * this.size * 250 / 9 * (this.armour ? 4 : 1);
        this.chainDestroyHP = (this.maxHP * 0.5) / (this.armour ? 4 : 1);

        if (this.triangle) {
            this.maxHP /= 2.0;
        }

        this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
            width:    this.size,
            height:   this.size,
            triangle: false,
            smooth:   this.armour ? 0.08 : 0.03
        });

        this.jpoints = BSWG.createBoxJPoints(this.size, this.size, 0);

        var th = 1.5; // 2.0;
        var plusVerts = Math.scalePolyZC([
            new b2Vec2(-.3, .15/th),
            new b2Vec2(-.3, -.15/th),
            new b2Vec2(-.15/th, -.15/th),
            new b2Vec2(-.15/th, -.3),
            new b2Vec2(.15/th, -.3),
            new b2Vec2(.15/th, -.15/th),
            new b2Vec2(.3, -.15/th),
            new b2Vec2(.3, .15/th),
            new b2Vec2(.15/th, .15/th),
            new b2Vec2(.15/th, .3),
            new b2Vec2(-.15/th, .3),
            new b2Vec2(-.15/th, .15/th)
        ], this.size);

        //BSWG.blockPolySmooth = 0.03;
        BSWG.bpmReflect = this.armour ? 0.9 : 0.7;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.7, null, null, null);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        //BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        BSWG.blockPolySmooth = 0.1;

        BSWG.bpmReflect = 0.4;
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: plusVerts, body: this.obj.body, comp: this }, 0.8, new b2Vec2(0, 0), (0.7/3)*this.size);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);

        this.xpBase = 0.03 * this.size * this.size / 9 * (this.armour ? 4 : 1);
        this.animT = 0.0;

    },

    destroy: function() {

        this.meshObj.destroy();
        this.meshObj2.destroy();
        this.selMeshObj.destroy();

    },

    render: function(ctx, cam, dt) {

        if (this.onCC) {
            this.animT += 4.0 * dt * this.empDamp;
        }
        else {
            this.animT += 1.0 * dt * this.empDamp;
        }

        //ctx.fillStyle = '#444';
        //BSWG.drawBlockPoly(ctx, this.obj, 0.7, null, BSWG.componentHoverFn(this));
        if (this.armour) {
            this.meshObj.update([0.5,0.5,0.5,1], 4, BSWG.compAnchored(this));
        }
        else {
            this.meshObj.update([0.3,0.3,0.3,1], null, BSWG.compAnchored(this));
        }
        var t = Math.sin(this.animT * Math.PI) * 0.5 + 0.5;
        this.meshObj2.update([t, t, 1.0, 1], 48.0, BSWG.compAnchored(this), this.animT*Math.PI*0.25, new b2Vec2(0, 0));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

    },

    update: function(dt) {

        this.energyGain = this.energyGainBase * this.empDamp;

    },

};