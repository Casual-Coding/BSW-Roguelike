// BSWR - Chain Link component

BSWG.component_ChainLink = {

    type: 'chainlink',

    sortOrder:       1,
    hasConfig:       false,
    canMoveAttached: true,

    init: function(args) {

        this.size   = 1;

        var verts = [
            new b2Vec2(this.size * -0.25, this.size * -0.25),
            new b2Vec2(this.size *  0.25, this.size * -0.25),
            new b2Vec2(this.size *  0.55,             0.0),
            new b2Vec2(this.size *  0.25, this.size *  0.25),
            new b2Vec2(this.size * -0.25, this.size *  0.25)
        ];

        this.motorC = new b2Vec2(this.size * 0.6, 0.0);

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts:  verts,
            smooth: 0.05
        });

        this.jpoints = BSWG.createPolyJPoints(verts, [0, 1, 2, 3], false);

        var cjp = new b2Vec2(this.motorC.x, this.motorC.y);
        cjp.motorType = 6 * 10 + this.size;
        this.jpoints.push(cjp)

        var len = Math.floor(this.size * 5);
        this.cverts = new Array(len);
        var r = this.size * (this.motor ? 0.6 : 0.45) * 0.45;
        for (var i=0; i<len; i++) {
            var a = (i/len)*Math.PI*2.0;
            this.cverts[i] = new b2Vec2(
                this.motorC.x + Math.cos(a) * r,
                this.motorC.y + Math.sin(a) * r
            );
        }
        
        //BSWG.blockPolySmooth = 0.05;
        this.meshObj1 = BSWG.generateBlockPolyMesh(this.obj, 0.7);
        this.selMeshObj1 = BSWG.genereteBlockPolyOutline(this.obj);
        //BSWG.blockPolySmooth = null;
        BSWG.componentList.makeQueryable(this, this.meshObj1.mesh);
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: this.cverts, body: this.obj.body }, 0.7, this.motorC, 0.0, 0.05);
        this.selMeshObj2 = BSWG.genereteBlockPolyOutline({ verts: this.cverts, body: this.obj.body }, this.motorC);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);

    },

    destroy: function() {

        this.meshObj1.destroy();
        this.selMeshObj1.destroy();
        this.meshObj2.destroy();
        this.selMeshObj2.destroy();

    },

    render: function(ctx, cam, dt) {

        this.selMeshObj1.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
        this.selMeshObj2.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);

        this.meshObj1.update([0.5, 0.6, 0.5, 1], 2, BSWG.compAnchored(this));
        this.meshObj2.update([0.5, 0.5, 0.5, 1], 4, BSWG.compAnchored(this));

    },

    renderOver: function(ctx, cam, dt) {

    },

    openConfigMenu: function() {

    },

    closeConfigMenu: function() {

    },

    update: function(dt) {

    }

};