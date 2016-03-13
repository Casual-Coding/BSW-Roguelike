// BSWR - Spikes/Pikes component

BSWG.component_Spikes = {

    type: 'spikes',

    sortOrder: 1,
    hasConfig: false,

    serialize: [
        'size',
        'pike'
    ],

    init: function(args) {

        this.size      = args.size || 1;
        this.nteeth    = [6, 6, 8][this.size-1];
        this.toothSize = [0.8, 1.6, 2.8][this.size-1];
        this.pike      = args.pike || false;

        if (this.pike) {
            this.toothSize *= 2.0;
        }

        var friction = [ 0.25 ];
        var wheelVerts = new Array(this.nteeth);
        for (var i=0; i<this.nteeth; i++) {
            var a = i/this.nteeth * Math.PI;
            wheelVerts[i] = new b2Vec2(
                Math.cos(a) * this.size * 0.20, Math.sin(a) * this.size * 0.20
            );
        }

        var verts = new Array(this.pike ? 2 : this.nteeth-2);
        verts[0] = wheelVerts;
        if (this.pike) {
            var tverts = new Array(3);
            var p1 = wheelVerts[wheelVerts.length-1], p2 = wheelVerts[0];
            var dx = p2.x - p1.x, dy = p2.y - p1.y;
            var ac = Math.atan2(dx, -dy);
            var a1 = ac - Math.PI*0.2;
            var a2 = ac + Math.PI*0.2;
            tverts[0] = new b2Vec2(Math.cos(a1) * this.size * 0.20, Math.sin(a1) * this.size * 0.20);
            tverts[1] = new b2Vec2(Math.cos(ac) * (this.size+this.toothSize) * 0.40, Math.sin(ac) * (this.size+this.toothSize) * 0.40);
            tverts[2] = new b2Vec2(Math.cos(a2) * this.size * 0.20, Math.sin(a2) * this.size * 0.20);
            verts[1] = tverts;
            friction.push(0.75);
        }
        else {
            for (var i=1; i<(this.nteeth-2); i++) {
                var tverts = new Array(3);
                var ac = (i+0.5)/this.nteeth * Math.PI;
                var j = (i+1) % this.nteeth;
                tverts[0] = new b2Vec2(wheelVerts[i].x, wheelVerts[i].y);
                tverts[1] = new b2Vec2(Math.cos(ac) * (this.size+this.toothSize) * 0.40, Math.sin(ac) * (this.size+this.toothSize) * 0.40);
                tverts[2] = new b2Vec2(wheelVerts[j].x, wheelVerts[j].y);
                verts[i] = tverts;
                friction.push(0.75);
            }
        }

        this.obj = BSWG.physics.createObject('multipoly', args.pos, args.angle || 0, {
            verts: verts,
            density: 1.0/3.0,
            frictionList: friction
        });

        this.jpoints = BSWG.createPolyJPoints([wheelVerts[wheelVerts.length-1], wheelVerts[0]], [1], false);

        this.meshObjs = new Array(verts.length);
        this.selMeshObjs = new Array(verts.length);

        for (var i=0; i<this.obj.verts.length; i++) {
            var tmpObj = {
                body: this.obj.body,
                verts: this.obj.verts[i]
            };
            var center = null;
            if (i>0) {
                center = new b2Vec2(
                    (tmpObj.verts[0].x + tmpObj.verts[2].x) * 0.5,
                    (tmpObj.verts[0].y + tmpObj.verts[2].y) * 0.5
                );
            }
            else {
                center = new b2Vec2(
                    Math.cos(Math.PI/2) * this.size * 0.10,
                    Math.sin(Math.PI/2) * this.size * 0.10
                );
            }
            this.meshObjs[i] = BSWG.generateBlockPolyMesh(tmpObj, 0.7, center, null, i === 0 ? 0.075 : 0.025);
            this.selMeshObjs[i] = BSWG.genereteBlockPolyOutline(tmpObj);
            BSWG.componentList.makeQueryable(this, this.meshObjs[i].mesh);
        }
    },

    destroy: function() {

        for (var i=0; i<this.meshObjs.length; i++) {
            this.meshObjs[i].destroy();
            this.selMeshObjs[i].destroy();
        }

    },

    render: function(ctx, cam, dt) {

        var selClr = [0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0];
        var toothClr = [1.0, 1.0, 1.0, 1];
        var wheelClr = [1.0, 0.6, 0.05, 1];
        for (var i=0; i<this.meshObjs.length; i++) {
            this.selMeshObjs[i].update(selClr);
            this.meshObjs[i].update(i > 0 ? toothClr : wheelClr, i > 0 ? 10.0 : 1.25, BSWG.compAnchored(this));
        }

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