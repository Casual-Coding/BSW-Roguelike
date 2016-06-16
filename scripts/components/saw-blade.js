// BSWR - Saw blade component

BSWG.component_SawBlade = {

    type: 'sawblade',
    name: 'Saw Blade',

    sortOrder:       1,
    hasConfig:       false,
    canMoveAttached: true,

    attStrength: 2.0,

    serialize: [
        'size'
    ],

    sbadd: [
        { title: 'Size 1', size: 1 },
        { title: 'Size 2', size: 2 },
        { title: 'Size 3', size: 3 }
    ],

    init: function(args) {

        this.size      = args.size || 1;
        this.nteeth    = [7, 8, 9][this.size-1];
        this.toothSize = [0.4, 0.8, 1.4][this.size-1];

        var wheelVerts = new Array(this.nteeth);
        for (var i=0; i<this.nteeth; i++) {
            var a = i/this.nteeth * Math.PI * 2.0;
            wheelVerts[i] = new b2Vec2(
                Math.cos(a) * this.size * 0.30, Math.sin(a) * this.size * 0.30
            );
        }

        this.maxHP = this.size * 100 / 3;

        var verts = new Array(this.nteeth+1);
        verts[0] = wheelVerts;
        for (var i=0; i<this.nteeth; i++) {
            var tverts = new Array(3);
            var ac = (i+0.7)/this.nteeth * Math.PI * 2.0;
            var j = (i+1) % this.nteeth;
            tverts[0] = new b2Vec2(wheelVerts[i].x, wheelVerts[i].y);
            tverts[1] = new b2Vec2(Math.cos(ac) * (this.size+this.toothSize) * 0.40, Math.sin(ac) * (this.size+this.toothSize) * 0.40);
            tverts[2] = new b2Vec2(wheelVerts[j].x, wheelVerts[j].y);
            verts[i+1] = tverts;
        }

        this.obj = BSWG.physics.createObject('multipoly', args.pos, args.angle || 0, {
            verts: verts,
            density: 1.0/3.0,
            friction: 0.05,
            restitution: 0.0,
            isMele: true
        });

        var cjp = new b2Vec2(0.0, 0.0);
        cjp.motorType = (false ? 1 : 2) * 10 + this.size + 2;
        this.jpoints = [ cjp ];

        BSWG.bpmReflect = 0.4;
        this.meshObjs = new Array(this.nteeth+1);
        this.selMeshObjs = new Array(this.nteeth+1);

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
            BSWG.bpmReflect = i === 0 ? 0.2 : 1.0;
            BSWG.bpmSmoothNormals = true;
            this.meshObjs[i] = BSWG.generateBlockPolyMesh(tmpObj, 0.7, center, null, i === 0 ? 0.075 : 0.025);
            BSWG.bpmSmoothNormals = true;
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

        var selClr = [0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0];
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

        var robj = null;
        for (var k in this.welds) {
            if (this.welds[k] && this.welds[k].obj.revolute) {
                robj = this.welds[k].obj;
                break;
            }
        }

        if (robj) {
            this.obj.body.SetAngularDamping(5.0);
            if (robj.vMotorSpeed) {
                this.obj.body.ApplyTorque(robj.vMotorSpeed * Math.pow(this.obj.body.GetMass(), 2.0));
            }
        }
        else {
            this.obj.body.SetAngularDamping(0.1);
        }

    }

};