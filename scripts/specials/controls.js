BSWG.specialCont_circleRange = {

    init: function(args) {

        this.polys = args.polys || null;
        this.color = args.color || new THREE.Vector4(1, 1, 1, 1);
        this.time = 0.0;
        this.outTime = 0.0;
        this.minRadius = args.minRadius || 1.0;
        this.maxRadius = args.maxRadius || 5.0;
        this.speed = args.speed || 1.0;
        this.depth = args.depth || 1.0;
        this.radius = this.minRadius;
        this.pos = BSWG.physics.mousePosWorld();

        var circShape = new THREE.Shape();
        var hole = new THREE.Path();
        for (var i=0; i<64; i++) {
            var a = i/64 * Math.PI * 2.0;
            var x = Math.cos(a), y = Math.sin(a);
            if (i === 0) {
                circShape.moveTo(x, y);
                hole.moveTo(x*0.9, y*0.9);
            }
            else {
                circShape.lineTo(x, y);
                hole.lineTo(x*0.9, y*0.9);
            }
        }
        circShape.holes.push(hole);
        this.geom = new THREE.ExtrudeGeometry(circShape, {amount: this.depth, bevelEnabled: false});

        if (this.polys) {
            for (var i=0; i<this.polys.length; i++) {
                var polyShape = new THREE.Shape();
                for (var j=0; j<=this.polys[i].length; j++) {
                    var p = this.polys[i][j % this.polys[i].length];
                    if (j === 0) {
                        polyShape.moveTo(p.x, p.y);
                    }
                    else {
                        polyShape.lineTo(p.x, p.y);
                    }
                }
                var polyGeom = new THREE.ExtrudeGeometry(polyShape, {amount: this.depth, bevelEnabled: false});
                this.geom.merge(polyGeom);

            }
        }

        this.geom.computeFaceNormals();
        //this.geom.computeVertexNormals();
        this.geom.computeBoundingBox();

        this.mat = BSWG.render.newMaterial("basicVertex", "selectionFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(0,0,0,0)
            },
            warp: {
                type: 'v4',
                value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
            }
        }, THREE.NormalBlending, false);
        this.mesh = new THREE.Mesh( this.geom, this.mat );
        this.mat.needsUpdate = true;
        this.mesh.needsUpdate = true;
        this.mesh.renderOrder = 1400.0;

        BSWG.render.scene.add(this.mesh);

        this._init(args);

        return true;
    },

    destroy: function () {

        BSWG.render.scene.remove(this.mesh);

        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.geometry = null;
        this.mesh.material = null;
        this.mesh = null;
        this.mat = null;
        this.geom = null;

        this.poly = null;

        this._destroy();

    },

    updateRender: function(ctx, dt) {

        if (!this.mesh) {
            return;
        }

        if (!this._updateRender(ctx, dt)) {
            return false;
        }

        this.time += dt;

        if (this.userAction) {
            this.outTime += dt*8;
            if (this.outTime >= 1) {
                this.destroy();
            }
            else {
                this.mat.uniforms.clr.value.set(this.color.x, this.color.y, this.color.z, this.color.w * Math.clamp(this.time*8, 0, 1) * (1-this.outTime));
            }
            return;
        }

        var t = (Math.sin(this.time * Math.PI * this.speed) * 0.5 + 0.5);

        this.radius = (this.maxRadius - this.minRadius) * t + this.minRadius;
        this.pos = BSWG.physics.mousePosWorld();

        this.mesh.position.set(this.pos.x, this.pos.y, 0.0 - this.depth * 0.25);
        this.mesh.scale.set(this.radius, this.radius, 1.0);
        this.mesh.rotation.set(0, 0, -this.time*this.speed);
        this.mat.uniforms.clr.value.set(this.color.x, this.color.y, this.color.z, this.color.w * Math.clamp(this.time*4, 0, 1));
        this.mat.uniforms.warp.value.set(1.0, this.time, 0.0, 0.0);

        if (!(BSWG.ui.mouseBlock || BSWG.ui_DlgBlock)) {
            if (BSWG.input.MOUSE_PRESSED('left')) {
                BSWG.input.EAT_MOUSE('left');
                this.output = {
                    p: this.pos,
                    r: this.radius
                };
            }
            else if (BSWG.input.MOUSE_PRESSED('right')) {
                BSWG.input.EAT_MOUSE('right');
                this.output = null;
                this.userAction = true;
                if (this.callback) {
                    this.callback(this.output);
                }
            }
        }

    }

};

BSWG.specialCont_targetEnemy = {

};

BSWG.specialCont_targetShip = {

    init: function(args) {

        this.output = { // Immediately finish (no user input)
            cc: args.cc || null
        };

        if (!this.output.cc) {
            this.output.cc = (BSWG.game.ccblock && !BSWG.game.ccblock.destroyed) ? BSWG.game.ccblock : null;
        }

        this._init(args);

        if (this.callback) {
            this.callback(this.output);
        }

        return false;

    }

};