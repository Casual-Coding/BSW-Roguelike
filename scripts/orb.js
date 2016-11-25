BSWG.orbRes      = 3;
BSWG.orbReflect  = 0.15;
BSWG.orbZ        = -0.5 - 3.5;
BSWG.orbScale    = 2.5;
BSWG.orbZoneSize = 48.0;

BSWG.orb = function (pos, zone) {

    this.time = 0.0;

    this.zone = zone || null;
    this.pos = pos.clone();
    this.activeT = 0.0;
    this.active = false;

    this.mat = BSWG.render.newMaterial("basicVertex2", "basicFragment2", {
        clr: {
            type: 'v4',
            value: new THREE.Vector4(0.3, 1.0, 0.5, 1.0)
        },
        map: {
            type: 't',
            value: BSWG.render.images['test_nm'].texture
        },
        dmgMap: {
            type: 't',
            value: BSWG.render.images['damage_nm'].texture
        },
        extra: {
            type: 'v4',
            value: new THREE.Vector4(1, 0, 0, 0)
        },
        shadowMatrix: {
            type: 'm4',
            value: BSWG.render.shadowMatrix
        },
        shadowMap: {
            type: 't',
            value: BSWG.render.shadowMap.depthTexture
        },
        warpIn: {
            type: 'f',
            value: 0.0
        },
        vreflect: {
            type: 'f',
            value: BSWG.orbReflect
        },
        envMap: {
            type: 't',
            value: BSWG.render.envMap.texture
        },
        envMap2: {
            type: 't',
            value: BSWG.render.envMap2.texture
        },
        envMapT: {
            type: 'f',
            value: BSWG.render.envMapT
        },
        viewport: {
            type: 'v2',
            value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
        },
        envMapTint: {
            type: 'v4',
            value: BSWG.render.envMapTint
        },
        envMapParam: {
            type: 'v4',
            value: BSWG.render.envMapParam
        },
    });

    this.rotVec = new THREE.Vector3(Math.random()+.5, Math.random()+.5, Math.random());
    this.smat = BSWG.render.newMaterial("basicVertex", "shadowFragment", {});

    this.mesh = new THREE.Mesh( BSWG.orbList.geom, this.mat );
    this.smesh = new THREE.Mesh( BSWG.orbList.geom, this.smat );

    this.mesh.position.set(pos.x, pos.y, BSWG.orbZ);
    this.smesh.position.set(pos.x, pos.y, BSWG.orbZ);

    this.mesh.scale.set(BSWG.orbScale, BSWG.orbScale, BSWG.orbScale);
    this.smesh.scale.set(BSWG.orbScale, BSWG.orbScale, BSWG.orbScale);

    this.mesh.updateMatrix();
    this.smesh.updateMatrix();

    BSWG.orbList.add(this);
};

BSWG.orb.prototype.addMesh = function () {
    BSWG.render.scene.add(this.mesh);
    BSWG.render.sceneS.add(this.smesh);
};

BSWG.orb.prototype.removeMesh = function () {
    BSWG.render.scene.remove(this.mesh);
    BSWG.render.sceneS.remove(this.smesh);
};

BSWG.orb.prototype.destroy = function () {
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
    this.zone = null;
};

BSWG.orb.prototype.updateRender = function (dt) {

    var dt2 = dt;

    if (BSWG.game.lastSave) {
        dt2 *= Math.max(1, 1/(0.1 + (Date.timeStamp() - BSWG.game.lastSave) / 10.0));
    }

    this.time += dt2 * this.activeT;
    var z = Math.sin(this.time) * 1.0 + BSWG.orbZ - 0.5;

    this.mesh.position.z  = z;
    this.smesh.position.z = z;

    var q = new THREE.Quaternion();
    q.setFromAxisAngle( this.rotVec, this.time );
    q.normalize();

    this.mesh.rotation.setFromQuaternion(q);

    this.mesh.updateMatrix();
    this.smesh.updateMatrix();

    var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);
    this.mat.uniforms.envMapT.value = BSWG.render.envMapT;

    this.active = false;
    if (Math.abs(this.pos.x - BSWG.game.cam.x) < 100 && Math.abs(this.pos.y - BSWG.game.cam.y) < 100 && !BSWG.game.battleMode) {
        for (var k=0; k<8; k++) {
            var a = (this.time + Math.random() * dt) * 3.0;
            if (Math.random() < 0.5) {
                a += Math.PI;
            }
            //var a = Math.random() * Math.PI * 2.0;
            BSWG.render.boom.palette = chadaboom3D.green;
            BSWG.render.boom.add(
                new b2Vec2(this.pos.x + Math.cos(a) * BSWG.orbZoneSize, this.pos.y + Math.sin(a) * BSWG.orbZoneSize).particleWrap(z + 3.5),
                3.0 * (Math.random()*0.5 + 0.5),
                64,
                0.6,
                2.0,
                new THREE.Vector3(0, 0, 1),
                null,
                Math.random() < 0.05,
                true
            );
        }

        this.activeT += dt;
        this.activeT = Math.clamp(this.activeT, 0, 1);

        this.active = true;
    }
    else {
        this.activeT -= dt;
        this.activeT = Math.clamp(this.activeT, 0, 1);        
    }

    var t = this.activeT * (Math.sin(this.time*6.0)*0.5+0.5);
    this.mat.uniforms.clr.value.set(
        (0.3 * (1-t) + 2.0 * t) * this.activeT + 0.15 * (1 - this.activeT),
        (1.0 * (1-t) + 2.0 * t) * this.activeT + 0.15 * (1 - this.activeT),
        (0.5 * (1-t) + 2.0 * t) * this.activeT + 0.15 * (1 - this.activeT),
        1.0
    );

    this.mat.uniforms.extra.value.x = 4.0;

};

BSWG.orbList = new (function(){

    this.list = [];
    this.geom = null;

    this.add = function (orb) {
        this.remove(orb);
        this.list.push(orb);
        orb.addMesh();
        return orb;
    };

    this.atPlayer = function () {

        var zone = BSWG.game.inZone || null;

        if (zone) {
            var orb = zone.orb;
            if (orb && BSWG.game.ccblock && BSWG.game.ccblock.obj && BSWG.game.ccblock.obj.body) {
                if (Math.distVec2(orb.pos, BSWG.game.ccblock.obj.body.GetWorldCenter()) < BSWG.orbZoneSize) {
                    return orb;
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }

        return null;

    };

    this.atSafe = function () {

        var orb = this.atPlayer();
        if (orb) {
            return orb.active;
        }
        else {
            return false;
        }

    };

    this.remove = function (orb) {
        for (var i=0; i<this.list.length; i++) {
            if (this.list[i] === orb) {
                this.list.splice(i, 1);
                break;
            }
        }
        orb.removeMesh();
        return orb;
    };

    this.init = function () {
        if (!this.geom) {
            this.geom = new THREE.IcosahedronGeometry(1.0, BSWG.orbRes);
            this.geom.computeFaceNormals();
            this.geom.computeVertexNormals();
            this.geom.computeBoundingBox();
        }
        this.clear();
    };

    this.clear = function () {
        while (this.list.length) {
            this.remove(this.list[0]).destroy();
        }
    };

    this.updateRender = function (dt) {
        for (var i=0; i<this.list.length; i++) {
            this.list[i].updateRender(dt);
        }
    };

})();