// BSWR - Spikes/Pikes component

BSWG.component_Spikes = {

    type: 'spikes',
    name: 'Spikes',

    sortOrder: 1,
    hasConfig: false,

    serialize: [
        'size',
        'pike'
    ],

    sbkey: [
        'size',
        'pike'
    ],

    isMele: true,

    attStrength: 2.0,

    sbadd: [
        { title: 'Spikes 1', size: 1, pike: false, value: 5 },
        { title: 'Spikes 2', size: 2, pike: false, value: 20 },
        { title: 'Spikes 3', size: 3, pike: false, value: 50 },
        { title: 'Pike 1', size: 1, pike: true, value: 5 },
        { title: 'Pike 2', size: 2, pike: true, value: 20 },
        { title: 'Pike 3', size: 3, pike: true, value: 50 },
        { title: 'Pike 4', size: 4, pike: true, value: 100 },
    ],

    frontOffset: Math.PI/2 - Math.PI/16 - Math.PI/50,

    category: 'weapon',

    getIconPoly: function(args) {
        var size      = args.size || 1;
        var nteeth    = [6, 6, 8, 10][size-1];
        var toothSize = [0.8, 1.6, 2.8, 4.0][size-1];
        var pike      = args.pike || false;

        if (pike) {
            toothSize *= 2.0;
        }

        var wheelVerts = new Array(nteeth);
        for (var i=0; i<nteeth; i++) {
            var a = i/nteeth * Math.PI;
            wheelVerts[i] = new b2Vec2(
                Math.cos(a) * size * 0.20, Math.sin(a) * size * 0.20
            );
        }

        var verts = new Array(pike ? 2 : nteeth-2);
        verts[0] = wheelVerts;
        if (pike) {
            var tverts = new Array(3);
            var p1 = wheelVerts[wheelVerts.length-1], p2 = wheelVerts[0];
            var dx = p2.x - p1.x, dy = p2.y - p1.y;
            var ac = Math.atan2(dx, -dy);
            var a1 = ac - Math.PI*0.2;
            var a2 = ac + Math.PI*0.2;
            tverts[0] = new b2Vec2(Math.cos(a1) * size * 0.20, Math.sin(a1) * size * 0.20);
            tverts[1] = new b2Vec2(Math.cos(ac) * (size+toothSize) * 0.40, Math.sin(ac) * (size+toothSize) * 0.40);
            tverts[2] = new b2Vec2(Math.cos(a2) * size * 0.20, Math.sin(a2) * size * 0.20);
            verts[1] = tverts;
        }
        else {
            for (var i=1; i<(nteeth-2); i++) {
                var tverts = new Array(3);
                var ac = (i+0.5)/nteeth * Math.PI;
                var j = (i+1) % nteeth;
                tverts[0] = new b2Vec2(wheelVerts[i].x, wheelVerts[i].y);
                tverts[1] = new b2Vec2(Math.cos(ac) * (size+toothSize) * 0.40, Math.sin(ac) * (size+toothSize) * 0.40);
                tverts[2] = new b2Vec2(wheelVerts[j].x, wheelVerts[j].y);
                verts[i] = tverts;
            }
        }

        return verts;
    },

    init: function(args) {

        this.size      = args.size || 1;
        this.nteeth    = [6, 6, 8, 10][this.size-1];
        this.toothSize = [0.8, 1.6, 2.8, 4.0][this.size-1];
        this.pike      = args.pike || false;

        this.maxHP = this.size * 90 / 3;

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
            frictionList: friction,
            isMele: true
        });

        this.jpoints = BSWG.createPolyJPoints([wheelVerts[wheelVerts.length-1], wheelVerts[0]], [1], false);

        this.meshObjs = new Array(verts.length);
        this.selMeshObjs = new Array(verts.length);

        for (var i=0; i<this.obj.verts.length; i++) {
            var tmpObj = {
                body: this.obj.body,
                verts: this.obj.verts[i],
                comp: this
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
            BSWG.bpmReflect = i === 0 ? 0.4 : 0.8;
            BSWG.bpmSmoothNormals = i > 0;
            this.meshObjs[i] = BSWG.generateBlockPolyMesh(tmpObj, 0.7, center, null, i === 0 ? 0.075 : 0.025);
            this.selMeshObjs[i] = BSWG.genereteBlockPolyOutline(tmpObj);
            BSWG.componentList.makeQueryable(this, this.meshObjs[i].mesh);
        }

        this.xpBase = 0.05 * this.size;
    },

    destroy: function() {

        for (var i=0; i<this.meshObjs.length; i++) {
            this.meshObjs[i].destroy();
            this.selMeshObjs[i].destroy();
        }

    },

    render: function(ctx, cam, dt) {

        var selClr = [0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)];
        var toothClr = [0.4, 0.4, 0.4, 1];
        var wheelClr = [1.0, 0.6, 0.05, 1];
        for (var i=0; i<this.meshObjs.length; i++) {
            this.selMeshObjs[i].update(selClr);
            this.meshObjs[i].update(i > 0 ? toothClr : wheelClr, i > 0 ? 1000.0 : 1.25, BSWG.compAnchored(this));
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