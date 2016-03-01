BSWG.planet_SurfaceDetail = 4;
BSWG.planet_CloudDetail = 3;

BSWG.planet_TERRAN = 0;
BSWG.planet_HELL   = 1;
BSWG.planet_MARS   = 2;

BSWG.planets = new function(surfaceRes, cloudRes){

    this.planets = new Array();

    this.hasInit = false;

    this.init = function() {

        if (this.hasInit) {
            this.clear();
            return;
        }

        this.hasInit = true;

        this.cloudGeom = new THREE.IcosahedronGeometry(1.0, surfaceRes);

    };

    this.clear = function() {

    };

    this.add = function(def) {

        var defaults = {
            pos:    new THREE.Vector3(0., 0., 0.),
            rot:    Math.random() * Math.PI/120 + Math.PI/120,
            rotD:   0.0,
            rotVec: new THREE.Vector3(Math.random()+.5, Math.random()+.5, Math.random()),
            radius: 25,
            type:   BSWG.planet_TERRAN,
            seed:   Date.timeStamp()
        };

        var obj = new Object();

        def = def || {};
        for (var key in defaults) {
            obj[key] = def[key] || defaults[key];
        }

        obj.pos.z -= obj.radius * 0.75;

        var crators = false;
        var water = false;
        var smooth = 1;

        var colors;
        switch (obj.type) {
            case BSWG.planet_TERRAN:
                water = true;
                colors = [
                    new THREE.Vector4(0.04, 0.04, 0.67, 1.0),
                    new THREE.Vector4(0.03, 0.3, 0.045, 1.0),
                    new THREE.Vector4(0.3, 0.3, 0.3, 1.0),
                    new THREE.Vector4(0.5, 0.5, 0.5, 1.0)
                ];
                break;

            case BSWG.planet_HELL:
                colors = [
                    new THREE.Vector4(0.67, 0.04, 0.04, 1.0),
                    new THREE.Vector4(0.55, 0.03, 0.03, 1.0),
                    new THREE.Vector4(0.5, 0.3, 0.3, 1.0),
                    new THREE.Vector4(0.8, 0.5, 0.5, 1.0)
                ];
                break;

            case BSWG.planet_MARS:
                crators = true;
                colors = [
                    new THREE.Vector4(0.15*2.25, 0.06*2.25, 0.03*2.25, 1.0),
                    new THREE.Vector4(0.15*2.25, 0.1*2.25, 0.06*2.25, 1.0),
                    new THREE.Vector4(0.17*2.25, 0.15*2.25, 0.15*2.25, 1.0),
                    new THREE.Vector4(0.15*2.25, 0.125*2.25, 0.125*2.25, 1.0)
                ];
                break;

            default:
                break;
        }

        obj.mat = BSWG.render.newMaterial("planetVertex", "planetFragment", {
            light: {
                type: 'v4',
                value: new THREE.Vector4(BSWG.game.cam.x, BSWG.game.cam.y, 20.0, 1.0)
            },
            cam: {
                type: 'v3',
                value: new THREE.Vector3(0, 0, 0)
            },
            vp: {
                type: 'v2',
                value: new THREE.Vector2(0, 0)
            },
            map: {
                type: 't',
                value: BSWG.render.images['grass_nm'].texture
            },
            mapW: {
                type: 't',
                value: BSWG.render.images['water_nm'].texture
            },
            extra: {
                type: 'v4',
                value: new THREE.Vector4(crators?1:0, water?1:0, 0, 0.0)
            },
            clr1: {
                type: 'v4',
                value: colors[0]
            },
            clr2: {
                type: 'v4',
                value: colors[1]
            },
            clr3: {
                type: 'v4',
                value: colors[2]
            },
            clr4: {
                type: 'v4',
                value: colors[3]
            }
        });

        obj.rotVec.normalize();

        obj.geom = new THREE.IcosahedronGeometry(0.9, surfaceRes);
        Math.seedrandom(obj.seed);
        var rand = new Math.random3dSlow();
        for (var i=0; i<obj.geom.vertices.length; i++) {
            var n = obj.geom.vertices[i];
            var x = n.x*2;
            var y = n.y*2;
            var z = n.z*2;
            var pval = 0;
            var pv = -1;
            var sz = 1.0;
            for (var k=0; k<10; k++) {
                var fx = x*sz, fy = y*sz, fz = z*sz;
                var ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
                var dx = (fx-ix)*2-1, dy = (fy-iy)*2-1, dz = (fz-iz)*2-1;
                var d = dx*dx+dy*dy+dz*dz;
                if (d>1) {
                    if (dx > 0.5) { ix ++; }
                    else if (dx < -0.5) { ix--; }
                    if (dy > 0.5) { iy ++; }
                    else if (dy < -0.5) { iy--; }
                    if (dz > 0.5) { iz ++; }
                    else if (dz < -0.5) { iz--; }
                }
                pval += rand.get(ix, iy, iz) * Math.pow(2, pv);
                sz *= 1.25
                pv -= 0.5;
            }

            pval -= 0.25;
            if (pval < 0.1) {
                pval = 0.1;
            }

            if (pval < 0.75 && (!crators || pval > 0.15)) pval = 0.5;
            else if (pval < 1.1 && (!crators || pval > 0.9)) pval = 0.7;
            if (!crators) {
                pval = Math.pow(pval-0.5, 1.25)*2.0 + 0.5;
            }
            else {
                pval = Math.pow(pval, 1.25);
            }
            var h = 0.9 + pval * 0.2;
            n.x *= h;
            n.y *= h;
            n.z *= h;
        }
        for (var k=0; k<smooth; k++) {
            for (var i=0; i<obj.geom.faces.length; i++) {
                var f = obj.geom.faces[i];
                var v = obj.geom.vertices;
                v[f.a].set(
                    (v[f.a].x*7/8 + v[f.b].x/16 + v[f.c].x/16),
                    (v[f.a].y*7/8 + v[f.b].y/16 + v[f.c].y/16),
                    (v[f.a].z*7/8 + v[f.b].z/16 + v[f.c].z/16)
                );
            }
        }
        rand.dispose();
        obj.geom.computeFaceNormals();
        obj.geom.computeVertexNormals();
        obj.geom.computeBoundingSphere();

        obj.mesh = new THREE.Mesh( obj.geom, obj.mat );
        obj.mesh.scale.set(obj.radius, obj.radius, obj.radius);
        obj.mesh.updateMatrix();

        obj.mat.needsUpdate = true;
        obj.mesh.needsUpdate = true;

        var self = obj;

        var time = 0.0;

        obj.update = function(dt) {

            time += dt;

            var matrix = self.mesh.matrix;

            self.rotD += self.rot * dt;
            var q = new THREE.Quaternion();
            q.setFromAxisAngle( self.rotVec, self.rotD );
            q.normalize();

            self.mesh.position.set(self.pos.x, self.pos.y, self.pos.z);
            self.mesh.rotation.setFromQuaternion(q);
            self.mesh.updateMatrix();

            self.mat.uniforms.light.value.x = self.pos.x + self.radius*8.0;
            self.mat.uniforms.light.value.y = self.pos.y - self.radius*1.5;
            self.mat.uniforms.light.value.z = self.pos.z + self.radius*4.0;

            self.mat.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z);
            self.mat.uniforms.vp.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);

            self.mat.uniforms.extra.value.w = time;

            self.mat.needsUpdate = true;
        };

        obj.destroy = function() {

            BSWG.render.scene.remove( self.mesh );

        };

        obj.update(1.0/60.0);

        BSWG.render.scene.add( obj.mesh );

        this.planets.push(obj);

    };

    this.render = function(dt) {

        for (var i=0; i<this.planets.length; i++) {
            var PL = this.planets[i];
            PL.update(dt);
        }

    };

}(BSWG.planet_SurfaceDetail, BSWG.planet_CloudDetail);