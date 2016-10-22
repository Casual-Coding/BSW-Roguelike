BSWG.maxExaust = 192;

BSWG.exaustFire = [
    new THREE.Vector4(1, 1, 1, 1),
    new THREE.Vector4(1, 1, 0, 1),
    new THREE.Vector4(1, 0, 0, 1)
];

BSWG.exaustBlue = [
    new THREE.Vector4(1, 1, 1, 1),
    new THREE.Vector4(0,.5, 1, 1),
    new THREE.Vector4(0, 0, 1, 1)
];

BSWG.exaust = function (body, local, size, angle, z, palette) {

    if (!palette) {
        palette = BSWG.exaustFire;
    }

    var geom = BSWG.exaustList.geom;
    var mat = null;

    for (var i=0; i<BSWG.maxExaust; i++) {
        if (!BSWG.exaustList.mat[i].__used) {
            mat = BSWG.exaustList.mat[i];
            mat.__used = true;
            break;
        }
    }

    this.geom = geom;
    this.mat = mat;
    this.time = 0.0;
    this.strength = 0;
    this.size = size || 1.0;
    this.body = body || null;
    this.local = local || new b2Vec2(0, 0);
    this.angle = angle || 0.0;
    this.z = z || 0.0;

    if (this.mat && this.body) {
        this.mat.uniforms.clri.value.copy(palette[0]);
        this.mat.uniforms.clrm.value.copy(palette[1]);
        this.mat.uniforms.clro.value.copy(palette[2]);
        this.mat.uniforms.extra.value.set(this.strength, this.time, 0., 0.);
        this.mat.__shadowMat.uniforms.extra.value.set(this.strength, this.time, 0., 0.);
        this.mesh = new THREE.Mesh(this.geom, this.mat);
        this.mesh.renderOrder = 1600.0;
        BSWG.render.scene.add(this.mesh);
        this.smesh = new THREE.Mesh(this.geom, this.mat.__shadowMat);
        BSWG.render.sceneS.add(this.smesh);
    }

    BSWG.exaustList.add(this);

};

BSWG.exaust.prototype.render = function (dt) {

    this.time += dt;

    if (this.mat) {
        this.mat.uniforms.extra.value.set(this.strength, this.time, 0., 0.);
        this.mat.__shadowMat.uniforms.extra.value.set(this.strength, this.time, 0., 0.);
    }

    if (this.mesh && this.body) {
        var wp = (this.body instanceof b2Vec2) ? this.body : BSWG.physics.localToWorld(this.local, this.body);
        var a = this.angle + (this.body.GetAngle ? this.body.GetAngle() : 0.0);
       
        this.mesh.position.set(wp.x, wp.y, this.z);
        this.mesh.rotation.set(0., 0., a, 'ZXY');
        this.mesh.scale.set(this.size * 15, this.size * 3.5, 1.);
        this.smesh.position.set(wp.x, wp.y, this.z);
        this.smesh.rotation.set(0., 0., a, 'ZXY');
        this.smesh.scale.set(this.size * 15, this.size * 3.5, 1.);

        wp = null;
    }

};

BSWG.exaust.prototype.destroy = function () {

    if (this.mesh) {
        BSWG.render.scene.remove(this.mesh);
        this.mesh = null;
    }

    if (this.smesh) {
        BSWG.render.sceneS.remove(this.smesh);
        this.smesh = null;
    }

    if (this.mat) {
        this.mat.__used = false;
    }

    this.geom = null;
    this.mat = null;
    this.body = null;
    this.local = null;

};

BSWG.exaust.prototype.remove = function () {

    this.destroy();

    BSWG.exaustList.remove(this);

};

BSWG.exaustList = (new function () {

    this.list = [];

    this.add = function (ex) {
        this.list.push(ex);
    };

    this.remove = function (ex) {
        var len = this.list.length;
        for (var i=0; i<len; i++) {
            if (this.list[i] === ex) {
                this.list.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    this.clear = function () {
        while (this.list.length) {
            this.list[0].remove();
        }
        this.list = [];
        for (var i=0; i<BSWG.maxExaust; i++) {
            this.mat[i].__used = false;
        }
    };

    this.render = function (dt) {
        var len = this.list.length;
        for (var i=0; i<len; i++) {
            this.list[i].render(dt);
        }
    };

    this.hasInit = false;

    this.init = function () {

        if (this.hasInit) {
            this.clear();
            return;
        }

        this.hasInit = true;

        this.geom = new THREE.PlaneBufferGeometry( 1, 1, 1, 1 );
        this.mat = [];
        Math.seedrandom();
        for (var i=0; i<BSWG.maxExaust; i++) {
            this.mat[i] = BSWG.render.newMaterial("basicVertex", "exaustFragment", {
                clri: {
                    type: 'v4',
                    value: new THREE.Vector4(1, 1, 1, 1)
                },
                clrm: {
                    type: 'v4',
                    value: new THREE.Vector4(1, 1, 0, 1)
                },
                clro: {
                    type: 'v4',
                    value: new THREE.Vector4(1, 0, 0, 1)
                },
                extra: {
                    type: 'v4',
                    value: new THREE.Vector4(0, 0, 0, 0) // strength, time, ?, ?
                }
            }, THREE.AdditiveBlending, THREE.DoubleSide);
            this.mat[i].__used = false;
            this.mat[i].__shadowMat = BSWG.render.newMaterial("basicVertex", "exaustFragmentShadow", {
                extra: {
                    type: 'v4',
                    value: new THREE.Vector4(0, 0, 0, 0) // strength, time, ?, ?
                }
            }, THREE.NormalBlending, THREE.DoubleSide);
        }

    }

}());