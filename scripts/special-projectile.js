BSWG.torpedoSpeed = 25;
BSWG.torpedoArcHeight = 8;
BSWG.torpedoRange = 50;
BSWG.torpedoDPS = 80/2;

BSWG.eTorpedoSpeed = 20;
BSWG.eTorpedoArcHeight = 10;
BSWG.eTorpedoRange = 60;
BSWG.eTorpedoEPS = 6; // 6s to 1s emp exposure vs emp effect

BSWG.lightning = function(p, n, lw) {

    this.p = p;
    this.n = n;
    this.ep = p.clone();
    this.alpha = 0.0;

    this.mat = BSWG.render.newMaterial("basicVertex", "torpedoFragment", {
        clr: {
            type: 'v4',
            value: new THREE.Vector4(0, 0, 0, 0)
        },
    }, THREE.AdditiveBlending, THREE.DoubleSide);
    this.mat.needsUpdate = true;
    this.geom = new THREE.Geometry();
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.line = new THREE.Line(this.geom, this.mat);
    this.line.renderOrder = 1601.0;
    this.line.position.set(p.x, p.y, p.z);

    this.nosoundyet = true;

    BSWG.render.scene.add(this.line);

};

BSWG.lightning.prototype.playsound = function() {

    var len = Math.sqrt(this.n.x * this.n.x + this.n.y * this.n.y + this.n.z * this.n.z);

    new BSWG.soundSample().play('lightning', this.p.clone(), 1.5 * len * (Math.random() * 0.5 + 0.5), 2/(Math.clamp(len-Math.random()*0.5, 1, 3)));

    this.nosoundyet = false;
}

BSWG.lightning.prototype.update = function(dt) {

    if (this.nosoundyet || Math.random() < dt*1.1) {
        this.playsound();
    }

    var clr = (~~(Math._random()*1000000)) % 4;

    if (clr === 0) {
        this.mat.uniforms.clr.value.set(1, 1, 1, 1.0 * this.alpha * Math._random());
    }
    else if (clr === 1) {
        this.mat.uniforms.clr.value.set(0, 1, 1, 1.0 * this.alpha * Math._random());
    }
    else if (clr === 2) {
        this.mat.uniforms.clr.value.set(0, .5, 1, 1.0 * this.alpha * Math._random());
    }
    else {
        this.mat.uniforms.clr.value.set(0, 0, 1, 1.0 * this.alpha * Math._random());
    }

    this.line.position.set(this.p.x, this.p.y, this.p.z);
    var n = this.n.clone();
    for (var i=1; i<this.geom.vertices.length; i++) {
        var a1 = Math.random() * Math.PI / 3 - Math.PI / 6;
        var a2 = Math.random() * Math.PI / 3 - Math.PI / 6;
        n.applyAxisAngle(new THREE.Vector3(1, 0, 0), a1);
        n.applyAxisAngle(new THREE.Vector3(0, 1, 0), a2);
        this.geom.vertices[i].x = this.geom.vertices[i-1].x + n.x * .3;
        this.geom.vertices[i].y = this.geom.vertices[i-1].y + n.y * .3;
        this.geom.vertices[i].z = this.geom.vertices[i-1].z + n.z * .3;
        var t = i/(this.geom.vertices.length-1);
        this.geom.vertices[i].x = t * (this.ep.x - this.p.x) + this.geom.vertices[i].x * (1-t);
        this.geom.vertices[i].y = t * (this.ep.y - this.p.y) + this.geom.vertices[i].y * (1-t);
        this.geom.vertices[i].z = t * (this.ep.z - this.p.z) + this.geom.vertices[i].z * (1-t);
        this.geom.dynamic = true;
        this.geom.verticesNeedUpdate = true;
    }

};

BSWG.lightning.prototype.destroy = function() {

    BSWG.render.scene.remove(this.line);

    this.line.material = null;
    this.line.geometry = null;
    this.mat.dispose();
    this.geom.dispose();
    this.mat = null;
    this.geom = null;
    this.line = null;

};

