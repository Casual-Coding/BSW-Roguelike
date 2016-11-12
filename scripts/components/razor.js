// BSWR - Block component

BSWG.component_Razor = {

    type: 'razor',
    name: 'Blade Armour',

    sortOrder: 3,

    hasConfig: false,

    serialize: [
        'size'
    ],

    sbkey: [
        'size'
    ],

    sbadd: [
        { title: 'Size 1', size: 1, value: 1*2*8 },
        { title: 'Size 2', size: 2, value: 4*2*8 },
        { title: 'Size 3', size: 3, value: 9*2*8 }
    ],

    isMele: true,

    attStrength: 3.0,

    category: 'weapon',

    getIconPoly: function (args) {
        var size = args.size || 1;

        var verts1 = [
            new b2Vec2(-size * 0.5, -0.25),
            new b2Vec2( size * 0.5, -0.25),
            new b2Vec2( size * 0.5,  0.10),
            new b2Vec2(-size * 0.5,  0.10)
        ];
        var verts2 = [
            new b2Vec2(-size * 0.5,  0.10),
            new b2Vec2( size * 0.5,  0.10),
            new b2Vec2( size * 0.5,  0.25),
            new b2Vec2(-size * 0.5,  0.25)
        ];

        return [verts2, verts1];
    },

    init: function(args) {

        var size = this.size = args.size || 1;

        this.maxHP = 60 * this.size;

        var verts1 = [
            new b2Vec2(-size * 0.5, -0.25),
            new b2Vec2( size * 0.5, -0.25),
            new b2Vec2( size * 0.5,  0.10),
            new b2Vec2(-size * 0.5,  0.10)
        ];
        var verts2 = [
            new b2Vec2(-size * 0.5,  0.10),
            new b2Vec2( size * 0.5,  0.10),
            new b2Vec2( size * 0.5,  0.25),
            new b2Vec2(-size * 0.5,  0.25)
        ];

        this.obj = BSWG.physics.createObject('multipoly', args.pos, args.angle || 0, {
            verts:        [verts1, verts2],
            frictionList: [0.75, 0.05],
            density:      0.5,
            isMele:       true
        });

        this.jpoints = BSWG.createPolyJPoints(verts2, [0,1,3], false);

        var center = new b2Vec2(0, 0);

        BSWG.bpmReflect = this.armour ? 0.8 : 0.4;
        var tmpObj1 = {
            body: this.obj.body,
            verts: verts1,
            comp: this
        };
        var tmpObj2 = {
            body: this.obj.body,
            verts: verts2,
            comp: this
        };
        BSWG.bpmReflect = 0.8;
        BSWG.bpmSmoothNormals = true;
        this.meshObj1 = BSWG.generateBlockPolyMesh(tmpObj1, 0.2, center, null, 0.025);
        BSWG.bpmReflect = 0.4;
        BSWG.bpmSmoothNormals = false;
        this.meshObj2 = BSWG.generateBlockPolyMesh(tmpObj2, 0.7, center, null, 0.075);
        BSWG.componentList.makeQueryable(this, this.meshObj1.mesh);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);

        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);

        this.xpBase = 0.16 * this.size;

    },

    destroy: function() {

        this.meshObj1.destroy();
        this.meshObj2.destroy();
        this.selMeshObj.destroy();

    },

    render: function(ctx, cam, dt) {

        this.meshObj1.update([0.4, 0.4, 0.4, 1], 1000.0, BSWG.compAnchored(this));
        this.meshObj2.update([0.6, 0.6, 0.6, 1], null, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

    },

    update: function(dt) {

    },

};