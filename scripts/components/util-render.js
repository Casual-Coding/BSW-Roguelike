BSWG.polyMesh_baseHeight = 0.5;
BSWG.blockPolySmooth     = null;

BSWG.generateBlockPolyMesh = function(obj, iscale, zcenter, zoffset, depth) {

    var ret = new Object();

    var body  = obj.body,
        verts = obj.verts;

    if (BSWG.blockPolySmooth) {
        verts = Math.smoothPoly(verts, BSWG.blockPolySmooth);
    }

    var len = verts.length;

    var offset = null;

    if (!zcenter) {
        zcenter = body.GetLocalCenter();
    }
    else {
        var bc = body.GetLocalCenter()
        offset = new b2Vec2(zcenter.x-bc.x, zcenter.y-bc.y);
    }

    if (!zoffset) {
        zoffset = 0.0;
    }

    zoffset *= BSWG.polyMesh_baseHeight;

    if (!depth) {
        var total = 1000.0;
        for (var i=0; i<len; i++) {
            total = Math.min(total, Math.distVec2(verts[i], zcenter));
        }
        depth = total * 0.3;
    }

    depth *= BSWG.polyMesh_baseHeight;

    var overts = new Array(len),
        iverts = new Array(len),
        mverts = new Array(len);
    for (var i=0; i<len; i++) {
        overts[i] = new THREE.Vector3(
            verts[i].x - zcenter.x + (offset?offset.x:0),
            verts[i].y - zcenter.y + (offset?offset.y:0),
            0.0
        );
        mverts[i] = new THREE.Vector3(
            (verts[i].x - zcenter.x) * (iscale*0.1+0.9) + (offset?offset.x:0),
            (verts[i].y - zcenter.y) * (iscale*0.1+0.9) + (offset?offset.y:0),
            depth*0.35
        );
        iverts[i] = new THREE.Vector3(
            (verts[i].x - zcenter.x) * iscale + (offset?offset.x:0),
            (verts[i].y - zcenter.y) * iscale + (offset?offset.y:0),
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

    ret.geom = new THREE.Geometry();

    var vertices = ret.geom.vertices;
    vertices.length = len*3 + 1;
    vertices[0] = cvert;
    for (var i=0; i<len; i++) {
        vertices[OUTER(i)] = overts[i];
        vertices[MIDDLE(i)] = mverts[i];
        vertices[INNER(i)] = iverts[i];
    }

    var faces = ret.geom.faces;
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

    ret.geom.computeFaceNormals();
    //ret.geom.computeVertexNormals();
    ret.geom.computeBoundingSphere();

    ret.mat = BSWG.render.newMaterial("basicVertex", "basicFragment", {
        clr: {
            type: 'v4',
            value: new THREE.Vector4(0.2, 0.2, 0.2, 1.0)
        },
        light: {
            type: 'v4',
            value: new THREE.Vector4(BSWG.game.cam.x, BSWG.game.cam.y, 20.0, 1.0)
        },
        map: {
            type: 't',
            value: BSWG.render.images['test_nm'].texture
        },
        extra: {
            type: 'v4',
            value: new THREE.Vector4(1,0,0,0)
        },
        warpIn: {
            type: 'f',
            value: 1.0
        }
    });
    ret.mesh = new THREE.Mesh( ret.geom, ret.mat );

    ret.geom.needsUpdate = true;
    ret.mat.needsUpdate = true;
    ret.mesh.needsUpdate = true;

    BSWG.render.scene.add( ret.mesh );

    var self = ret;

    self.anchorT = 0.0;

    self.enemyT = 0.0;
    self.lclr = null;

    ret.update = function(clr, texScale, anchor) {

        if (obj && obj.comp) {
            if (obj.comp.onCC && (obj.comp.onCC !== BSWG.game.ccblock || obj.comp.onCC.ai)) {
                self.enemyT += (1 - self.enemyT) * BSWG.render.dt;
            }
            else {
                self.enemyT += (0 - self.enemyT) * BSWG.render.dt;
            }
        }

        var matrix = self.mesh.matrix;

        var center = body.GetWorldCenter(),
            angle  = body.GetAngle();

        var offset = BSWG.drawBlockPolyOffset || null;

        self.mesh.position.x = center.x + (offset?offset.x:0);
        self.mesh.position.y = center.y + (offset?offset.y:0);
        self.mesh.position.z = zoffset;

        self.mesh.rotation.z = angle;

        self.mesh.updateMatrix();

        var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);

        self.mat.uniforms.light.value.x = lp.x;
        self.mat.uniforms.light.value.y = lp.y;
        self.mat.uniforms.light.value.z = BSWG.render.cam3D.position.z * 7.0;

        self.mat.uniforms.extra.value.x = texScale || 1.0;

        if (anchor) {
            self.anchorT += (1.0 - self.anchorT) * 0.25;
        }
        else {
            self.anchorT += (0.0 - self.anchorT) * 0.25;   
        }

        self.mat.uniforms.extra.value.y = Math.clamp(self.anchorT, 0, 1);
        self.mat.uniforms.extra.value.z = BSWG.render.time;

        self.mat.uniforms.warpIn.value -= BSWG.render.dt * 2.0;
        if (self.mat.uniforms.warpIn.value < 0.0) {
            self.mat.uniforms.warpIn.value = 0.0;
        }

        if (clr) {
            self.mat.uniforms.clr.value.set(clr[0], clr[1], clr[2], clr[3]);
            self.lclr = clr;
        }

        if (self.lclr) {
            var t = self.enemyT * 0.25;
            var clr2 = self.mat.uniforms.clr.value;
            clr2.set(self.lclr[0] * (1-t) + t * 2, self.lclr[1] * (1-t), self.lclr[2] * (1-t), self.lclr[3]);
        }

        self.mat.needsUpdate = true;
    };

    ret.destroy = function() {

        BSWG.render.scene.remove( self.mesh );

        self.mesh.geometry.dispose();
        self.mesh.material.dispose();
        self.mesh.geometry = null;
        self.mesh.material = null;
        self.mesh = null;
        self.mat = null;
        self.geom = null;

    };

    ret.update();

    return ret;

};

BSWG.genereteBlockPolyOutline = function(obj, zcenter, oscale) {

    oscale = 0.1;

    var ret = new Object();

    var body  = obj.body,
        verts = obj.verts;

    /*if (BSWG.blockPolySmooth) {
        verts = Math.smoothPoly(verts, BSWG.blockPolySmooth);
    }*/

    var len = verts.length;

    var offset = null;

    if (!zcenter) {
        zcenter = body.GetLocalCenter();
    }
    else {
        var bc = body.GetLocalCenter();
        offset = new b2Vec2(zcenter.x-bc.x, zcenter.y-bc.y);
    }

    var overts = new Array(len*2),
        cf = 0;
    for (var i=0; i<len; i++) {
        var j = (i+1) % len;
        var edgeLen = Math.distVec2(verts[i], verts[j]);
        var dx = (verts[j].x - verts[i].x) / edgeLen;
        var dy = (verts[j].y - verts[i].y) / edgeLen;
        overts[cf++] = new THREE.Vector3(
            verts[i].x + dy * oscale + (offset ? offset.x : 0) - zcenter.x,
            verts[i].y - dx * oscale + (offset ? offset.y : 0) - zcenter.y, 
            0.001
        );
        overts[cf++] = new THREE.Vector3(
            verts[j].x + dy * oscale + (offset ? offset.x : 0) - zcenter.x,
            verts[j].y - dx * oscale + (offset ? offset.y : 0) - zcenter.y, 
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

    ret.geom = new THREE.Geometry();

    var vertices = ret.geom.vertices;
    vertices.length = len + 1;
    vertices[0] = cvert;
    for (var i=0; i<len; i++) {
        vertices[OUTER(i)] = overts[i];
    }

    var faces = ret.geom.faces;
    faces.length = len;
    for (var i=0; i<len; i++) {
        var j = (i+1) % len;
        faces[i] = new THREE.Face3(OUTER(i), OUTER(j), 0);
    }

    ret.geom.computeFaceNormals();
    ret.geom.computeBoundingSphere();

    ret.mat = BSWG.render.newMaterial("basicVertex", "selectionFragment", {
        clr: {
            type: 'v4',
            value: new THREE.Vector4(0.5, 1.0, 0.5, 0.0)
        },
    }, THREE.NormalBlending, false);
    ret.mesh = new THREE.Mesh( ret.geom, ret.mat );

    ret.geom.needsUpdate = true;
    ret.mat.needsUpdate = true;
    ret.mesh.needsUpdate = true;

    BSWG.render.scene.add( ret.mesh );

    var self = ret;

    ret.update = function(clr) {

        var matrix = self.mesh.matrix;

        var center = body.GetWorldCenter(),
            angle  = body.GetAngle();

        var offset = BSWG.drawBlockPolyOffset || null;

        self.mesh.position.x = center.x + (offset?offset.x:0);
        self.mesh.position.y = center.y + (offset?offset.y:0);
        self.mesh.position.z = -0.05;

        self.mesh.rotation.z = angle;

        self.mesh.updateMatrix();

        if (clr) {
            self.mat.uniforms.clr.value.set(clr[0], clr[1], clr[2], clr[3]);
            if (clr[3] > 0) {
                self.mesh.visible = true;
            }
            else {
                self.mesh.visible = false;
            }
        }

        self.mat.needsUpdate = true;
    };

    ret.destroy = function() {

        BSWG.render.scene.remove( self.mesh );

        self.mesh.geometry.dispose();
        self.mesh.material.dispose();
        self.mesh.geometry = null;
        self.mesh.material = null;
        self.mesh = null;
        self.mat = null;
        self.geom = null;

    };

    ret.update();

    return ret;

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