BSWG.specProj_TorpedoOrEMP = {

    init: function(args) {

        this.type = args.type || 'torpedo';
        this.source = args.source;
        this.noSelfDamage = args.noSelfDamage;
        this.lightning = [];
        this.scale = args.scale || 1;

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
            this.startP = this.follow.p().clone();
        }
        else {
            this.startP = args.startP;
            this.endP = args.endP;
            this.totalDistance = Math.distVec2(this.startP, this.endP);
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
        this.mat.transparent = true;
        this.mat.needsUpdate = true;

        this.smat = BSWG.render.newMaterial("basicVertex", "shadowFragment", {
        }, THREE.NormalBlending, THREE.DoubleSide);

        this.geom = BSWG.torpedoGeom;

        this.mesh = new THREE.Mesh(BSWG.torpedoGeom, this.mat);
        this.mesh.renderOrder = 1600.0;
        BSWG.render.scene.add(this.mesh);

        this.smesh = new THREE.Mesh(BSWG.torpedoGeom, this.smat);
        BSWG.render.sceneS.add(this.smesh);

        if (this.type === 'emp') {
            for (var k=0; k<10; k++) {
                this.addLightning();
            }
        }

        this.updateRender(null, null, 1.0/60);

    },

    addLightning: function() {
        var l = new BSWG.lightning(this.mesh.position.clone(), new THREE.Vector3(0, 0, 1));
        l.just = true;
        this.lightning.push(l);
        l = null;
    },

    detonate: function(v) {
        if (!this.detonated) {
            this.finalVel = (v || new b2Vec2(0, 0)).clone();
            this.finalPos = this.mesh.position.clone();
            this.dampT = 0.0;
            this.detonated = true;
            this.distance = this.totalDistance;
            this.explodeT = 0.0;
            if (this.type === 'emp') {
                for (var k=0; k<10; k++) {
                    this.addLightning();
                }                        
            }
        }
    },

    updateRender: function(ctx, cam, dt) {

        if (!this.detonated) {
            if (this.follow) {
                if (this.follow.p()) {
                    this.distance = Math.distVec2(this.follow.p().clone(), this.startP);
                }
            }
            else {
                this.distance += this.speed * dt;
            }
            if (this.distance > this.totalDistance) {
                this.distance = this.totalDistance;
                this.detonate();
            }
        }

        var p = new THREE.Vector3(0, 0, 0.05);
        var scale = this.scale * 0.75;
        var alpha = Math.clamp(this.distance*2+Math.max(0.5-this.totalDistance, 0)*2, 0, 1);

        if (this.detonated) {
            this.explodeT += dt;
            if (this.explodeT > 2.0) {
                this.explodeT = 2.0;
            }
            alpha *= 1.0 - (this.explodeT / 2.0);
            scale += this.scale * Math.sqrt(this.explodeT * 10);
        }
        else {
            scale *= Math.max(0.01, alpha);
        }

        if (!this.follow) {
            var t = (this.totalDistance > 0) ? (this.distance / this.totalDistance) : 0.0;
            p.z = 0.05 + Math.sin(t * Math.PI) * this.arcHeight;
            var p2 = Math.interpolate(this.startP, this.endP, t);
            p.x = p2.x; p.y = p2.y;
            p2 = null;
        }
        else if (this.follow.obj && this.follow.obj.body && !this.detonated) {
            var p2 = this.follow.p().clone();
            p.x = p2.x; p.y = p2.y;
            p2 = null;
        }
        else if (this.finalVel) {
            this.dampT += dt;
            var vt = Math.max(0, (Math.pow(Math.max(BSWG.physics.baseDamping, 0.0), Math.max(this.dampT, 0.0)) - 1.0) / Math.log(BSWG.physics.baseDamping));
            console.log(vt);
            p.x = this.finalPos.x + this.finalVel.x * vt;
            p.y = this.finalPos.y + this.finalVel.y * vt;
        }

        for (var i=0; i<this.lightning.length; i++) {
            var L = this.lightning[i];
            if (L.just || Math.random() < 1/20) {
                L.n = new THREE.Vector3(0, 0, 2 * scale);
                var a1 = Math.random() * Math.PI * 2;
                var a2 = Math.random() * Math.PI * 2;
                L.n.applyAxisAngle(new THREE.Vector3(1, 0, 0), a1);
                L.n.applyAxisAngle(new THREE.Vector3(0, 1, 0), a2);
                L.just = false;
                L.n2 = new THREE.Vector3(0, 0, 2 * scale);
                a1 = Math.random() * Math.PI * 2;
                a2 = Math.random() * Math.PI * 2;
                L.n2.applyAxisAngle(new THREE.Vector3(1, 0, 0), a1);
                L.n2.applyAxisAngle(new THREE.Vector3(0, 1, 0), a2);
            }
            var n = L.n.clone();
            n.normalize();
            L.p = new THREE.Vector3(p.x + n.x * scale, p.y + n.y * scale, p.z + n.z * scale);

            n = L.n2.clone();
            n.normalize();
            L.ep = new THREE.Vector3(p.x + n.x * scale, p.y + n.y * scale, p.z + n.z * scale);

            L.alpha = alpha;
            L.update(dt);
            L = null;
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
                    if (list[i].onCC === this.source.onCC && this.noSelfDamage) {
                        continue;
                    }
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
        else if (this.type === 'emp') {
            if (this.detonated) {
                var list = BSWG.componentList.withinRadius(new b2Vec2(p.x, p.y), scale);
                for (var i=0; i<list.length; i++) {
                    if (list[i].onCC === this.source.onCC && this.noSelfDamage) {
                        continue;
                    }
                    list[i].empEffect += BSWG.eTorpedoEPS * dt;
                }
                list = null;                
            }
            var r = (~~(Math.random() * 100000)) % 4;
            if (r === 0) {
                this.mat.uniforms.clr.value.set(1, 1, 1, .45*alpha);
            }
            else if (r === 1) {
                this.mat.uniforms.clr.value.set(0, 1, 1, .45*alpha);
            }
            else if (r === 2) {
                this.mat.uniforms.clr.value.set(0, .5, 1, .45*alpha);
            }
            else if (r === 3) {
                this.mat.uniforms.clr.value.set(0, 0, 1, .45*alpha);
            }
            for (var i=0; i<4; i++) {
                var r = scale;
                var a = Math._random() * Math.PI * 2.0;
                var r2 = Math._random() * r;
                var v = new THREE.Vector3(Math._random() * 8 - 4, Math._random() * 8 - 4, Math._random() * 8 - 4);
                var p2 = new THREE.Vector3(p.x + Math.cos(a) * r2, p.y + Math.sin(a) * r2, p.z);
                BSWG.render.boom.palette = chadaboom3D.blue_bright;
                BSWG.render.boom.add(
                    p2,
                    r*(1.5 + 4.5*Math._random())*0.1,
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

        for (var i=0; i<this.lightning.length; i++) {
            this.lightning[i].destroy();
            this.lightning[i] = null;
        }
        this.lightning = null;
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
        else if (!BSWG.shieldGeom) {
            BSWG.shieldGeom = new THREE.IcosahedronGeometry(1, 3);
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