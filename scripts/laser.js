// BSWR - Laser beam objects

BSWG.laserRange = 42.5;
BSWG.laserWidth = 0.35;
BSWG.laserDmg = 30; // per second

BSWG.laserList = new function () {

    this.list = [];
    this.clear = function () {
        while (this.list.length) {
            this.remove(this.list[0]);
        }
    };

    this.updateRender = function (ctx, cam, dt) {

        for (var i=0; i<this.list.length; i++) {
            this.list[i].update(dt);
        }

    };

    this.add = function (p, angle, source) {

        var ret = new Object();
        ret.p = p;
        ret.angle = angle;
        ret.source = source || null;

        ret.sound = new BSWG.soundSample();
        ret.sound.play('laser', p.THREE(0.2), 1.0, Math._random()*0.1+0.9, true);
        ret.sound2 = new BSWG.soundSample();
        ret.sound2.play('laser', p.THREE(0.2), 0.1, Math._random()*0.1+0.9, true);

        ret.mat = BSWG.render.newMaterial("basicVertex", "laserFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(1,1,1,0.5)
            },
            laser: {
                type: 'v4',
                value: new THREE.Vector4(BSWG.laserRange, BSWG.laserWidth*0.5, 0.0, 0.0)
            }
        }, THREE.AdditiveBlending, THREE.DoubleSide);

        ret.geom = new THREE.Geometry();
        ret.geom.vertices.length = 4;
        ret.geom.vertices[0] = new THREE.Vector3(-BSWG.laserWidth*0.5, 0, 0);
        ret.geom.vertices[1] = new THREE.Vector3(BSWG.laserWidth*0.5, 0, 0);
        ret.geom.vertices[2] = new THREE.Vector3(BSWG.laserWidth*0.5, BSWG.laserRange, 0);
        ret.geom.vertices[3] = new THREE.Vector3(-BSWG.laserWidth*0.5, BSWG.laserRange, 0);
        ret.geom.faces.length = 2;
        ret.geom.faces[0] = new THREE.Face3(0, 1, 2);
        ret.geom.faces[1] = new THREE.Face3(0, 2, 3);
        ret.geom.computeFaceNormals();
        ret.geom.computeBoundingSphere();

        ret.mesh = new THREE.Mesh( ret.geom, ret.mat );
        ret.mesh.updateMatrix();
        ret.mat.needsUpdate = true;
        ret.mesh.needsUpdate = true;
        ret.mesh.renderOrder = 1500.0;

        BSWG.render.scene.add(ret.mesh);

        ret.set = function(p, angle) {
            this.p = p;
            this.angle = angle;
            this.sound.position(p.THREE(0.2));
        };

        ret.destroy = function() {

            if (!this.valid) {
                return;
            }

            this.valid = false;
            BSWG.render.scene.remove(this.mesh);

            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh.geometry = null;
            this.mesh.material = null;
            this.mesh = null;
            this.mat = null;
            this.geom = null;
            this.source = null;

            this.sound.stop();
            this.sound = null;
            this.sound2.stop();
            this.sound2 = null;

        };

        ret.update = function(dt) {

            this.mesh.position.set(this.p.x, this.p.y, 0.05);
            this.mesh.rotation.set(0, 0, this.angle);
            this.mesh.updateMatrix();

            var white = Math._random();
            this.mat.uniforms.clr.value.set(white, white, 1.0, 1.0);

            var p2 = new b2Vec2(this.p.x + Math.cos(this.angle+Math.PI/2) * BSWG.laserRange, this.p.y + Math.sin(this.angle+Math.PI/2) * BSWG.laserRange);
            var ret = BSWG.componentList.withRay(this.p.THREE(0.0), p2.THREE(0.0));

            if (ret) {
                ret.comp.takeDamage(BSWG.laserDmg * dt, source, true);
                this.mat.uniforms.laser.value.x = ret.d;
                var tforce = 100.0;
                var p = new b2Vec2(ret.p.x, ret.p.y);
                BSWG.render.boom.palette = chadaboom3D.blue_bright;
                for (var i=0; i<2; i++) {
                    var a = Math._random() * Math.PI * 2.0;
                    var v = ret.comp.obj.body.GetLinearVelocityFromWorldPoint(p);
                    BSWG.render.boom.add(
                        p.particleWrap(0.0),
                        0.2*Math.pow(tforce, 0.125),
                        32,
                        0.1*Math.pow(tforce, 0.33),
                        4.0,
                        new b2Vec2(Math.cos(a)*tforce*0.005+v.x, Math.sin(a)*tforce*0.005+v.y).THREE(Math._random()*3.0)
                    );
                }
                this.sound2.position(p.THREE(0.2));
                this.sound2.volume(0.5);
            }
            else {
                this.mat.uniforms.laser.value.x = BSWG.laserRange;
                this.sound2.volume(0.0);
            }

            this.mat.needsUpdate = true;

        };

        ret.valid = true;
        ret.update(BSWG.render.dt);
        this.list.push(ret);

        return ret;

    };

    this.remove = function(obj) {

        obj.destroy();

        for (var i=0; i<this.list.length; i++) {
            if (this.list[i] === obj) {
                this.list.splice(i, 1);
                i --;
                continue;
            }
        }

    };

}();