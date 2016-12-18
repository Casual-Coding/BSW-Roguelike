BSWG.polyMesh_baseHeight = 0.5;
BSWG.blockPolySmooth     = null;

BSWG.bpmMatCache = null;
BSWG.bpmMatCacheIdx = 0;
BSWG.bpmMatCacheISize = 256;

BSWG.bpmGeomCache = {};

BSWG.bpmReflectDefault = 0.35;
BSWG.bpmReflect = BSWG.bpmReflectDefault;
BSWG.bpmSmoothNormals = false;
BSWG.bpmRotating = true;

BSWG.rciPolyCache = {};
BSWG.rciPolyCacheBounds = {};

BSWG.renderCompIconRecenter = false;

BSWG.dummyMat = null;

BSWG.renderCompIcon = function(ctx, key, x, y, scale, angle, baseR, baseG, baseB) {

    var poly = BSWG.rciPolyCache[key + '|' + BSWG.renderCompIconRecenter];
    var bnd = BSWG.rciPolyCacheBounds[key + '|' + BSWG.renderCompIconRecenter];
    if (!poly) {
        var typeArgs = BSWG.componentList.compStrTypeArgs(key);
        if (!typeArgs[2]) {
            BSWG.renderCompIconRecenter = false;
            return;
        }
        poly = typeArgs[2].getIconPoly(typeArgs[1] || {});
        if (!poly) {
            BSWG.renderCompIconRecenter = false;
            return;
        }
        if (BSWG.renderCompIconRecenter) {
            var minx = 1000, maxx = -1000,
                miny = 1000, maxy = -1000;
            for (var i=0; i<poly.length; i++) {
                for (var j=0; j<poly[i].length; j++) {
                    minx = Math.min(minx, poly[i][j].x);
                    maxx = Math.max(maxx, poly[i][j].x);
                    miny = Math.min(miny, poly[i][j].y);
                    maxy = Math.max(maxy, poly[i][j].y);
                }
            }
            var ox = (maxx + minx) * 0.5,
                oy = (maxy + miny) * 0.5;
            for (var i=0; i<poly.length; i++) {
                for (var j=0; j<poly[i].length; j++) {
                    poly[i][j].x -= ox;
                    poly[i][j].y -= oy;
                }
            }
        }
        BSWG.rciPolyCache[key + '|' + BSWG.renderCompIconRecenter] = poly;
        BSWG.rciPolyCacheBounds[key + '|' + BSWG.renderCompIconRecenter] = bnd = [
            minx-ox, miny-oy, maxx-ox, maxy-oy
        ];
        BSWG.renderCompIconRecenter = false;
    }

    if (key.indexOf('armour=true') >= 0) {
        baseR += 0.25;
        baseG += 0.25;
        baseB += 0.25;
    }

    if (!scale && scale !== 0) {
        scale = 1.0;
    }
    angle = angle || 0.0;

    var r = Math.floor(Math.clamp(baseR||0.3, 0, 1)*255);
    var g = Math.floor(Math.clamp(baseG||0.3, 0, 1)*255);
    var b = Math.floor(Math.clamp(baseB||0.3, 0, 1)*255);

    var r2 = Math.floor(Math.clamp((baseR||0.3) * 2, 0, 1)*255);
    var g2 = Math.floor(Math.clamp((baseG||0.3) * 2, 0, 1)*255);
    var b2 = Math.floor(Math.clamp((baseB||0.3) * 2, 0, 1)*255);

    var r4 = Math.floor(Math.clamp((baseR||0.3) * 3.5, 0, 1)*255);
    var g4 = Math.floor(Math.clamp((baseG||0.35) * 3.5, 0, 1)*255);
    var b4 = Math.floor(Math.clamp((baseB||0.3) * 3.5, 0, 1)*255);

    var r3 = Math.floor(Math.clamp((baseR||0.3) * 1.35, 0, 1)*255);
    var g3 = Math.floor(Math.clamp((baseG||0.3) * 1.35, 0, 1)*255);
    var b3 = Math.floor(Math.clamp((baseB||0.3) * 1.35, 0, 1)*255);

    var c1 = 'rgb(' + r + ',' + g + ',' + b + ')';
    var c2 = 'rgb(' + r2 + ',' + g2 + ',' + b2 + ')';
    var c3 = 'rgb(' + r3 + ',' + g3 + ',' + b3 + ')';
    var c4 = 'rgb(' + r4 + ',' + g4 + ',' + b4 + ')';

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(angle);
    for (var j=0; j<poly.length; j++) {
        ctx.lineWidth = 2 / scale;
        ctx.strokeStyle = c3;
        ctx.beginPath();
        ctx.moveTo(poly[j][0].x, poly[j][0].y);
        for (var i=1; i<poly[j].length; i++) {
            ctx.lineTo(poly[j][i].x, poly[j][i].y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    for (var j=0; j<poly.length; j++) {
        ctx.fillStyle = j === 0 ? c1 : c2;
        var a = Math.rotVec2(new b2Vec2(bnd[0], (bnd[1]+bnd[3])*0.5), -angle);
        var b = Math.rotVec2(new b2Vec2(bnd[2], (bnd[1]+bnd[3])*0.5), -angle);
        var grd = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        a = b = null;
        if (j === 0) {
            grd.addColorStop(0, c1);
            grd.addColorStop(1, c2);
        }
        else {
            grd.addColorStop(0, c2);
            grd.addColorStop(1, c4);
        }
        ctx.fillStyle = grd;
        grd = null;
        ctx.beginPath();
        ctx.moveTo(poly[j][0].x, poly[j][0].y);
        for (var i=1; i<poly[j].length; i++) {
            ctx.lineTo(poly[j][i].x, poly[j][i].y);
        }
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
};




/// COMPONENTS

BSWG.compMultiMesh = function (max_verts) {
    this.numVerts = max_verts || 32768;

    this.mat = BSWG.render.newMaterial("basicVertex2Multi", "basicFragment2", {
        map: {
            type: 't',
            value: BSWG.render.images['test_nm'].texture
        },
        dmgMap: {
            type: 't',
            value: BSWG.render.images['damage_nm'].texture
        },
        shadowMatrix: {
            type: 'm4',
            value: BSWG.render.shadowMatrix
        },
        shadowMap: {
            type: 't',
            value: BSWG.render.shadowMap.depthTexture
        },
        shadowDisabled: {
            type: 'f',
            value: BSWG.options.shadows ? 0.0 : 1.0
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

    this.smat = BSWG.render.newMaterial("basicVertexMulti", "shadowFragment", {
    });

    this.geom = new THREE.BufferGeometry();

    var aClr = new Float32Array(this.numVerts * 4);
    var aWarpInVReflect = new Float32Array(this.numVerts * 3);
    var aExtra = new Float32Array(this.numVerts * 4);
    var aPosRot = new Float32Array(this.numVerts * 4);

    var position = new Float32Array(this.numVerts * 3);
    var normal = new Float32Array(this.numVerts * 3);

    this.geom.addAttribute( 'aClr', new THREE.BufferAttribute( aClr, 4 ).setDynamic(true) );
    this.geom.addAttribute( 'aWarpInVReflect', new THREE.BufferAttribute( aWarpInVReflect, 3 ).setDynamic(true) );
    this.geom.addAttribute( 'aExtra', new THREE.BufferAttribute( aExtra, 4 ).setDynamic(true) );
    this.geom.addAttribute( 'aPosRot', new THREE.BufferAttribute( aPosRot, 4 ).setDynamic(true) );
    this.geom.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ).setDynamic(true) );
    this.geom.addAttribute( 'normal', new THREE.BufferAttribute( normal, 3 ).setDynamic(true) );

    this.mesh = new THREE.Mesh(this.geom, this.mat);
    this.smesh = new THREE.Mesh(this.geom, this.smat);

    this.aClr = this.geom.getAttribute('aClr');
    this.aWarpInVReflect = this.geom.getAttribute('aWarpInVReflect');
    this.aExtra = this.geom.getAttribute('aExtra');
    this.aPosRot = this.geom.getAttribute('aPosRot');
    this.position = this.geom.getAttribute('position');
    this.normal = this.geom.getAttribute('normal');

    this.cmVerts = 0;

    this.geom.setDrawRange(0, this.cmVerts);

    this.nextMesh = null;
    this.objects = [];

    this.child = false;

    this.mat.needsUpdate = true;
    this.geom.needsUpdate = true;
    this.mesh.frustumCulled = false;
    this.mesh.needsUpdate = true;
    this.smesh.frustumCulled = false;
    this.smesh.needsUpdate = true;

    BSWG.render.scene.add(this.mesh);
    BSWG.render.sceneS.add(this.smesh);
};

BSWG.compMultiMesh.prototype.destroy = function() {

    if (this.nextMesh) {
        this.nextMesh.destroy();
        this.nextMesh = null;
    }

    BSWG.render.scene.remove(this.mesh);
    BSWG.render.sceneS.remove(this.smesh);
    this.geom.setDrawRange(0, 0);
    this.mesh.geometry = null;
    this.mesh.material = null;
    this.smesh.geometry = null;
    this.smesh.material = null;
    this.mat.dispose();
    this.geom.dispose();
    this.mesh = null;
    this.smesh = null;
    this.mat = null;
    this.geom = null;

};

BSWG.compMultiMesh.prototype.add = function(mesh) {

    obj = {};
    obj.mesh = mesh;
    obj.vstart = this.cmVerts;
    obj.vcount = mesh.geometry.getAttribute('position').array.length / 3;

    if ((obj.vstart + obj.vcount) > (this.geom.getAttribute('position').array.length / 3)) {

        if (!this.nextMesh) {
            this.nextMesh = new BSWG.compMultiMesh(this.numVerts);
            this.nextMesh.child = true;
        }

        return this.nextMesh.add(mesh);
    }

    obj.parent = this;
    this.objects.push(obj);
    this.cmVerts += obj.vcount;

    var cpos = mesh.geometry.getAttribute('position').array;
    var cnorm = mesh.geometry.getAttribute('normal').array;

    var idxv = obj.vstart;
    var k1=0, k2=0;
    var pos = this.position.array;
    var norm = this.normal.array;
    var j=0, len=obj.vcount;
    for (; j<len; j++) {
        k1 = (idxv + j)*3;
        k2 = j*3;
        pos[k1] = cpos[k2];
        pos[k1+1] = cpos[k2+1];
        pos[k1+2] = cpos[k2+2];
        norm[k1] = cnorm[k2];
        norm[k1+1] = cnorm[k2+1];
        norm[k1+2] = cnorm[k2+2];
    }

    this.position.updateRange.offset = 0;
    this.position.updateRange.count = this.cmVerts * 3;
    this.position.needsUpdate = true;
    this.normal.updateRange.offset = 0;
    this.normal.updateRange.count = this.cmVerts * 3;
    this.normal.needsUpdate = true;

    this.geom.setDrawRange(0, this.cmVerts);
    this.geom.needsUpdate = true;

    this.setArgs(obj, new THREE.Vector4(0.2, 0.2, 0.2, 1.0), 1.0, BSWG.bpmReflect, new THREE.Vector4(1,0,0,0), mesh.position, mesh.rotation.z);
    return obj;

};

BSWG.compMultiMesh.prototype.remove = function (obj) {

    if (obj.parent !== this) {
        obj.parent.remove(obj);
        return;
    }

    if (!this.geom || !this.mesh) {
        return;
    }

    var index = this.objects.indexOf(obj);

    if (index < 0) {
        console.log('BSWG.compMultiMesh: Remove error');
        return;
    }

    this.objects.splice(index, 1);

    var voffset = obj.vcount;
    var k1=0, k2=0, k13=0, k23=0, len=0; j=0;
    var aClr = this.aClr.array;
    var aWarp = this.aWarpInVReflect.array;
    var aEx = this.aExtra.array;
    var aPr = this.aPosRot.array;
    var pos = this.position.array;
    var norm = this.normal.array;
    var o2 = null;
    var idxv = 0;
    var obs = this.objects;

    for (var i=index; i<obs.length; i++) {
        o2 = obs[i];
        idxv = o2.vstart;
        len=o2.vcount; j=0;
        for (; j<len; j++) {
            k1 = idxv - voffset + j;
            k2 = idxv + j;
            k13 = k1*3; k1 *= 4;
            k23 = k2*3; k2 *= 4;
            aClr[k1] = aClr[k2];
            aClr[k1+1] = aClr[k2+1];
            aClr[k1+2] = aClr[k2+2];
            aClr[k1+3] = aClr[k2+3];
            aWarp[k13] = aWarp[k23];
            aWarp[k13+1] = aWarp[k23+1];
            aWarp[k13+2] = aWarp[k23+2];
            aEx[k1] = aEx[k2];
            aEx[k1+1] = aEx[k2+1];
            aEx[k1+2] = aEx[k2+2];
            aEx[k1+3] = aEx[k2+3];
            aPr[k1] = aPr[k2];
            aPr[k1+1] = aPr[k2+1];
            aPr[k1+2] = aPr[k2+2];
            aPr[k1+3] = aPr[k2+3];
            pos[k13] = pos[k23];
            pos[k13+1] = pos[k23+1];
            pos[k13+2] = pos[k23+2];
            norm[k13] = norm[k23];
            norm[k13+1] = norm[k23+1];
            norm[k13+2] = norm[k23+2];
        }
        o2.vstart -= voffset;
    }

    this.cmVerts -= voffset;
    this.geom.setDrawRange(0, this.cmVerts);
    this.geom.needsUpdate = true;

    if (this.cmVerts > 0) {
        this.position.updateRange.offset = 0;
        this.position.updateRange.count = this.cmVerts * 3;
        this.position.needsUpdate = true;
        this.normal.updateRange.offset = 0;
        this.normal.updateRange.count = this.cmVerts * 3;
        this.normal.needsUpdate = true;        
    }

    obj.mesh = obj.parent = null;

};

BSWG.compMultiMesh.prototype.update = function (dt) {

    var uniforms = this.mat.uniforms;
    uniforms.viewport.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);
    uniforms.envMapT.value = BSWG.render.envMapT;   
    uniforms.shadowDisabled.value = BSWG.options.shadows ? 0.0 : 1.0;

    for (var i=0; i<this.objects.length; i++) {
        var o2 = this.objects[i];
        //o2.mesh.updateMatrix();
        //o2.mesh.updateMatrixWorld(true);
    }

    if (this.cmVerts > 0) {
        this.aClr.updateRange.offset = 0;
        this.aClr.updateRange.count = this.cmVerts * 4;
        this.aClr.needsUpdate = true;
        this.aWarpInVReflect.updateRange.offset = 0;
        this.aWarpInVReflect.updateRange.count = this.cmVerts * 3;
        this.aWarpInVReflect.needsUpdate = true;
        this.aExtra.updateRange.offset = 0;
        this.aExtra.updateRange.count = this.cmVerts * 4;
        this.aExtra.needsUpdate = true;
        this.aPosRot.updateRange.offset = 0;
        this.aPosRot.updateRange.count = this.cmVerts * 4;
        this.aPosRot.needsUpdate = true;
    }

    if (this.nextMesh) {
        this.nextMesh.update(dt);
    }

};

BSWG.compMultiMesh.prototype.setArgs = function (obj, clr, warpIn, vreflect, extra, pos, angle) {

    if (obj.parent !== this) {
        obj.parent.setArgs(obj, clr, warpIn, vreflect, extra, pos, angle);
        return;
    }

    var idxv = obj.vstart;
    var k1=0, k2=0, j=0;
    var aClr = this.aClr.array;
    var aWarp = this.aWarpInVReflect.array;
    var aEx = this.aExtra.array;
    var aPr = this.aPosRot.array;
    var len = obj.vcount;
    for (; j<len; j++) {
        k1 = idxv + j;
        k2 = k1*3;
        k1 *= 4;
        aClr[k1] = clr.x;
        aClr[k1+1] = clr.y;
        aClr[k1+2] = clr.z;
        aClr[k1+3] = clr.w;
        aWarp[k2] = warpIn;
        aWarp[k2+1] = vreflect;
        aWarp[k2+2] = 1.0;
        aEx[k1] = extra.x;
        aEx[k1+1] = extra.y;
        aEx[k1+2] = extra.z;
        aEx[k1+3] = extra.w;
        aPr[k1] = pos.x;
        aPr[k1+1] = pos.y;
        aPr[k1+2] = pos.z;
        aPr[k1+3] = angle;
    }

};

BSWG.blockPolyMesh = function(obj, iscale, zcenter, zoffset, depth) {

    this.obj = obj;
    this.body = this.obj.body;
    this.verts = this.obj.verts;
    this.zoffset = zoffset;

    var K = function(v) { return ',' + Math.floor(v*1000); };
    var key = 'M';
    if (zcenter) { key += 'z' + K(zcenter.x) + K(zcenter.y); }
    else { key += 'z,0,0'; }
    key += 'l' + K(this.body.GetLocalCenter().x) + K(this.body.GetLocalCenter().y);
    if (this.zoffset) { key += 'o' + K(this.zoffset); }
    if (BSWG.bpmRotating) { key += 'R'; }
    if (depth) { key += 'd' + K(depth); }
    if (iscale) { key += 'i' + K(iscale); }
    if (BSWG.bpmSmoothNormals) { key += 'f'; }
    if (BSWG.blockPolySmooth) { key += 'x' + K(BSWG.blockPolySmooth||-1); }
    for (var i=0; i<this.verts.length; i++) { key += K(this.verts[i].x) + K(this.verts[i].y); }

    var cacheGeom = BSWG.bpmGeomCache[key];

    if (!cacheGeom) {

        if (BSWG.blockPolySmooth) {
            this.verts = Math.smoothPoly(this.verts, BSWG.blockPolySmooth);
        }

        var len = this.verts.length;

        var offset = null;

        if (!zcenter) {
            zcenter = BSWG.bpmRotating ? new b2Vec2(0, 0) : this.body.GetLocalCenter();
        }
        else {
            var bc = BSWG.bpmRotating ? new b2Vec2(0, 0) : this.body.GetLocalCenter();
            offset = new b2Vec2(zcenter.x-bc.x, zcenter.y-bc.y);
        }

        if (!this.zoffset) {
            this.zoffset = 0.0;
        }

        this.zoffset *= BSWG.polyMesh_baseHeight;

        if (!depth) {
            var total = 1000.0;
            for (var i=0; i<len; i++) {
                total = Math.min(total, Math.distVec2(this.verts[i], zcenter));
            }
            depth = total * 0.3;
        }

        depth *= BSWG.polyMesh_baseHeight;

        var overts = new Array(len),
            iverts = new Array(len),
            mverts = new Array(len);
        for (var i=0; i<len; i++) {
            overts[i] = new THREE.Vector3(
                this.verts[i].x - zcenter.x + (offset?offset.x:0),
                this.verts[i].y - zcenter.y + (offset?offset.y:0),
                0.0
            );
            mverts[i] = new THREE.Vector3(
                (this.verts[i].x - zcenter.x) * (iscale*0.1+0.9) + (offset?offset.x:0),
                (this.verts[i].y - zcenter.y) * (iscale*0.1+0.9) + (offset?offset.y:0),
                depth*0.35
            );
            iverts[i] = new THREE.Vector3(
                (this.verts[i].x - zcenter.x) * iscale + (offset?offset.x:0),
                (this.verts[i].y - zcenter.y) * iscale + (offset?offset.y:0),
                depth
            );
        }
        var cvert = new THREE.Vector3(
            (offset?offset.x:0),
            (offset?offset.y:0),
            depth
        );

        var INNER = function(idx) { return idx+len*2+1; };
        var MIDDLE = function(idx) { return idx+len+1; };
        var OUTER = function(idx) { return idx+1; };

        this.geom = new THREE.Geometry();

        var vertices = this.geom.vertices;
        vertices.length = len*3 + 1;
        vertices[0] = cvert;
        for (var i=0; i<len; i++) {
            vertices[OUTER(i)] = overts[i];
            vertices[MIDDLE(i)] = mverts[i];
            vertices[INNER(i)] = iverts[i];
        }

        var faces = this.geom.faces;
        var cf = 0;
        faces.length = len*5;
        for (var i=0; i<len; i++) {
            var j = (i+1) % len;
            faces[cf++] = new THREE.Face3(INNER(i), INNER(j), 0);
            faces[cf++] = new THREE.Face3(MIDDLE(i), MIDDLE(j), INNER(j));
            faces[cf++] = new THREE.Face3(MIDDLE(i), INNER(j), INNER(i));
            faces[cf++] = new THREE.Face3(OUTER(i), OUTER(j), MIDDLE(j));
            faces[cf++] = new THREE.Face3(OUTER(i), MIDDLE(j), MIDDLE(i));
        }

        this.geom = new THREE.BufferGeometry().fromGeometry(this.geom);
        this.geom.computeFaceNormals();
        this.geom.computeVertexNormals();
        this.geom.attributes.normal.needsUpdate = true;
        this.geom.computeBoundingSphere();

        this.geom.needsUpdate = true;
        this.geom.__zoffset = this.zoffset;
        BSWG.bpmGeomCache[key] = this.geom;
    }
    else {
        this.geom = cacheGeom;
        this.zoffset = this.geom.__zoffset;
    }

    if (!BSWG.dummyMat) {
        BSWG.dummyMat = BSWG.render.newMaterial("basicVertex", "shadowFragment");
    }
    this.mat = BSWG.dummyMat;
    this.mesh = new THREE.Mesh(this.geom, this.mat);
    this.mesh.needsUpdate = true;

    this.mobj = BSWG.componentList.compMesh.add(this.mesh);

    this.anchorT = 0.0;
    this.enemyT = 0.0;
    this.lclr = null;
    this.clr = new THREE.Vector4(0.2, 0.2, 0.2, 1.0);
    this.warpIn = 1.0;
    this.reflect = BSWG.bpmReflect;
    this.vreflect = BSWG.bpmReflect;
    this.extra = new THREE.Vector4(1,0,0,0);

    this.update();

    BSWG.bpmSmoothNormals = false;
    BSWG.bpmRotating = false;

}

BSWG.blockPolyMesh.prototype.update = function(clr, texScale, anchor, exRot, center) {

    if (BSWG.game.dialogPause) {
        anchor = false;
    }

    var obj = this.obj;
    var comp = (obj ? obj.comp : null) || null;
    var body = this.body;

    if (comp) {
        if (comp.onCC && (comp.onCC !== BSWG.game.ccblock || comp.onCC.ai)) {
            this.enemyT += (1 - this.enemyT) * BSWG.render.dt;
        }
        else {
            this.enemyT += (0 - this.enemyT) * BSWG.render.dt;
        }
    }

    center = body.GetWorldPoint((center || body.GetLocalCenter()).clone());
    var angle  = body.GetAngle();

    var offset = BSWG.drawBlockPolyOffset || null;
    var mesh = this.mesh;
    var position = mesh.position;

    position.x = center.x + (offset?offset.x:0);
    position.y = center.y + (offset?offset.y:0);
    position.z = this.zoffset;
    mesh.rotation.z = angle + (exRot || 0);
    mesh.updateMatrix(true);
    mesh.updateMatrixWorld(true);

    var extra = this.extra;

    extra.x = texScale || 1.0;

    if (anchor && (!comp || comp.onCC === BSWG.game.ccblock)) {
        this.anchorT += (1.0 - this.anchorT) * 0.25;
    }
    else {
        this.anchorT += (0.0 - this.anchorT) * 0.25;   
    }

    extra.y = Math.clamp(this.anchorT, 0, 1);
    extra.z = BSWG.render.time;
    var dmg = comp ? (1.0 - (comp.hp / comp.maxHP)) : 0.0;

    extra.w = dmg;

    if (comp && comp.p && comp.repairing) {
        if (Math.pow(Math._random(), 0.25) < 0.85) {
            var a = Math._random() * Math.PI * 2.0;
            var r = Math._random() * (obj.radius || 1.0);
            var lp = new b2Vec2(Math.cos(a)*r, Math.sin(a)*r);
            var p = comp.p(lp);
            if (BSWG.componentList.atPoint(p, comp)) {
                var v = body.GetLinearVelocityFromLocalPoint(lp).clone();
                v.x *= 0.75;
                v.y *= 0.75;
                BSWG.render.boom.palette = chadaboom3D.green;
                BSWG.render.boom.add(
                    p.particleWrap(0.1),
                    (Math._random()*0.5+0.1)*2,
                    32,
                    Math._random()*0.5+1.0,
                    4.0,
                    v.THREE(Math._random()*2.0),
                    null,
                    Math.random() < 0.25
                );
            }
        }
    }
    if (comp &&  comp.p && dmg > 0.25) {
        if (Math.pow(Math._random(), 0.25) < dmg) {
            var a = Math._random() * Math.PI * 2.0;
            var r = Math._random() * (obj.radius || 1.0);
            var lp = new b2Vec2(Math.cos(a)*r, Math.sin(a)*r);
            var p = comp.p(lp);
            if (BSWG.componentList.atPoint(p, comp)) {
                var v = body.GetLinearVelocityFromLocalPoint(lp).clone();
                v.x *= 0.75;
                v.y *= 0.75;
                BSWG.render.boom.palette = chadaboom3D.fire;
                BSWG.render.boom.add(
                    p.particleWrap(0.1),
                    Math._random()*0.5+0.1,
                    32,
                    Math._random()*0.5+1.0,
                    4.0,
                    v.THREE(Math._random()*2.0)
                );
            }
        }
    }

    this.warpIn -= BSWG.render.dt * 2.0;
    if (this.warpIn < 0.0) {
        this.warpIn = 0.0;
    }

    if (BSWG.game.storeMode && !BSWG.game.editMode && comp && comp.onCC === null && comp.type !== 'missile') {
        if (this.warpIn < 0.25) {
            this.warpIn += 0.6;
        }
    }

    if (clr) {
        this.clr.set(clr[0], clr[1], clr[2], clr[3]);
        this.lclr = clr;
    }

    if (this.lclr) {
        var t = this.enemyT * 0.5;
        var clr2 = this.clr;
        var br = this.lclr[0], bg = this.lclr[1], bb = this.lclr[2];
        var r = 1, g = 0, b = 0;
        if (BSWG.game.bossFight) {
            r = 0.2;
            g = b = -0.07;
            this.vreflect = this.reflect * 0.125;
        }
        else {
            this.vreflect = this.reflect;
        }
        if (comp && comp.p) {
            if (comp.repairing) {
                bg = Math.clamp(bg + comp.healHP, 0, 1);
                br = Math.clamp(br - bg * 0.5, 0, 1);
                bb = Math.clamp(bb - bg * 0.5, 0, 1);
            }
            if (comp.onCC) {
                var onCC = comp.onCC;
                if (onCC.fury) {
                    br = (br + Math.min(onCC.fury, 1) * 0.75);
                    bg = (bg - br * 0.5);
                    bb = (bb - br * 0.5);
                }
                if (onCC.overpowered) {
                    br = (br + Math.min(onCC.overpowered, 1) * 1.5);
                    bg = (bg - br * 0.75);
                    bb = (bb - br * 0.75);
                }
                if (onCC.defenseScreen) {
                    bb = (bb + Math.min(onCC.defenseScreen, 1) * 0.25);
                    bg = (bg - bb * 0.25);
                    br = (br - bb * 0.25);
                }
                if (onCC.lightweight) {
                    br = (br + Math.min(onCC.lightweight, 1) * 0.75);
                    bg = (bg + Math.min(onCC.lightweight, 1) * 0.75);
                    bb = (bb + Math.min(onCC.lightweight, 1) * 0.75);
                }
                if (onCC.massive) {
                    br = (br - Math.min(onCC.massive, 1) * 0.65);
                    bg = (bg - Math.min(onCC.massive, 1) * 0.65);
                    bb = (bb - Math.min(onCC.massive, 1) * 0.65);
                }
                if (onCC.massive2) {
                    br = (br - Math.min(onCC.massive2, 1) * 1.0);
                    bg = (bg - Math.min(onCC.massive2, 1) * 1.0);
                    bb = (bb - Math.min(onCC.massive2, 1) * 1.0);
                }
                if (onCC.doublePunch && comp.isMele) {
                    br = (br + Math.min(onCC.doublePunch, 1) * 1.5);
                    bg = (bg - br * 0.71);
                    bb = (bb - br * 0.75);
                }
                if (onCC.spinUp && comp.isMele && comp.isSpinner) {
                    br = (br + Math.min(onCC.spinUp, 1) * 1.5);
                    bg = (bg - br * 0.75);
                    bb = (bb - br * 0.75);
                }
                br = Math.clamp(br, 0, 1);
                bg = Math.clamp(bg, 0, 1);
                bb = Math.clamp(bb, 0, 1);
            }

        }
        clr2.set(br * (1-t) + t * r, bg * (1-t) + t * g, bb * (1-t) + t * b, this.lclr[3]*(1-this.warpIn));
    }
    else {
        this.vreflect = this.reflect;
    }

    BSWG.componentList.compMesh.setArgs(this.mobj, this.clr, this.warpIn, this.vreflect, this.extra, mesh.position, mesh.rotation.z);

    BSWG.bpmReflect = BSWG.bpmReflectDefault;
};

BSWG.blockPolyMesh.prototype.destroy = function() {

    BSWG.componentList.compMesh.remove(this.mobj);
    this.mobj = null;
    this.mesh.geometry = null;
    this.mesh.material = null;
    this.mesh = null;
    this.mat = null;
    this.geom = null;

};

BSWG.generateBlockPolyMesh = function(obj, iscale, zcenter, zoffset, depth) {

    return new BSWG.blockPolyMesh(obj, iscale, zcenter, zoffset, depth);

};




/// SELECTION

BSWG.compSelMultiMesh = function (max_verts) {
    this.numVerts = max_verts || 32768;

    this.mat = BSWG.render.newMaterial("multiSelectionVertex", "compSelectionFragment", {});

    this.geom = new THREE.BufferGeometry();

    var aClr = new Float32Array(this.numVerts * 4);
    var aPosRot = new Float32Array(this.numVerts * 4);
    var position = new Float32Array(this.numVerts * 3);
    var normal = new Float32Array(this.numVerts * 3);

    this.geom.addAttribute( 'aClr', new THREE.BufferAttribute( aClr, 4 ).setDynamic(true) );
    this.geom.addAttribute( 'aPosRot', new THREE.BufferAttribute( aPosRot, 4 ).setDynamic(true) );
    this.geom.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ).setDynamic(true) );
    this.geom.addAttribute( 'normal', new THREE.BufferAttribute( normal, 3 ).setDynamic(true) );

    this.mesh = new THREE.Mesh(this.geom, this.mat);

    this.aClr = this.geom.getAttribute('aClr');
    this.aPosRot = this.geom.getAttribute('aPosRot');
    this.position = this.geom.getAttribute('position');
    this.normal = this.geom.getAttribute('normal');

    this.cmVerts = 0;

    this.geom.setDrawRange(0, this.cmVerts);

    this.nextMesh = null;
    this.objects = [];

    this.child = false;

    this.mat.needsUpdate = true;
    this.geom.needsUpdate = true;
    this.mesh.renderOrder = 1400.0;
    this.mesh.frustumCulled = false;
    this.mesh.needsUpdate = true;

    BSWG.render.scene.add(this.mesh);
};

BSWG.compSelMultiMesh.prototype.destroy = function() {

    if (this.nextMesh) {
        this.nextMesh.destroy();
        this.nextMesh = null;
    }

    BSWG.render.scene.remove(this.mesh);
    this.geom.setDrawRange(0, 0);
    this.mesh.geometry = null;
    this.mesh.material = null;
    this.mat.dispose();
    this.geom.dispose();
    this.mesh = null;
    this.mat = null;
    this.geom = null;

};

BSWG.compSelMultiMesh.prototype.add = function(mesh) {

    obj = {};
    obj.mesh = mesh;
    obj.vstart = this.cmVerts;
    obj.vcount = mesh.geometry.getAttribute('position').array.length / 3;

    if ((obj.vstart + obj.vcount) > (this.geom.getAttribute('position').array.length / 3)) {

        if (!this.nextMesh) {
            this.nextMesh = new BSWG.compSelMultiMesh(this.numVerts);
            this.nextMesh.child = true;
        }

        return this.nextMesh.add(mesh);
    }

    obj.parent = this;
    this.objects.push(obj);
    this.cmVerts += obj.vcount;

    var cpos = mesh.geometry.getAttribute('position').array;
    var cnorm = mesh.geometry.getAttribute('normal').array;

    var idxv = obj.vstart;
    var k1=0, k2=0;
    var pos = this.position.array;
    var norm = this.normal.array;
    var j=0, len=obj.vcount;
    for (; j<len; j++) {
        k1 = (idxv + j)*3;
        k2 = j*3;
        pos[k1] = cpos[k2];
        pos[k1+1] = cpos[k2+1];
        pos[k1+2] = cpos[k2+2];
        norm[k1] = cnorm[k2];
        norm[k1+1] = cnorm[k2+1];
        norm[k1+2] = cnorm[k2+2];
    }

    this.position.updateRange.offset = 0;
    this.position.updateRange.count = this.cmVerts * 3;
    this.position.needsUpdate = true;
    this.normal.updateRange.offset = 0;
    this.normal.updateRange.count = this.cmVerts * 3;
    this.normal.needsUpdate = true;

    this.geom.setDrawRange(0, this.cmVerts);
    this.geom.needsUpdate = true;

    this.setArgs(obj, new THREE.Vector4(0.5, 1.0, 0.5, 0.0), mesh.position, mesh.rotation.z);
    return obj;

};

BSWG.compSelMultiMesh.prototype.remove = function (obj) {

    if (obj.parent !== this) {
        obj.parent.remove(obj);
        return;
    }

    if (!this.geom || !this.mesh) {
        return;
    }

    var index = this.objects.indexOf(obj);

    if (index < 0) {
        console.log('BSWG.compSelMultiMesh: Remove error');
        return;
    }

    this.objects.splice(index, 1);

    var voffset = obj.vcount;
    var k1=0, k2=0, k13=0, k23=0, len=0; j=0;
    var aClr = this.aClr.array;
    var aPr = this.aPosRot.array;
    var pos = this.position.array;
    var norm = this.normal.array;
    var o2 = null;
    var idxv = 0;
    var obs = this.objects;

    for (var i=index; i<obs.length; i++) {
        o2 = obs[i];
        idxv = o2.vstart;
        len=o2.vcount; j=0;
        for (; j<len; j++) {
            k1 = idxv - voffset + j;
            k2 = idxv + j;
            k13 = k1*3; k1 *= 4;
            k23 = k2*3; k2 *= 4;
            aClr[k1] = aClr[k2];
            aClr[k1+1] = aClr[k2+1];
            aClr[k1+2] = aClr[k2+2];
            aClr[k1+3] = aClr[k2+3];
            aPr[k1] = aPr[k2];
            aPr[k1+1] = aPr[k2+1];
            aPr[k1+2] = aPr[k2+2];
            aPr[k1+3] = aPr[k2+3];
            pos[k13] = pos[k23];
            pos[k13+1] = pos[k23+1];
            pos[k13+2] = pos[k23+2];
            norm[k13] = norm[k23];
            norm[k13+1] = norm[k23+1];
            norm[k13+2] = norm[k23+2];
        }
        o2.vstart -= voffset;
    }

    this.cmVerts -= voffset;
    this.geom.setDrawRange(0, this.cmVerts);
    this.geom.needsUpdate = true;

    if (this.cmVerts > 0) {
        this.position.updateRange.offset = 0;
        this.position.updateRange.count = this.cmVerts * 3;
        this.position.needsUpdate = true;
        this.normal.updateRange.offset = 0;
        this.normal.updateRange.count = this.cmVerts * 3;
        this.normal.needsUpdate = true;        
    }

    obj.mesh = obj.parent = null;

};

BSWG.compSelMultiMesh.prototype.update = function (dt) {

    for (var i=0; i<this.objects.length; i++) {
        var o2 = this.objects[i];
        o2.mesh.updateMatrix();
        o2.mesh.updateMatrixWorld(true);
    }

    if (this.cmVerts > 0) {
        this.aClr.updateRange.offset = 0;
        this.aClr.updateRange.count = this.cmVerts * 4;
        this.aClr.needsUpdate = true;
        this.aPosRot.updateRange.offset = 0;
        this.aPosRot.updateRange.count = this.cmVerts * 4;
        this.aPosRot.needsUpdate = true;
    }

    if (this.nextMesh) {
        this.nextMesh.update(dt);
    }

};

BSWG.compSelMultiMesh.prototype.setArgs = function (obj, clr, pos, angle) {

    if (obj.parent !== this) {
        obj.parent.setArgs(obj, clr, pos, angle);
        return;
    }

    var idxv = obj.vstart;
    var k1=0, j=0;
    var aClr = this.aClr.array;
    var aPr = this.aPosRot.array;
    var len = obj.vcount;
    for (; j<len; j++) {
        k1 = (idxv + j)*4;
        aClr[k1] = clr.x;
        aClr[k1+1] = clr.y;
        aClr[k1+2] = clr.z;
        aClr[k1+3] = clr.w;
        aPr[k1] = pos.x;
        aPr[k1+1] = pos.y;
        aPr[k1+2] = pos.z;
        aPr[k1+3] = angle;
    }

};

BSWG.blockPolyOutline = function(obj, zcenter, oscale) {

    this.obj = obj;
    this.zcenter = zcenter;

    oscale = 0.1;

    this.body  = this.obj.body;
    this.verts = this.obj.verts;

    /*if (BSWG.blockPolySmooth) {
        this.verts = Math.smoothPoly(this.verts, BSWG.blockPolySmooth);
    }*/

    var K = function(v) { return ',' + Math.floor(v*1000); };
    var key = '';
    if (zcenter) { key += 'a' + K(zcenter.x) + K(zcenter.y); }
    key += 'l' + K(this.body.GetLocalCenter().x) + K(this.body.GetLocalCenter().y);
    if (oscale) { key += 'b' + K(oscale); }
    if (BSWG.blockPolySmooth) { key += 'x' + K(BSWG.blockPolySmooth); }
    for (var i=0; i<this.verts.length; i++) { key += K(this.verts[i].x) + K(this.verts[i].y); }

    var cacheGeom = BSWG.bpmGeomCache[key];

    if (!cacheGeom) {
        var len = this.verts.length;

        var offset = null;

        if (!zcenter) {
            zcenter = this.body.GetLocalCenter();
        }
        else {
            var bc = this.body.GetLocalCenter();
            offset = new b2Vec2(zcenter.x-bc.x, zcenter.y-bc.y);
        }

        var overts = new Array(len*2),
            cf = 0;
        for (var i=0; i<len; i++) {
            var j = (i+1) % len;
            var edgeLen = Math.distVec2(this.verts[i], this.verts[j]);
            var dx = (this.verts[j].x - this.verts[i].x) / edgeLen;
            var dy = (this.verts[j].y - this.verts[i].y) / edgeLen;
            overts[cf++] = new THREE.Vector3(
                this.verts[i].x + dy * oscale + (offset ? offset.x : 0) - zcenter.x,
                this.verts[i].y - dx * oscale + (offset ? offset.y : 0) - zcenter.y, 
                0.001
            );
            overts[cf++] = new THREE.Vector3(
                this.verts[j].x + dy * oscale + (offset ? offset.x : 0) - zcenter.x,
                this.verts[j].y - dx * oscale + (offset ? offset.y : 0) - zcenter.y, 
                0.001
            );
        }
        var cvert = new THREE.Vector3(
            (offset?offset.x:0),
            (offset?offset.y:0),
            -0.001
        );
        len *= 2;

        var OUTER = function(idx) { return idx+1; };

        this.geom = new THREE.Geometry();

        var vertices = this.geom.vertices;
        vertices.length = len + 1;
        vertices[0] = cvert;
        for (var i=0; i<len; i++) {
            vertices[OUTER(i)] = overts[i];
        }

        var faces = this.geom.faces;
        faces.length = len;
        for (var i=0; i<len; i++) {
            var j = (i+1) % len;
            faces[i] = new THREE.Face3(OUTER(i), OUTER(j), 0);
        }

        this.geom.computeFaceNormals();
        this.geom = new THREE.BufferGeometry().fromGeometry(this.geom);
        this.geom.computeBoundingSphere();
        this.geom.needsUpdate = true;
        BSWG.bpmGeomCache[key] = this.geom;
    }
    else {
        this.geom = cacheGeom;
    }

    if (!BSWG.dummyMat) {
        BSWG.dummyMat = BSWG.render.newMaterial("basicVertex", "shadowFragment");
    }

    this.mat = BSWG.dummyMat;
    this.mesh = new THREE.Mesh( this.geom, this.mat );
    this.mesh.needsUpdate = true;
    this.clr = new THREE.Vector4(0.5, 1.0, 0.5, 0.0);

    this.mobj = BSWG.componentList.compSelMesh.add(this.mesh);

    this.update();
}

BSWG.blockPolyOutline.prototype.update = function(clr) {

    var matrix = this.mesh.matrix;

    var center = this.body.GetWorldCenter(),
        angle  = this.body.GetAngle();

    var offset = BSWG.drawBlockPolyOffset || null;

    this.mesh.position.x = center.x + (offset?offset.x:0);
    this.mesh.position.y = center.y + (offset?offset.y:0);
    this.mesh.position.z = -0.05;
    this.mesh.rotation.z = angle;
    this.mesh.updateMatrix();

    if (clr) {
        this.clr.set(clr[0], clr[1], clr[2], clr[3]);
    }

    if (this.obj && this.obj.comp && this.obj.comp.onCC && this.obj.comp.onCC.defenseScreen) {
        var t = Math.clamp(this.obj.comp.onCC.defenseScreen, 0, 1);
        var c = this.clr;
        c.set(c.x*(1-t)+t*0.2, c.y*(1-t)+t*0.2, c.z*(1-t)+t, Math.max(t*0.75, c.w));
    }

    BSWG.componentList.compSelMesh.setArgs(this.mobj, this.clr, this.mesh.position, this.mesh.rotation.z);
};

BSWG.blockPolyOutline.prototype.destroy = function() {

    BSWG.componentList.compSelMesh.remove(this.mobj);
    this.mobj = null;
    this.mesh.geometry = null;
    this.mesh.material = null;
    this.mesh = null;
    this.mat = null;
    this.geom = null;

};

BSWG.genereteBlockPolyOutline = function(obj, zcenter, oscale) {

    return new BSWG.blockPolyOutline(obj, zcenter, oscale);

};

BSWG.drawBlockPolyOffset = null;
BSWG.drawBlockPoly = function(ctx, obj, iscale, zcenter, outline) {

    var body = obj.body, verts = obj.verts;
    if (!zcenter) zcenter = body.GetLocalCenter();

    var overts = BSWG.physics.localToWorld(verts, body);
    var iverts = new Array(verts.length),
        len = verts.length;
    for (var i=0; i<len; i++) {
        var vec = new b2Vec2(
            (verts[i].x - zcenter.x) * iscale + zcenter.x,
            (verts[i].y - zcenter.y) * iscale + zcenter.y
        );
        iverts[i] = BSWG.physics.localToWorld(vec, body);
        if (BSWG.drawBlockPolyOffset) {
            iverts[i].x += BSWG.drawBlockPolyOffset.x;
            iverts[i].y += BSWG.drawBlockPolyOffset.y;
            overts[i].x += BSWG.drawBlockPolyOffset.x;
            overts[i].y += BSWG.drawBlockPolyOffset.y;
        }
    }

    ctx.save();

    overts = BSWG.render.project3D(overts, 0.0);
    iverts = BSWG.render.project3D(iverts, 0.0);

    ctx.beginPath();
    ctx.moveTo(overts[0].x, overts[0].y);
    for (var i=1; i<len; i++) {
        ctx.lineTo(overts[i].x, overts[i].y);
    }
    ctx.closePath();
    ctx.fill();

    if (outline) {
        ctx.strokeStyle = 'rgba(155,255,155,0.65)';
        ctx.lineWidth = 3.0;
        ctx.stroke();
        ctx.lineWidth = 1.0;
    }

    var oAlpha = parseFloat(ctx.globalAlpha);
    ctx.fillStyle = '#fff';

    for (var i=0; i<len; i++) {
        var j = (i+1) % len;

        var a = overts[i], b = overts[j],
            c = iverts[j], d = iverts[i];

        var angle = Math.atan2(b.y - a.y, b.x - a.x);
        var alpha = Math.sin(angle) * 0.5 + 0.5;
        ctx.globalAlpha = oAlpha * alpha * 0.6;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);
        ctx.closePath();
        ctx.fill();
    }

    ctx.beginPath();
    ctx.globalAlpha = 0.65;
    ctx.moveTo(iverts[0].x, iverts[0].y);
    for (var i=1; i<len; i++) {
        ctx.lineTo(iverts[i].x, iverts[i].y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();

};