BSWG.maxClouds = 25;

BSWG.generateCloudGeom = function (size) {
    
    var w = size, h = size;

    var C = [
        { x: w/2, y: h/2, z: size/2, r: size/5.5 },
    ];

    var R = C[0].r;
    for (var k=0; k<12; k++) {
        R *= 0.92;
        var k2 = 1000;
        while (k2--) {
            var c2 = {
                x: Math.random() * w, y: Math.random() * h, z: Math.random() * size, r: R
            };
            if ((c2.x - c2.r <= 0) || (c2.y - c2.r <= 0) || (c2.z - c2.r <= 0) ||
                (c2.x + c2.r >= w) || (c2.y + c2.r >= h) || (c2.z + c2.r >= size)) {
                continue;
            }
            var valid = true;
            var anyClose = false;
            for (var i=0; i<C.length; i++) {
                var c = C[i];
                var d = Math.sqrt(
                    (c2.x-c.x) * (c2.x-c.x) + 
                    (c2.y-c.y) * (c2.y-c.y) + 
                    (c2.z-c.z) * (c2.z-c.z)
                );
                var a = false;
                if (d < (c2.r+c.r)*0.6) {
                    valid = false;
                    break;
                }
                else if (d < (c2.r+c.r)*0.8) {
                    anyClose = true;
                }
            }
            if (valid && anyClose) {
                C.push(c2);
                break;
            }
        }
    }

    var geom = [];

    for (var i=0; i<C.length; i++) {
        var sz = Math.floor(Math.max(Math.round(C[i].r*12), 5))*3.5;
        var cloud = new THREE.PlaneGeometry(C[i].r*5, C[i].r*5, 1, 1)
        var matrix = new THREE.Matrix4();
        matrix.makeTranslation(C[i].x - size/2, C[i].y - size/2, 0.0).multiply(new THREE.Matrix4().makeRotationZ(0.0));
        cloud.applyMatrix(matrix);
        cloud.computeFaceNormals();
        cloud.computeVertexNormals();
        cloud.normalsNeedUpdate = true;
        cloud.needsUpdate = true;
        cloud.__Z = 0.0;
        geom.push(cloud);
    }

    return geom;

};

BSWG.cloud = function (pos, toPos, size, life) {

    this.p = pos.clone();
    this.toP = toPos.clone();
    this.size = size || 1.0;
    this.life = life || 10.0;
    this.exSpeed = 0.0;

    var geom = BSWG.cloudMap.geom[~~(Math.random()*0.999*BSWG.cloudMap.geom.length)];

    this.mesh = new THREE.Group();
    this.smesh = new THREE.Group();

    var matIndex = ~~(Math.random()*0.999*BSWG.cloudMap.matList.length);

    for (var i=0; i<geom.length; i++) {
        var mesh = new THREE.Mesh(
            geom[i],
            BSWG.cloudMap.matList[matIndex]
        );
        mesh.renderOrder = 1200 + ((geom[i].__Z || 0.0) + this.p.z) / 64.0;
        this.mesh.add(mesh);
        this.smesh.add(new THREE.Mesh(
            geom[i],
            BSWG.cloudMap.shadowMatList[matIndex]
        ));
    }

    var a = Math.random() * Math.PI * 2;

    this.mesh.position.set(this.p.x, this.p.y, this.p.z);
    this.mesh.scale.set(size*1.2, size*1.2, size/8);
    this.mesh.rotation.set(0, 0, a, 'ZXY');
    this.smesh.position.set(this.p.x, this.p.y, this.p.z);
    this.smesh.scale.set(size*1.2, size*1.2, size/8);
    this.smesh.rotation.set(0, 0, a, 'ZXY');

    BSWG.render.scene.add(this.mesh);
    //BSWG.render.sceneS.add(this.smesh);

    BSWG.cloudMap.add(this);

};

BSWG.cloud.prototype.destroy = function () {

    BSWG.render.scene.remove(this.mesh);
    //BSWG.render.sceneS.remove(this.smesh);

    this.mesh.material = null;
    this.mesh.geometry = null;
    this.smesh.material = null;
    this.smesh.geometry = null;

    this.mesh = this.smesh = this.p = null;
};

