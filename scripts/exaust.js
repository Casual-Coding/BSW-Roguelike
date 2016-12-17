BSWG.maxExaust = 384;

BSWG.exaustFire = 1;
BSWG.exaustBlue = 2;
BSWG.exaustWhite = 3;

BSWG.exaust = function (body, local, size, angle, z, palette, minigun, blasterSize) {

    if (!palette) {
        palette = BSWG.exaustFire;
    }

    BSWG.exaustList.add(this);

    this.palette = palette;
    this.time = 0.0;
    this.strength = 0;
    this.narrow = blasterSize > 1 ? 0.5 : (minigun ? 0.2 : 1.0);
    this.size = size || 1.0;
    this.body = body || null;
    this.local = local || new b2Vec2(0, 0);
    this.angle = angle || 0.0;
    this.z = z || 0.0;

    if (this.mat && this.body) {
        this.render(1.0/60);
    }

};

BSWG.exaust.prototype.render = function (dt) {

    this.time += dt;

    if (this.body) {
        var wp = (this.body instanceof b2Vec2) ? this.body : BSWG.physics.localToWorld(this.local, this.body);
        var a = this.angle + (this.body.GetAngle ? this.body.GetAngle() : 0.0);     
        BSWG.exaustList.setIndex(this.index, this.strength, this.time, 0., this.narrow, wp.x, wp.y, this.z, this.size * 15, this.size * 3.5, a, this.palette);
        wp = null;
    }

};

BSWG.exaust.prototype.destroy = function () {

    this.body = null;
    this.local = null;

    BSWG.exaustList.setIndex(BSWG.exaustList.list.indexOf(this), 0, 0, 0, 0, 0, 0, 0, 0, 0.0001, 0.0001, 0, 0);

};

BSWG.exaust.prototype.remove = function () {

    this.destroy();

    BSWG.exaustList.remove(this);

};

BSWG.exaustList = (new function () {

    this.list = [];

    this.add = function (ex) {
        this.list.push(ex);
        ex.index = this.list.length - 1;
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
        BSWG.render.scene.remove(this.mesh);
    };

    this.render = function (dt) {
        var len = this.list.length;
        for (var i=0; i<len; i++) {
            this.list[i].index = i;
            this.list[i].render(dt);
        }
        for (var i=len; i<this.MAX; i++) {
            this.extra[i*12+0*4+0] =
              this.extra[i*12+1*4+0] = 
              this.extra[i*12+2*4+0] = 0.0;
        }

        var count = this.MAX;

        this.posAttr.updateRange.offset = 0;
        this.posAttr.updateRange.count = count * 3 * 3;
        this.posAttr.needsUpdate = true;

        this.exAttr.updateRange.offset = 0;
        this.exAttr.updateRange.count = count * 4 * 3;
        this.exAttr.needsUpdate = true;

        this.clrAttr.updateRange.offset = 0;
        this.clrAttr.updateRange.count = count * 1 * 3;
        this.clrAttr.needsUpdate = true;
    };

    this.lutX = [
        Math.cos((0/3)*Math.PI*2),
        Math.cos((1/3)*Math.PI*2),
        Math.cos((2/3)*Math.PI*2)
    ];
    this.lutY = [
        Math.sin((0/3)*Math.PI*2),
        Math.sin((1/3)*Math.PI*2),
        Math.sin((2/3)*Math.PI*2)
    ];

    this.setIndex = function (index, extraX, extraY, extraZ, extraW, positionX, positionY, positionZ, scaleX, scaleY, angle, palette) {
        if (index < 0 || index >= this.MAX) {
            return;
        }

        var ca = Math.cos(angle);
        var sa = Math.sin(angle);
        for (var i=0; i<3; i++) {
            var x = this.lutX[i] * scaleX * 2.0;
            var y = this.lutY[i] * scaleY * 2.0;
            this.vertices[index*9+i*3+0] = positionX + x * ca - y * sa;
            this.vertices[index*9+i*3+1] = positionY + y * ca + x * sa;
            this.vertices[index*9+i*3+2] = positionZ;
            this.extra[index*12+i*4+0] = extraX;
            this.extra[index*12+i*4+1] = extraY;
            this.extra[index*12+i*4+2] = extraZ;
            this.extra[index*12+i*4+3] = extraW;
            this.clr[index*3+i+0] = palette;
        }
    };

    this.hasInit = false;

    this.init = function () {

        if (this.hasInit) {
            this.clear();
            BSWG.render.scene.add(this.mesh);
            return;
        }

        this.hasInit = true;

        this.MAX = BSWG.maxExaust;
        this.vertices = new Float32Array(this.MAX * 3 * 3);
        this.clr = new Float32Array(this.MAX * 1 * 3);
        this.extra = new Float32Array(this.MAX * 4 * 3);
        this.uv = new Float32Array(this.MAX * 2 * 3);

        for (var i=0; i<this.MAX*3; i++) {
            this.vertices[i*3 + 0] =
                this.vertices[i*3 + 1] =
                this.vertices[i*3 + 2] = 0.0;
            this.clr[i] = 0;
            this.extra[i*4 + 0] =
                this.extra[i*4 + 1] =
                this.extra[i*4 + 2] =
                this.extra[i*4 + 3] = 0.0;
            this.uv[i*2+0] = this.lutX[i%3] * 0.5 + 0.5;
            this.uv[i*2+1] = this.lutY[i%3] * 0.5 + 0.5;
        }

        this.faces = new Uint32Array(this.MAX * 3);
        for (var i=0; i<this.MAX*3; i++) {
            this.faces[i] = i;
        }

        this.geom = new THREE.BufferGeometry();
        this.geom.setIndex( new THREE.BufferAttribute( this.faces, 1 ) );
        this.geom.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ).setDynamic(true) );
        this.geom.addAttribute( 'clr',      new THREE.BufferAttribute( this.clr, 1 ).setDynamic(true) );
        this.geom.addAttribute( 'extra',    new THREE.BufferAttribute( this.extra, 4 ).setDynamic(true) );
        this.geom.addAttribute( 'uv',       new THREE.BufferAttribute( this.uv, 2 ) );
        this.mat = BSWG.render.newMaterial("exaustVertex", "exaustFragment", {}, THREE.AdditiveBlending, THREE.DoubleSide);

        this.posAttr = this.geom.getAttribute('position');
        this.exAttr = this.geom.getAttribute('extra');
        this.clrAttr = this.geom.getAttribute('clr');

        this.mesh = new THREE.Mesh( this.geom, this.mat );
        this.mesh.frustumCulled = false;
        this.mat.depthTest = false;
        this.mesh.renderOrder = 1600.0;
        this.mat.needsUpdate = true;
        this.geom.needsUpdate = true;
        this.mesh.needsUpdate = true;

        BSWG.render.scene.add( this.mesh );

    }

}());