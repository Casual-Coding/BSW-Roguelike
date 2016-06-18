BSWG.weather = function() {

    this.defaults = {
        damping: 0.9,
        wind: new THREE.Vector3(0, 0, 0),
        color: new THREE.Vector4(0, 0, 0.5, 0.5),
        size: 0.02,
        density: 0.0,
        speed: 1.0,
        tint: new THREE.Vector4(0, 0, 0, 0),
        contrast: 1.0,
        wet: 0.0
    };

    this.time = 0.0;

    this.wind = new THREE.Vector3();
    this.color = new THREE.Vector4();
    this.tint = new THREE.Vector4();

    this.damping = this.defaults.damping;
    this.wind.set(this.defaults.wind.x, this.defaults.wind.y, this.defaults.wind.z);
    this.color.set(this.defaults.color.x, this.defaults.color.y, this.defaults.color.z, this.defaults.color.w);
    this.tint.set(this.defaults.tint.x, this.defaults.tint.y, this.defaults.tint.z, this.defaults.tint.w);
    this.size = this.defaults.size;
    this.density = this.defaults.density;
    this.speed = this.defaults.speed;
    this.wet = this.defaults.wet;
    this.contrast = this.defaults.contrast;

    this.hasInit = true;

    this.MAX_PRT = 1024 * 32;
    this.vertices = new Float32Array(this.MAX_PRT * 4 * 3);
    this.attr1 = new Float32Array(this.MAX_PRT * 4 * 4);

    for (var i=0; i<this.MAX_PRT; i++) {

        this.vertices[i*12 + 0 + 0] = Math.cos(0);
        this.vertices[i*12 + 0 + 1] = Math.sin(0);
        this.vertices[i*12 + 0 + 2] = 0.0;

        this.vertices[i*12 + 3 + 0] = Math.cos(Math.PI*2/3);
        this.vertices[i*12 + 3 + 1] = Math.sin(Math.PI*2/3);
        this.vertices[i*12 + 3 + 2] = 0.0;

        this.vertices[i*12 + 6 + 0] = Math.cos(Math.PI*2/3*2);
        this.vertices[i*12 + 6 + 1] = Math.sin(Math.PI*2/3*2);
        this.vertices[i*12 + 6 + 2] = 0.0;

        this.vertices[i*12 + 9 + 0] = 0.0;
        this.vertices[i*12 + 9 + 1] = 0.0;
        this.vertices[i*12 + 9 + 2] = 1.0;

        var r1 = Math.random() * 1000.0;
        var r2 = Math.random();
        var r3 = Math.random();
        var f = Math.floor(i/3) / this.MAX_PRT;

        for (var k=0; k<4; k++) {
            this.attr1[i*4*4 + k*4 + 0] = f;
            this.attr1[i*4*4 + k*4 + 1] = r1;
            this.attr1[i*4*4 + k*4 + 2] = r2;
            this.attr1[i*4*4 + k*4 + 3] = r3;
        }
    }

    this.faces = new Uint32Array(this.MAX_PRT * 9);
    for (var i=0; i<this.MAX_PRT; i++) {
        this.faces[i * 9 + 0] = i * 4 + 0;
        this.faces[i * 9 + 1] = i * 4 + 1;
        this.faces[i * 9 + 2] = i * 4 + 3;

        this.faces[i * 9 + 3] = i * 4 + 3;
        this.faces[i * 9 + 4] = i * 4 + 1;
        this.faces[i * 9 + 5] = i * 4 + 2;

        this.faces[i * 9 + 6] = i * 4 + 2;
        this.faces[i * 9 + 7] = i * 4 + 3;
        this.faces[i * 9 + 8] = i * 4 + 0;
    }

    geom = new THREE.BufferGeometry();
    geom.setIndex( new THREE.BufferAttribute( this.faces, 1 ) );
    geom.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );
    geom.addAttribute( 'attr1',    new THREE.BufferAttribute( this.attr1, 4 ) );
    
    var uniforms = {
        time: {
            type: 'f',
            value: this.time
        },
        damping: {
            type: 'f',
            value: (1/(1 + this.damping))
        },
        density: {
            type: 'f',
            value: this.density
        },
        size: {
            type: 'f',
            value: this.size
        },
        speed: {
            type: 'f',
            value: this.speed
        },
        wind: {
            type: 'v3',
            value: this.wind
        },
        color: {
            type: 'v4',
            value: this.color
        },
        envMap: {
            type: 't',
            value: BSWG.render.envMap ? BSWG.render.envMap.texture : null
        },
        envMapTint: {
            type: 'v4',
            value: BSWG.render.envMapTint
        },
        cam: {
            type: 'v3',
            value: new THREE.Vector3(0, 0, 0)
        }
    };

    this.shadowMat = BSWG.render.newMaterial("weatherVertex", "weatherFragmentShadow", uniforms);
    this.shadowMat.depthWrite = false;
    this.shadowMat.side = THREE.DoubleSide;

    this.mat = BSWG.render.newMaterial("weatherVertex", "weatherFragment", uniforms, THREE.AdditiveBlending);
    this.mat.depthWrite = false;
    this.mat.side = THREE.DoubleSide;

    this.mat.blending = THREE.CustomBlending;
    this.mat.blendSrc = THREE.SrcAlphaFactor;
    this.mat.blendDst = THREE.OneMinusSrcAlphaFactor;
    this.mat.blendEquation = THREE.AddEquation;

    mesh = new THREE.Mesh( geom, this.mat );
    mesh.frustumCulled = false;
    mesh.position.z = 2.0;
    mesh.renderOrder = 1500.0;

    smesh = new THREE.Mesh( geom, this.shadowMat );
    smesh.frustumCulled = false;
    smesh.position.z = 2.0;
    smesh.renderOrder = 1500.0;

    geom.needsUpdate = true;
    mesh.needsUpdate = true;
    smesh.needsUpdate = true;

    BSWG.render.scene.add( mesh );
    //BSWG.render.sceneS.add( smesh );

    this.mesh = mesh;
    this.smesh = smesh;

    this.posAttr = geom.getAttribute('position');
    this.a1Attr = geom.getAttribute('attr1');

    this.settingsFade = null;

};

