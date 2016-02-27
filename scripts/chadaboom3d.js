window.chadaboom3D = function(batches, onLoad) {

    var self = this;
    this.bwidth  = 9;
    this.bheight = 5;
    this.nframes = this.bwidth * this.bheight;

    var toLoad = 0;
    for (var i=0; i<batches.length; i++) {
        var b = batches[i];
        toLoad += b.count;
    }

    for (var i=0; i<batches.length; i++) {
        var b = batches[i];
        b.img = [];

        for (var j=0; j<b.count; j++) {
            var img = new Image();
            img.src = b.name + '-' + b.size + '-' + j + '.png';
            img.onload = function() {
                toLoad -= 1;
                if (toLoad === 0) {

                    for (var k=0; k<batches.length; k++) {
                        var bk = batches[k];
                        for (var k2=0; k2<bk.img.length; k2++) {
                            // Prepare animation sheet as texture for use in shader
                            var timg = bk.img[k2];
                            var isz = bk.size;
                            var osz = Math.min(isz, 256); // currently downscales if frames are larger than 256x256
                            var width = osz * 8,
                                height = osz * 8;

                            bk.img[k2] = BSWG.render.proceduralImage(width, height, function(ctx, w, h){

                                ctx.fillStyle = '#000';
                                ctx.fillRect(0, 0, w, h);

                                for (var k3=0; k3<self.nframes; k3++) {
                                    ctx.drawImage(
                                        timg,
                                        (k3%self.bwidth) * isz, Math.floor(k3/self.bwidth) * isz,
                                        isz, isz,
                                        (k3%8) * osz, Math.floor(k3/8) * osz,
                                        osz, osz
                                    );
                                }

                            });

                        }
                    }

                    if (onLoad)
                        onLoad();
                }
            };
            b.img.push(img);
        }

        b.i = i;
    }

    this.batches = batches;
    this.list = [];
    this.geom = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

};

chadaboom3D.prototype.render = function(dt) {

    for (var i=0; i<this.list.length; i++) {
        var B = this.list[i];
        B.t -= dt;
        if (B.t <= 0.0) {
            B.eraseMesh();
            this.list.splice(i, 1);
            i --;
            continue;
        }

        var p = B.p(B.vel.x*0, B.vel.y*0, B.vel.z*0);
        B.vel.x *= 0.995;
        B.vel.y *= 0.995;
        B.vel.z *= 0.995;
        var sz = B.sz(B.res);

        var t = Math.pow(1.0-(B.t / B.maxt), 1.0/B.attack);
        sz *= Math.pow(t, 0.25);
        var frame = Math.floor(t * this.nframes);

        B.mesh.position.set(p.x, p.y, p.z);
        B.mesh.rotation.set(0.0, 0.0, B.rot, 'ZXY');
        B.mesh.scale.set(sz, sz, 1.0);
        B.mesh.updateMatrix();
        B.material.uniforms.frame.value.set((frame%8)/8.0, 1.0 - ~~(frame/8)/8.0, 1.0-Math.pow(t, 3.0));
        B.material.needsUpdate = true;

        p = B.p(B.vel.x*dt, B.vel.y*dt, B.vel.z*dt);
    }

};

chadaboom3D.fire = [
    [ 0.25, 0.25, 0.25, 0.25 ],
    [ 1.0,   0.0,  0.0, 0.50 ],
    [ 1.0,   1.0,  0.0, 0.75 ],
    [ 1.0,   1.0,  1.0,  1.0 ]
];

chadaboom3D.blue = [
    [ 0.25, 0.25, 0.25, 1/3 ],
    [ 0.0,   0.0,  1.0, 2/3 ],
    [ 1.0,   1.0,  1.0,  1.0 ],
    [ 1.0,   1.0,  1.0,  1.0 ]
];

chadaboom3D.green = [
    [ 0.25, 0.25, 0.25, 1/3 ],
    [ 0.0,   1.0,  0.0, 2/3 ],
    [ 1.0,   1.0,  1.0,  1.0 ],
    [ 1.0,   1.0,  1.0,  1.0 ]
];

chadaboom3D.prototype.add = function(posFn, sizeFn, res, life, attack, vel) {

    res = res || 256;
    if (res < 0) {
        res = 0;
    }
    life = life || 2.0;
    attack = attack || 2.0;
    if (attack <= 0) {
        attack = 0;
    }

    if (!vel) {
        vel = { x:0, y:0, z:0 };
    }

    var bb = null;
    for (var i=0; i<this.batches.length; i++) {
        var d0 = bb ? Math.abs(res-bb.size) : 100000;
        var d1 = Math.abs(res-this.batches[i].size);
        if (bb && res < bb.size) {
            d0 = Math.pow(d0, 0.75);
        }
        if (res < this.batches[i].size) {
            d1 = Math.pow(d1, 0.75);
        }
        if (!bb || d0 > d1) {
            bb = this.batches[i];
        }
    }

    if (!bb) {
        return false;
    }

    if (typeof posFn === "object") {
        var posObj = posFn;
        posFn = function() {
            return posObj;
        };
    }

    if (typeof sizeFn === "number") {
        var sizeVal = sizeFn;
        sizeFn = function(res) {
            return sizeVal;
        };
    }

    var palette = this.palette || chadaboom3D.fire;

    var mat = BSWG.render.newMaterial("expVertex", "expFragment", {
        pal1: {
            type: 'v4',
            value: new THREE.Vector4(palette[0][0], palette[0][1], palette[0][2], palette[0][3])
        },
        pal2: {
            type: 'v4',
            value: new THREE.Vector4(palette[1][0], palette[1][1], palette[1][2], palette[1][3])
        },
        pal3: {
            type: 'v4',
            value: new THREE.Vector4(palette[2][0], palette[2][1], palette[2][2], palette[2][3])
        },
        pal4: {
            type: 'v4',
            value: new THREE.Vector4(palette[3][0], palette[3][1], palette[3][2], palette[3][3])
        },
        img: {
            type: 't',
            value: bb.img[Math.floor(Math.random()*1000000) % bb.count].texture
        },
        frame: {
            type: 'v3',
            value: new THREE.Vector3(0, 0, 0)
        }
    }, THREE.AdditiveBlending);

    var mesh = new THREE.Mesh( this.geom, mat );
    mesh.needsUpdate = true;
    mat.needsUpdate = true;
    BSWG.render.scene.add( mesh );

    this.list.push({

        p: posFn,
        sz: sizeFn,
        vel: vel,
        res: res,
        bbi: bb.i,
        t: life,
        maxt: life,
        rot: Math.random() * Math.PI * 2.0,
        attack: attack,
        mesh: mesh,
        material: mat,
        eraseMesh: function () {
            if (!mesh) {
                return;
            }
            BSWG.render.scene.remove(mesh);
            mesh.material.dispose();
            mesh.geometry = null;
            mesh.material = null;
            mesh = null;
        }

    });

    return true;

};

chadaboom3D.prototype.clear = function() {

    for (var i=0; i<this.list.length; i++) {
        this.list[i].eraseMesh();
    }
    this.list.length = 0;

};