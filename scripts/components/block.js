// BSWR - Block component

BSWG.component_Block = {

    type: 'block',
    name: 'Bulkhead',

    sortOrder: 3,

    hasConfig: false,

    serialize: [
        'width',
        'height',
        'armour',
        'triangle'
    ],

    sbkey: [
        'width',
        'height',
        'armour',
        'triangle'
    ],

    sbadd: [
        { title: 'Box 1x1', width: 1, height: 1, triangle: 0, armour: false, value: 1 },
        { title: 'Box 2x2', width: 2, height: 2, triangle: 0, armour: false, value: 4 },
        { title: 'Box 3x3', width: 3, height: 3, triangle: 0, armour: false, value: 9 },
        { title: 'Box 1x2', width: 1, height: 2, triangle: 0, armour: false, value: 2 },
        { title: 'Box 1x3', width: 1, height: 3, triangle: 0, armour: false, value: 3 },
        { title: 'Box 2x3', width: 2, height: 3, triangle: 0, armour: false, value: 6 },
        { title: 'Tri 1x1', width: 1, height: 1, triangle: 1, armour: false, value: 1 },
        { title: 'Tri 2x2', width: 2, height: 2, triangle: 1, armour: false, value: 2 },
        { title: 'Tri 3x3', width: 3, height: 3, triangle: 1, armour: false, value: 9 },
        { title: 'Tri 1x2', width: 1, height: 2, triangle: 1, armour: false, value: 2 },
        { title: 'Tri 2x1', width: 2, height: 1, triangle: 1, armour: false, value: 2 },
        { title: 'Tri 1x3', width: 1, height: 3, triangle: 1, armour: false, value: 3 },
        { title: 'Tri 3x1', width: 3, height: 1, triangle: 1, armour: false, value: 3 },
        { title: 'Tri 2x3', width: 2, height: 3, triangle: 1, armour: false, value: 6 },
        { title: 'Tri 3x2', width: 3, height: 2, triangle: 1, armour: false, value: 6 }
    ],

    init: function(args) {

        this.width    = args.width || 1;
        this.height   = args.height || 1;
        this.armour   = args.armour || false;
        this.triangle = args.triangle || 0;

        this.maxHP = this.width * this.height * 250 / 9;
        if (this.triangle) {
            this.maxHP /= 2.0;
        }

        this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
            width:    this.width,
            height:   this.height,
            triangle: this.triangle,
            smooth:   0.03
        });

        this.jpoints = BSWG.createBoxJPoints(this.width, this.height, this.triangle);

        //BSWG.blockPolySmooth = 0.03;
        BSWG.bpmReflect = 0.4;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.7);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        //BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.xpBase = 0.01 * this.width * this.height / 9;

    },

    destroy: function() {

        this.meshObj.destroy();
        this.selMeshObj.destroy();

    },

    render: function(ctx, cam, dt) {

        //ctx.fillStyle = '#444';
        //BSWG.drawBlockPoly(ctx, this.obj, 0.7, null, BSWG.componentHoverFn(this));
        this.meshObj.update([0.6,0.6,0.6,1], null, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

    },

    update: function(dt) {

    },

};