BSWG.weather.prototype.transition = function (args, speed) {

    this.settingsFade = {};
    for (var key in this.defaults) {
        this.settingsFade[key] = (args && (args[key] || args[key] === 0.0)) ? args[key] : this.defaults[key];
    }
    this.settingsFade._speed = speed || 1.0;

};

BSWG.weather.prototype.readd = function () {

    BSWG.render.scene.add(this.mesh);
    //BSWG.render.sceneS.add(this.smesh);

};

BSWG.weather.prototype.render = function(dt) {

    if (!this.hasInit) {
        return;
    }

    if (this.settingsFade) {
        var sp = Math.clamp(dt * this.settingsFade._speed, 0, 1);
        var lerp = function(a, b) {
            return (b - a) * sp + a;
        };
        for (var key in this.defaults) {
            var value = this.settingsFade[key];
            if (value instanceof THREE.Vector3) {
                this[key].set(lerp(this[key].x, value.x), lerp(this[key].y, value.y), lerp(this[key].z, value.z));
            }
            else if (value instanceof THREE.Vector4) {
                this[key].set(lerp(this[key].x, value.x), lerp(this[key].y, value.y), lerp(this[key].z, value.z), lerp(this[key].w, value.w));
            }
            else {
                this[key] = lerp(this[key], value);
            }
        }
    }

    this.time += dt * this.speed;
    this.mat.uniforms.time.value = this.time;
    this.mat.uniforms.density.value = this.density;
    this.mat.uniforms.wind.value.set(this.wind.x, this.wind.y, this.wind.z);
    this.mat.uniforms.damping.value = 1 / (1 + this.damping);
    this.mat.uniforms.color.value.set(this.color.x, this.color.y, this.color.z, this.color.w);
    this.mat.uniforms.size.value = this.size;
    this.mat.uniforms.speed.value = this.speed;
    this.mat.uniforms.envMap.value = BSWG.render.envMap.texture;
    this.mat.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z);
    BSWG.render.envMapTint.set(this.tint.x, this.tint.y, this.tint.z, this.tint.w);
    BSWG.render.envMapParam.set(this.wet, this.contrast, 0., 0.);

};

BSWG.weather.prototype.clear = function() {

    if (!this.hasInit) {
        return;
    }

    this.transition(null, 1000000);
    this.render(1/60);

};