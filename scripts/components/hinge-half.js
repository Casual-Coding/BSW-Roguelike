// BSWR - Hinge Half component

BSWG.component_HingeHalf = {

    type: 'hingehalf',

    sortOrder: 1,

    hasConfig: true,

    init: function(args) {

        this.size   = args.size || 1;
        this.motor  = args.motor || false;
        this.rotKey = args.rotKey || (this.motor ? BSWG.KEY.A : BSWG.KEY.D);

        var verts = [
            //new b2Vec2(this.size * -0.5, this.size * -0.5),
            new b2Vec2(this.size *  0.5, this.size * -0.5),
            new b2Vec2(this.size *  0.95,             0.0),
            new b2Vec2(this.size *  0.5, this.size *  0.5),
            //new b2Vec2(this.size * -0.5, this.size *  0.5)
        ];

        this.motorC = new b2Vec2(this.size * 1.0, 0.0);

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts:  verts,
            smooth: 0.05
        });

        this.jpoints = BSWG.createPolyJPoints(verts, [0, 1], true);

        this.dispKeys = {
            'rotate': [ '', new b2Vec2(this.size * 0.75, 0.0) ],
        };

        var cjp = new b2Vec2(this.motorC.x, this.motorC.y);
        cjp.motorType = (this.motor ? 1 : 2) * 10 + this.size;
        this.jpoints.push(cjp)

        var len = Math.floor(this.size * 5 * (this.motor ? 2 : 1.5));
        this.cverts = new Array(len);
        var r = this.size * (this.motor ? 0.6 : 0.45) * 0.3;
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
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: this.cverts, body: this.obj.body }, 0.7, this.motorC, !this.motor ? 0.05 : 0.0, 0.05);
        this.selMeshObj2 = BSWG.genereteBlockPolyOutline({ verts: this.cverts, body: this.obj.body }, this.motorC);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);

    },

    render: function(ctx, cam, dt) {

        //ctx.fillStyle = '#353';
        //BSWG.drawBlockPoly(ctx, this.obj, 0.7, null, BSWG.componentHoverFn(this));

        if (this.motor) {
            //ctx.fillStyle = this.motor ? '#080' : '#aaa';
            //BSWG.drawBlockPoly(ctx, { verts: this.cverts, body: this.obj.body }, 0.7, this.motorC, BSWG.componentHoverFn(this));
        }

        this.selMeshObj1.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
        this.selMeshObj2.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);

        this.meshObj1.update([0.5, 0.6, 0.5, 1], 2);
        this.meshObj2.update(this.motor ? [0.1, 0.7, 0.8, 1] : [0.5, 0.5, 0.5, 1], 4);

    },

    renderOver: function(ctx, cam, dt) {

        if (!this.motor) {
            //ctx.fillStyle = this.motor ? '#080' : '#aaa';
            //BSWG.drawBlockPoly(ctx, { verts: this.cverts, body: this.obj.body }, 0.7, this.motorC, BSWG.componentHoverFn(this));
        }

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
            title: this.motor ? 'Hinge rotate' : 'Hinge rotate reverse',
            close: function (key) {
                if (key)
                    self.rotKey = key;
            }
        });

    },

    closeConfigMenu: function() {

    },

    update: function(dt) {

        //if (this.dispKeys) {
            this.dispKeys['rotate'][0] = BSWG.KEY_NAMES[this.rotKey].toTitleCase();
            this.dispKeys['rotate'][2] = BSWG.input.KEY_DOWN(this.rotKey);
        //}

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
                robj.joint.SetMotorSpeed(this.motor ? 1 : -1);
            }
        }

    },

};