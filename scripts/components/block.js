// BSWR - Block component

BSWG.component_Block = {

    type: 'block',

    sortOrder: 3,

    hasConfig: false,

    serialize: [
        'width',
        'height',
        'armour',
        'triangle'
    ],

    init: function(args) {

        this.width    = args.width || 1;
        this.height   = args.height || 1;
        this.armour   = args.armour || false;
        this.triangle = args.triangle || 0;

        this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
            width:    this.width,
            height:   this.height,
            triangle: this.triangle,
            smooth:   0.03
        });

        this.jpoints = BSWG.createBoxJPoints(this.width, this.height, this.triangle);

        //BSWG.blockPolySmooth = 0.03;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.7);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        //BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

    },

    destroy: function() {

        this.meshObj.destroy();
        this.selMeshObj.destroy();

    },

    render: function(ctx, cam, dt) {

        //ctx.fillStyle = '#444';
        //BSWG.drawBlockPoly(ctx, this.obj, 0.7, null, BSWG.componentHoverFn(this));
        this.meshObj.update([0.6,0.6,0.6,1], null, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);

    },

    update: function(dt) {

    },

};