BSWG.planet_OwnRange = 30.0;

BSWG.planet_SurfaceDetail = 5;
BSWG.planet_CloudDetail = 3;

BSWG.planet_TERRAN = 0;
BSWG.planet_HELL   = 1;
BSWG.planet_MARS   = 2;
BSWG.planet_MOON   = 3;
BSWG.planet_DESERT = 4;
BSWG.planet_ICE    = 5;

BSWG.planet_COUNT  = 6;

BSWG.planets = new function(surfaceRes, cloudRes){

    this.planets = new Array();

    this.hasInit = false;

    this.init = function() {

        if (this.hasInit) {
            this.clear();
            return;
        }

        this.baseGeom = new THREE.IcosahedronGeometry(0.9, surfaceRes);

        this.hasInit = true;

    };

    this.clear = function() {

        while (this.planets.length) {
            this.planets[0].destroy();
        }

    };

    this.add = function(def) {

        var defaults = {
            pos:       new THREE.Vector3(0., 0., 0.),
            rot:       Math.random() * Math.PI/120 + Math.PI/120,
            rotD:      Math.random()*Math.PI,
            rotVec:    new THREE.Vector3(Math.random()+.5, Math.random()+.5, Math.random()),
            radius:    -1,
            type:      -1,
            seed:      Date.timeStamp(),
            ringScale: -1,
            captured:  false
        };

        var obj = new Object();

        def = def || {};
        for (var key in defaults) {
            obj[key] = def[key] || defaults[key];
            if (def[key] === 0) {
                obj[key] = def[key];
            }
            if (key === 'pos' || key === 'rotVec') {
                obj[key] = new THREE.Vector3(obj[key].x, obj[key].y, obj[key].z);
            }
        }

        Math.seedrandom(obj.seed+2);

        if (obj.type === -1) {
            if (Math.random() < 0.125) {
                obj.type = BSWG.planet_TERRAN;
            }
            else {
                obj.type = Math.floor(Math.random() * BSWG.planet_COUNT);
            }
        }

        var crators = false;
        var water = false;
        var hasRing = Math.random() < 0.5 ? true : false;
        var smooth = 4;
        var waterAnim = true;
        var waterScale = 1.0;

        var colors, colors2;
        switch (obj.type) {
            case BSWG.planet_TERRAN:
                water = true;
                var grassy = Math.random() < 0.75;
                colors = [
                    new THREE.Vector4(0.06, 0.32, 0.67, 1.0),
                    new THREE.Vector4(0.03, 0.3, 0.045, 1.0),
                    grassy ? new THREE.Vector4(0.02, 0.2, 0.035, 1.0) : new THREE.Vector4(0.3, 0.3, 0.3, 1.0),
                    new THREE.Vector4(0.5, 0.5, 0.5, 1.0)
                ];
                colors2 = [
                    new THREE.Vector4(0.06, 0.75, 0.67, 1.0),
                    new THREE.Vector4(0.5, 0.25, 0.045, 1.0),
                    grassy ? new THREE.Vector4(0.4, 0.15, 0.035, 1.0) : new THREE.Vector4(0.3, 0.3, 0.3, 1.0),
                    new THREE.Vector4(0.5, 0.5, 0.5, 1.0)
                ];
                if (obj.radius === -1) {
                    obj.radius = 25 + 5 * Math.random();
                }
                break;

            case BSWG.planet_HELL:
                water = true;
                colors = [
                    new THREE.Vector4(0.7, 0.04, 0.04, 1.0),
                    new THREE.Vector4(0.55, 0.13, 0.13, 1.0),
                    new THREE.Vector4(0.5, 0.3, 0.3, 1.0),
                    new THREE.Vector4(0.8, 0.5, 0.5, 1.0)
                ];
                colors2 = [
                    new THREE.Vector4(0.04, 0.04, 0.04, 1.0),
                    new THREE.Vector4(0.55, 0.13, 0.13, 1.0),
                    new THREE.Vector4(0.5, 0.3, 0.3, 1.0),
                    new THREE.Vector4(0.8, 0.5, 0.5, 1.0)
                ];
                if (obj.radius === -1) {
                    obj.radius = 35 + 10 * Math.random();
                }
                waterScale = 0.75;
                break;

            case BSWG.planet_MARS:
                crators = true;
                colors = [
                    new THREE.Vector4(0.15*2.25, 0.06*2.25, 0.03*2.25, 1.0),
                    new THREE.Vector4(0.15*2.25, 0.1*2.25, 0.06*2.25, 1.0),
                    new THREE.Vector4(0.17*2.25, 0.15*2.25, 0.15*2.25, 1.0),
                    new THREE.Vector4(0.15*2.25, 0.125*2.25, 0.125*2.25, 1.0)
                ];
                colors2 = [
                    new THREE.Vector4(0, 0, 0, 1.0),
                    new THREE.Vector4(0.35*2.25, 0.1*2.25, 0.06*2.25, 1.0),
                    new THREE.Vector4(0.17*2.25, 0.15*2.25, 0.15*2.25, 1.0),
                    new THREE.Vector4(0.15*2.25, 0.125*2.25, 0.125*2.25, 1.0)
                ];
                if (obj.radius === -1) {
                    obj.radius = 17.5 + 5 * Math.random();
                }
                water = Math.random() < 0.25;
                crators = !water;
                break;

            case BSWG.planet_MOON:
                crators = true;
                colors = [
                    new THREE.Vector4(0.11*2.25, 0.11*2.25, 0.11*2.25, 1.0),
                    new THREE.Vector4(0.15*2.25, 0.15*2.25, 0.15*2.25, 1.0),
                    new THREE.Vector4(0.31*2.25, 0.31*2.25, 0.31*2.25, 1.0),
                    new THREE.Vector4(0.35*2.25, 0.35*2.25, 0.35*2.25, 1.0)
                ];
                hasRing = false;
                if (obj.radius === -1) {
                    obj.radius = 15 + 5 * Math.random();
                }
                break;

            case BSWG.planet_DESERT:
                water = true;
                colors = [
                    new THREE.Vector4(0.25*2.25, 0.25*2.25, 0.15*2.25, 1.0),
                    new THREE.Vector4(0.20*2.25, 0.20*2.25, 0.17*2.25, 1.0),
                    new THREE.Vector4(0.17*2.25, 0.17*2.25, 0.17*2.25, 1.0),
                    new THREE.Vector4(0.20*2.25, 0.20*2.25, 0.20*2.25, 1.0)
                ];
                colors2 = [
                    new THREE.Vector4(0.75*2.25, 0.25*2.25, 0.15*2.25, 1.0),
                    new THREE.Vector4(0.20*2.25, 0.20*2.25, 0.17*2.25, 1.0),
                    new THREE.Vector4(0.17*2.25, 0.17*2.25, 0.17*2.25, 1.0),
                    new THREE.Vector4(0.20*2.25, 0.20*2.25, 0.20*2.25, 1.0)
                ];
                waterAnim = false;
                if (obj.radius === -1) {
                    obj.radius = 25 + 5 * Math.random();
                }
                waterScale = 0.35;
                break;

            case BSWG.planet_ICE:
                water = true;
                colors = [
                    new THREE.Vector4(0.2, 0.8, 1.0, 1.0),
                    new THREE.Vector4(0.6, 0.8, 1.0, 1.0),
                    new THREE.Vector4(0.4, 0.6, 1.0, 1.0),
                    new THREE.Vector4(0.2, 0.4, 1.0, 1.0),
                ];
                colors2 = [
                    new THREE.Vector4(0.4, 0.8, 1.0, 1.0),
                    new THREE.Vector4(0.6, 0.8, 1.0, 1.0),
                    new THREE.Vector4(0.4, 0.6, 1.0, 1.0),
                    new THREE.Vector4(0.2, 0.4, 1.0, 1.0),
                ];
                waterAnim = false;
                if (obj.radius === -1) {
                    obj.radius = 25 + 5 * Math.random();
                }
                waterScale = 0.25;
                water = Math.random() > 0.25;
                crators = !water;
                break;

            default:
                break;
        }

        obj.radius *= 1.35;
        obj.pos.z -= 45 * 2.5;

        if (colors2) {
            Math.seedrandom(obj.seed+1);
            for (var i=0; i<4; i++) {
                var t = Math.random();
                colors[i].set(
                    colors[i].x * t + colors2[i].x * (1-t),
                    colors[i].y * t + colors2[i].y * (1-t),
                    colors[i].z * t + colors2[i].z * (1-t),
                    colors[i].w * t + colors2[i].w * (1-t)
                );
            }
        }

        if (obj.ringScale === -1) {
            obj.ringScale = 1.0 + Math.random() * 0.45;
        }

        var ringcolors = new Array(4);
        for (var i=0; i<4; i++) {
            var C = colors[i];
            var l = Math.sqrt(C.x*C.x+C.y*C.y+C.z*C.z);
            ringcolors[i] = new THREE.Vector4((C.x/l)*0.4+0.6, (C.y/l)*0.4+0.6, (C.z/l)*0.4+0.6, 1.0);
        }
        ringcolors[3].set(1,1,1,1);

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
                value: new THREE.Vector4(crators?1:0, water?1:0, waterScale, 0.0)
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

        obj.geom = this.baseGeom.clone();
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
        Math.seedrandom();
        obj.geom.mergeVertices();
        obj.geom.computeFaceNormals();
        obj.geom.computeVertexNormals();
        obj.geom.computeBoundingSphere();

        obj.mesh = new THREE.Mesh( obj.geom, obj.mat );
        obj.mesh.scale.set(obj.radius, obj.radius, obj.radius);
        obj.mesh.updateMatrix();

        obj.mat.needsUpdate = true;
        obj.mesh.needsUpdate = true;

        if (hasRing) {
            Math.seedrandom(obj.seed);
            var ringThickness = Math.random();
            obj.ringtex = BSWG.render.proceduralImage(64, 64, function(ctx, w, h){

                var comp = function(v) {
                    return Math.floor(v*255);
                };

                ctx.clearRect(0, 0, w, h);
                for (var i=0; i<h; i++) {
                    var j = Math.floor(Math.random() * (ringcolors.length+6*(1.0-ringThickness)));
                    if (j<ringcolors.length) {
                        ctx.strokeStyle = 'rgba(' + comp(ringcolors[j].x) + ',' + comp(ringcolors[j].y) + ',' + comp(ringcolors[j].z) + ', 1.0)';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(0, i);
                        ctx.lineTo(w-1, i);
                        ctx.stroke();
                    }
                }

            })

            Math.seedrandom();
            obj.matr = BSWG.render.newMaterial("planetVertex", "planetRingFragment", {
                light: {
                    type: 'v4',
                    value: new THREE.Vector4(BSWG.game.cam.x, BSWG.game.cam.y, 20.0, 1.0)
                },
                tex: {
                    type: 't',
                    value: obj.ringtex.texture
                },
                planet: {
                    type: 'v4',
                    value: new THREE.Vector4(0, 0, 0, 0)
                },
                cam: {
                    type: 'v3',
                    value: new THREE.Vector3(0, 0, 0)
                },
                vp: {
                    type: 'v2',
                    value: new THREE.Vector2(0, 0)
                }
            }, THREE.NormalBlending, THREE.DoubleSide);

            var count = 4;
            obj.geomr = new THREE.Geometry();
            obj.geomr.vertices.length = count + 1;
            obj.geomr.vertices[0] = new THREE.Vector3(0, 0, 0);
            for (var i=0; i<count; i++) {
                var a = (i/count) * Math.PI * 2.0;
                obj.geomr.vertices[i+1] = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.0);
            }
            obj.geomr.faces.length = count;
            for (var i=0; i<count; i++) {
                obj.geomr.faces[i] = new THREE.Face3(1+i, 1+((i+1)%count), 0);
            }

            obj.geomr.computeFaceNormals();
            //obj.geomr.computeVertexNormals();
            obj.geomr.computeBoundingSphere();

            obj.meshr = new THREE.Mesh( obj.geomr, obj.matr );
            obj.meshr.scale.set(obj.radius*2.5*obj.ringScale, obj.radius*2.5*obj.ringScale, obj.radius*2.5*obj.ringScale);
            obj.meshr.updateMatrix();

            obj.matr.needsUpdate = true;
            obj.meshr.needsUpdate = true;
        }

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

            self.mat.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z/1.02);
            self.mat.uniforms.vp.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);

            if (waterAnim) {
                self.mat.uniforms.extra.value.w = time;
            }

            self.mat.needsUpdate = true;

            if (self.meshr) {
                self.meshr.position.set(self.pos.x, self.pos.y, self.pos.z);
                self.meshr.rotation.setFromQuaternion(q);
                self.meshr.updateMatrix();

                self.matr.uniforms.light.value.x = self.pos.x + self.radius*8.0;
                self.matr.uniforms.light.value.y = self.pos.y - self.radius*1.5;
                self.matr.uniforms.light.value.z = self.pos.z + self.radius*4.0;

                self.matr.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z/1.02);
                self.matr.uniforms.vp.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);
                self.matr.uniforms.planet.value.set(self.pos.x, self.pos.y, self.pos.z, self.radius * 0.8);

                self.matr.needsUpdate = true;
            }

            if (self.meshc) {
                self.matc.uniforms.clr.value.w += (0.3 - self.matc.uniforms.clr.value.w) * (dt/4.0);
                self.matc.needsUpdate = true;
                self.meshc.position.set(self.pos.x, self.pos.y, 0.0);
                self.meshc.updateMatrix();
            }
        };

        obj.capture = function(instant) {

            if (this.meshc) {
                return;
            }

            this.captured = true;

            this.matc = BSWG.render.newMaterial("pRangeVertex", "pRangeFragment", {
                clr: {
                    type: 'v4',
                    value: new THREE.Vector4(0.3, 1.0, 0.3, instant ? 0.3 : 0.0)
                }
            }, THREE.NormalBlending, THREE.DoubleSide);

            var count = 64;
            this.geomc = new THREE.Geometry();
            this.geomc.vertices.length = count + 1;
            this.geomc.vertices[0] = new THREE.Vector3(0, 0, -200);
            for (var i=0; i<count; i++) {
                var a = (i/count) * Math.PI * 2.0;
                obj.geomc.vertices[i+1] = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.0);
            }
            this.geomc.faces.length = count;
            for (var i=0; i<count; i++) {
                this.geomc.faces[i] = new THREE.Face3(1+i, 1+((i+1)%count), 0);
            }

            this.geomc.computeFaceNormals();
            //obj.geomc.computeVertexNormals();
            this.geomc.computeBoundingBox();

            this.meshc = new THREE.Mesh( this.geomc, this.matc );
            this.meshc.scale.set(BSWG.planet_OwnRange, BSWG.planet_OwnRange, 1.0);
            this.meshc.updateMatrix();

            this.matc.needsUpdate = true;
            this.meshc.needsUpdate = true;

            BSWG.render.scene.add( obj.meshc );
        }

        obj.destroy = function() {

            BSWG.render.scene.remove( self.mesh );
            if (self.meshr) {
                BSWG.render.scene.remove( self.meshr );
            }
            if (self.meshc) {
                BSWG.render.scene.remove( self.meshc );
            }

            self.mesh.geometry.dispose();
            self.mesh.material.dispose();
            self.mesh.geometry = null;
            self.mesh.material = null;
            self.mesh = null;
            self.mat = null;
            self.geom = null;

            if (self.meshr) {
                self.meshr.geometry.dispose();
                self.meshr.material.dispose();
                self.meshr.geometry = null;
                self.meshr.material = null;
                self.meshr = null;
                self.matr = null;
                self.geomr = null;
            }

            if (self.meshc) {
                self.meshc.geometry.dispose();
                self.meshc.material.dispose();
                self.meshc.geometry = null;
                self.meshc.material = null;
                self.meshc = null;
                self.matc = null;
                self.geomc = null;
            }

            var pl = BSWG.planets.planets;
            for (var i=0; i<pl.length; i++) {
                if (pl[i] === self) {
                    pl.splice(i, 1);
                    break;
                }
            }

        };

        obj.serialize = function() {
            var ret = {};
            for (var key in defaults) {
                var value = obj[key];
                if (key === 'pos' || key === 'rotVec') {
                    ret[key] = { x: value.x, y: value.y, z: value.z };
                }
                else {
                    ret[key] = value;
                }
            }
            return ret;
        };

        obj.update(BSWG.render.dt);

        BSWG.render.scene.add( obj.mesh );
        if (obj.meshr) {
            BSWG.render.scene.add( obj.meshr );
        }

        this.planets.push(obj);

        if (obj.captured) {
            obj.capture(true);
        }

        return obj;

    };

    this.render = function(dt) {

        for (var i=0; i<this.planets.length; i++) {
            var PL = this.planets[i];
            PL.update(dt);
        }

    };

    this.inzone = function(p) {

        for (var i=0; i<this.planets.length; i++) {
            var PL = this.planets[i];
            if (PL.captured) {
                if (Math.distVec2(new b2Vec2(PL.pos.x, PL.pos.y), p) < BSWG.planet_OwnRange) {
                    return true;
                }
            }
        }
        return false;

    };

}(BSWG.planet_SurfaceDetail, BSWG.planet_CloudDetail);