BSWG.cloudMap = new function (){

    this.list = [];

    this.init = function () {

        var a = Math.random() * Math.PI * 2;
        this.windDir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.0);

        if (!this.geom) {
            Math.seedrandom(666.666);

            this.geom = [
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.4),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.4),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.4),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.4),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.45),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.45),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.45),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.5),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.5),
                BSWG.generateCloudGeom(BSWG.tileHeightWorld/3*0.5)
            ];

            Math.seedrandom();

            this.matList = [];
            this.shadowMatList = [];

            for (var i=0; i<5; i++) {
                this.matList.push(
                    BSWG.render.newMaterial("basicVertex2", "cloudFragment", {
                        clr: {
                            type: 'v4',
                            value: BSWG.render.cloudColor
                        },
                        shadowMap: {
                            type: 't',
                            value: BSWG.render.shadowMap.depthTexture
                        },
                        shadowMatrix: {
                            type: 'm4',
                            value: BSWG.render.shadowMatrix
                        },
                        envMapTint: {
                            type: 'v4',
                            value: BSWG.render.envMapTint
                        },
                        envMapParam: {
                            type: 'v4',
                            value: BSWG.render.envMapParam
                        },
                        texture: {
                            type: 't',
                            value: BSWG.render.images['cloud-' + i].texture
                        },
                    })
                );
                this.shadowMatList.push(
                    BSWG.render.newMaterial("basicVertex", "cloudShadowFragment", {
                        texture: {
                            type: 't',
                            value: BSWG.render.images['cloud-' + i].texture
                        },                        
                    })
                )
            }
            for (var i=0; i<this.matList.length; i++) {
                //this.matList[i].side = THREE.DoubleSide;
                this.matList[i].needsUpdate = true;
                this.shadowMatList[i].needsUpdate = true;
            }

            this.mat = new THREE.MeshFaceMaterial(this.matList);
            Math.seedrandom();
        }

        while (this.list.length) {
            this.remove(this.list[0]);
        }

    };

    this.add = function(cloud) {

        this.list.push(cloud);

    };

    this.remove = function(cloud) {
        
        var idx = this.list.indexOf(cloud);
        if (idx >= 0) {
            this.list.splice(idx, 1);
        }
        cloud.destroy();

    };

    this.noClouds = false;
    this.cloudZOffset = 0.0;

    this.updateRender = function(dt) {

        for (var i=0; i<this.list.length; i++) {

            var C = this.list[i];
            C.toP.x += this.windDir.x * dt;
            C.toP.y += this.windDir.y * dt;
            C.p.x += (C.toP.x - C.p.x) * dt * 0.2;
            C.p.y += (C.toP.y - C.p.y) * dt * 0.2;
            C.mesh.position.set(C.p.x, C.p.y, C.p.z + this.cloudZOffset);
            C.smesh.position.set(C.p.x, C.p.y, C.p.z + this.cloudZOffset);
            C.mesh.updateMatrix();
            C.smesh.updateMatrix();
            var dx = C.p.x - BSWG.render.cam3D.position.x,
                dy = C.p.y - BSWG.render.cam3D.position.y;
            var dist = Math.sqrt(dx*dx+dy*dy);

            if (dist > 170) {
                this.remove(C);
                C = null;
                i --;
                continue;
            }

        }

        var count = Math.min(Math.floor(Math.max(BSWG.render.weather.density, BSWG.render.envMapTint.w) * 400), BSWG.maxClouds);
        if (this.noClouds) {
            count = 0;
        }

        while (this.list.length < count) {
            var p = BSWG.render.cam3D.position.clone();
            p.z = -9 - Math.random() * 6;
            var a = Math.random() * Math.PI * 2.0;
            p.x += Math.cos(a) * 160;
            p.y += Math.sin(a) * 160;
            var sz = Math.random() * 10 + 5;
            var toP = BSWG.render.cam3D.position.clone();
            toP.z = p.z;
            var r = Math.random() * 70 + 25;
            toP.x += Math.cos(a) * r;
            toP.y += Math.sin(a) * r;
            var no = false;
            for (var i=0; i<this.list.length; i++) {
                var dx = this.list[i].toP.x - toP.x;
                var dy = this.list[i].toP.y - toP.y;
                var len = Math.sqrt(dx*dx+dy*dy);
                if (len < 10) {
                    no = true;
                    break;
                }
            }
            if (!no) {
                new BSWG.cloud(
                    p,
                    toP,
                    sz
                );
            }
        }

        for (var i=0; i<(this.list.length-count); i++) {
            this.list[i].exSpeed += dt * 25;
            if (this.list[i].exSpeed > 50) {
                this.list[i].exSpeed = 50;
            }
        }
        for (var i=Math.max(this.list.length-count, 0); i<this.list.length; i++) {
            this.list[i].exSpeed -= dt * 25;
            if (this.list[i].exSpeed < 0) {
                this.list[i].exSpeed = 0;
            }
        }
        for (var i=0; i<this.list.length; i++) {
            var dx = this.list[i].p.x - BSWG.render.cam3D.position.x;
            var dy = this.list[i].p.y - BSWG.render.cam3D.position.y;
            var len = Math.sqrt(dx*dx+dy*dy);
            if (this.list[i].exSpeed > 0) {
                this.list[i].toP.x = this.list[i].p.x + dx / len * this.list[i].exSpeed;
                this.list[i].toP.y = this.list[i].p.y + dy / len * this.list[i].exSpeed;            
            }
        }

    };

}();