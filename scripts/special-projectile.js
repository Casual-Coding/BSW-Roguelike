BSWG.torpedoSpeed = 25;
BSWG.torpedoArcHeight = 8;
BSWG.torpedoRange = 60;
BSWG.torpedoDPS = 80/2;

BSWG.eTorpedoSpeed = 20;
BSWG.eTorpedoArcHeight = 20;
BSWG.eTorpedoRange = 60;

BSWG.specProj_TorpedoOrEMP = {

    init: function(args) {

        this.type = args.type || 'torpedo';
        this.source = args.source;

        if (this.type === 'torpedo') {
            this.speed = BSWG.torpedoSpeed;
            this.range = BSWG.torpedoRange;
            this.arcHeight = BSWG.torpedoArcHeight;
        }
        else if (this.type === 'emp') {
            this.speed = BSWG.eTorpedoSpeed;
            this.range = BSWG.eTorpedoRange;
            this.arcHeight = BSWG.eTorpedoArcHeight;
        }

        if (args.follow) {
            this.follow = args.follow;
            this.totalDistance = this.range;
            this.distance = 0;
        }
        else {
            this.startP = args.startP;
            this.endP = args.endP;
            this.totalDistance = Math.distVec2(this.startP, this.endP)
            this.distance = 0;
        }

        this.detonated = false;
        this.explodeT = 0.0;

        this.mat = BSWG.render.newMaterial("basicVertex", "torpedoFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(1, 0, 0, 1)
            },
        }, THREE.AdditiveBlending, THREE.DoubleSide);

        this.smat = BSWG.render.newMaterial("basicVertex", "shadowFragment", {
        }, THREE.NormalBlending, THREE.DoubleSide);

        this.geom = BSWG.torpedoGeom;

        this.mesh = new THREE.Mesh(BSWG.torpedoGeom, this.mat);
        this.mesh.renderOrder = 1600.0;
        BSWG.render.scene.add(this.mesh);

        this.smesh = new THREE.Mesh(BSWG.torpedoGeom, this.smat);
        BSWG.render.sceneS.add(this.smesh);

        this.updateRender(null, null, 1.0/60);

    },

    updateRender: function(ctx, cam, dt) {

        if (!this.detonated) {
            this.distance += this.speed * dt;
            if (this.distance > this.totalDistance) {
                this.distance = this.totalDistance;
                if (!this.detonated) {
                    this.detonated = true;
                    this.explodeT = 0.0;
                }
            }
        }

        var p = new THREE.Vector3(0, 0, 0.05);
        var scale = 0.75;
        var alpha = Math.clamp(this.distance*2, 0, 1);

        if (this.detonated) {
            this.explodeT += dt;
            if (this.explodeT > 2.0) {
                this.explodeT = 2.0;
            }
            alpha *= 1.0 - (this.explodeT / 2.0);
            scale += Math.sqrt(this.explodeT * 10);
        }

        if (!this.follow) {
            var t = this.distance / this.totalDistance;
            p.z = 0.05 + Math.sin(t * Math.PI) * this.arcHeight;
            var p2 = Math.interpolate(this.startP, this.endP, t);
            p.x = p2.x; p.y = p2.y;
            p2 = null;
        }

        var a1 = Math.random() * Math.PI * 2;
        var a2 = Math.random() * Math.PI * 2;
        var a3 = Math.random() * Math.PI * 2;

        this.mesh.position.set(p.x, p.y, p.z);
        this.mesh.scale.set(scale, scale, scale);
        this.mesh.rotation.set(a1, a2, a3, 'XYZ');

        this.smesh.position.set(p.x, p.y, p.z);
        this.smesh.scale.set(scale, scale, scale);
        this.smesh.rotation.set(a1, a2, a3, 'XYZ');

        if (this.type === 'torpedo') {
            if (this.detonated) {
                var list = BSWG.componentList.withinRadius(new b2Vec2(p.x, p.y), scale);
                for (var i=0; i<list.length; i++) {
                    list[i].takeDamage(BSWG.torpedoDPS * dt, this.source || null, true);
                }
                list = null;                
            }
            var r = (~~(Math.random() * 100000)) % 4;
            if (r === 0) {
                this.mat.uniforms.clr.value.set(1, 1, 1, .75*alpha);
            }
            else if (r === 1) {
                this.mat.uniforms.clr.value.set(1, 1, 0, .75*alpha);
            }
            else if (r === 2) {
                this.mat.uniforms.clr.value.set(1, .5, 0, .75*alpha);
            }
            else if (r === 3) {
                this.mat.uniforms.clr.value.set(1, 0, 0, .75*alpha);
            }
            for (var i=0; i<4; i++) {
                var r = scale;
                var a = Math._random() * Math.PI * 2.0;
                var r2 = Math._random() * r;
                var v = new THREE.Vector3(Math._random() * 8 - 4, Math._random() * 8 - 4, Math._random() * 8 - 4);
                var p2 = new THREE.Vector3(p.x + Math.cos(a) * r2, p.y + Math.sin(a) * r2, p.z);
                BSWG.render.boom.palette = chadaboom3D.fire_bright;
                BSWG.render.boom.add(
                    p2,
                    r*(1.5 + 4.5*Math._random())*0.5,
                    256,
                    1 + Math.pow(r, 1/3) * Math._random(),
                    2.0,
                    v,
                    null,
                    Math.random() < 0.2
                );
                p2 = v = null;
            }
        }

        if (ctx && cam) {
            this._updateRender(ctx, cam, dt);
        }

        if (this.explodeT >= 2.0) {
            this.remove();
        }
    },

    destroy: function() {

        BSWG.render.scene.remove(this.mesh);
        BSWG.render.sceneS.remove(this.smesh);

        this.mesh.material = null;
        this.mesh.geometry = null;
        this.smesh.material = null;
        this.smesh.geometry = null;
        this.mat.dispose();
        this.smat.dispose();
        this.mat = null;
        this.smat = null;
        this.mesh = null;
        this.smesh = null;

        this._destroy();
    }

};

BSWG.specProj = function(desc, args) {

    this.desc = desc || {};
    this.args = args || {};

    for (var key in this.desc) {
        if (this[key]) {
            this['_' + key] = this[key];
        }
        this[key] = this.desc[key];
    }

    this.init(this.args);

    BSWG.specProjList.add(this);

};

BSWG.specProj.prototype.init = function(args) {

};

BSWG.specProj.prototype.destroy = function() {

    this.desc = null;
    this.args = null;

};

BSWG.specProj.prototype.updateRender = function(ctx, cam, dt) {

};

BSWG.specProj.prototype.remove = function() {
    BSWG.specProjList.remove(this);
};

BSWG.specProjList = new (function(){

    this.list = [];

    this.clear = function() {
        if (!BSWG.torpedoGeom) {
            BSWG.torpedoGeom = new THREE.IcosahedronGeometry(1, 2);
        }
        while (this.list.length) {
            this.remove(this.list[0]);
        }
    };

    this.remove = function(obj) {
        obj.destroy();

        var idx = this.list.indexOf(obj);
        if (idx >= 0) {
            this.list.splice(idx, 1);
        }
    };

    this.add = function(obj) {
        this.list.push(obj);
    }

    this.updateRender = function(ctx, cam, dt) {
        for (var i=0; i<this.list.length; i++) {
            this.list[i].updateRender(ctx, cam, dt);
        }
    };

})();