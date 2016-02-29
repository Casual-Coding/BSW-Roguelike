BSWG.planet_SurfaceDetail = 5;
BSWG.planet_CloudDetail = 3;

BSWG.planet_TERRAN = 0;

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
            rot:    Math.random() * Math.PI/60,
            rotD:   0.0,
            rotVec: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
            radius: 35,
            type:   BSWG.planet_TERRAN,
            seed:   Date.timeStamp()
        };

        var obj = new Object();

        def = def || {};
        for (var key in defaults) {
            obj[key] = def[key] || defaults[key];
        }

        obj.pos.z -= obj.radius * 0.75;

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
            var pval = 
                rand.get(Math.floor(x*1.5), Math.floor(y*1.5), Math.floor(z*1.5)) * Math.pow(2, -1) +
                rand.get(Math.floor(x*3), Math.floor(y*3), Math.floor(z*3)) * Math.pow(2, -1.5) +
                rand.get(Math.floor(x*9), Math.floor(y*9), Math.floor(z*9)) * Math.pow(2, -2) +
                rand.get(Math.floor(x*27), Math.floor(y*27), Math.floor(y*27)) * Math.pow(2, -2.5);
            if (pval < 0.75) pval = 0.5;
            else if (pval < 1.1) pval = 0.7;
            pval = Math.pow(pval-0.5, 1.5)*2.0 + 0.5;
            var h = 0.9 + pval * 0.2;
            n.x *= h;
            n.y *= h;
            n.z *= h;
        }
        for (var k=0; k<1; k++) {
            for (var i=0; i<obj.geom.faces.length; i++) {
                var f = obj.geom.faces[i];
                var v = obj.geom.vertices;
                v[f.a].set(
                    (v[f.a].x*0.5 + v[f.b].x*0.25 + v[f.c].x*0.25),
                    (v[f.a].y*0.5 + v[f.b].y*0.25 + v[f.c].y*0.25),
                    (v[f.a].z*0.5 + v[f.b].z*0.25 + v[f.c].z*0.25)
                );
            }
        }
        rand.dispose();
        obj.geom.computeFaceNormals();
        obj.geom.computeVertexNormals();
        //for (var i=0; i<obj.geom.faces.length; i++) {
        //    obj.geom.faces[i].vertexNormals.length = 0;
        //}

        obj.mesh = new THREE.Mesh( obj.geom, obj.mat );
        obj.mesh.scale.set(obj.radius, obj.radius, obj.radius);
        obj.mesh.updateMatrix();

        obj.mat.needsUpdate = true;
        obj.mesh.needsUpdate = true;

        var self = obj;

        obj.update = function(dt) {

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