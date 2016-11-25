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

BSWG.blockPolyMesh = function(obj, iscale, zcenter, zoffset, depth) {
    if (!BSWG.bpmMatCache) {
        BSWG.bpmMatCache = new Array(BSWG.bpmMatCacheISize);
        for (var i=0; i<BSWG.bpmMatCache.length; i++) {
            BSWG.bpmMatCache[i] = {
                mat: BSWG.render.newMaterial("basicVertex2", "basicFragment2", {
                    clr: {
                        type: 'v4',
                        value: new THREE.Vector4(0.2, 0.2, 0.2, 1.0)
                    },
                    map: {
                        type: 't',
                        value: BSWG.render.images['test_nm'].texture
                    },
                    dmgMap: {
                        type: 't',
                        value: BSWG.render.images['damage_nm'].texture
                    },
                    extra: {
                        type: 'v4',
                        value: new THREE.Vector4(1,0,0,0)
                    },
                    shadowMatrix: {
                        type: 'm4',
                        value: BSWG.render.shadowMatrix
                    },
                    shadowMap: {
                        type: 't',
                        value: BSWG.render.shadowMap.depthTexture
                    },
                    warpIn: {
                        type: 'f',
                        value: 1.0
                    },
                    vreflect: {
                        type: 'f',
                        value: BSWG.bpmReflect
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
                }),
                matS: BSWG.render.newMaterial("basicVertex", "shadowFragment", {
                    strength: {
                        type: 'f',
                        value: 1.0
                    }                    
                }),
                used: false
            };
        }
    }

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
        //if (BSWG.bpmSmoothNormals) {
            this.geom.computeVertexNormals();
        //}
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

    var matIdx = -1;
    for (var i=0; i<BSWG.bpmMatCache.length; i++) {
        if (!BSWG.bpmMatCache[i].used) {
            matIdx = i;
            break;
        }
    }
    this.reflect = BSWG.bpmReflect;
    if (matIdx < 0) {
        BSWG.bpmMatCache.push({
            mat: BSWG.render.newMaterial("basicVertex2", "basicFragment2", {
                clr: {
                    type: 'v4',
                    value: new THREE.Vector4(0.2, 0.2, 0.2, 1.0)
                },
                map: {
                    type: 't',
                    value: BSWG.render.images['test_nm'].texture
                },
                dmgMap: {
                    type: 't',
                    value: BSWG.render.images['damage_nm'].texture
                },
                extra: {
                    type: 'v4',
                    value: new THREE.Vector4(1,0,0,0)
                },
                shadowMatrix: {
                    type: 'm4',
                    value: BSWG.render.shadowMatrix
                },
                shadowMap: {
                    type: 't',
                    value: BSWG.render.shadowMap.depthTexture
                },
                warpIn: {
                    type: 'f',
                    value: 1.0
                },
                vreflect: {
                    type: 'f',
                    value: BSWG.bpmReflect
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
            }),
            matS: BSWG.render.newMaterial("basicVertex", "shadowFragment", {
            }),
            used: false
        });
        matIdx = BSWG.bpmMatCache.length - 1;
    }

    this.mat = BSWG.bpmMatCache[matIdx].mat;
    this.mat.uniforms.envMap.value = BSWG.render.envMap.texture;
    this.mat.uniforms.vreflect.value = BSWG.bpmReflect;
    this.mesh = new THREE.Mesh(this.geom, this.mat);

    this.matS = BSWG.bpmMatCache[matIdx].matS;
    this.meshS = new THREE.Mesh(this.geom, this.matS);

    BSWG.render.sceneS.add( this.meshS );

    this.mat.uniforms.warpIn.value = 1.0;
    this.mat.uniforms.clr.value.set(0.2, 0.2, 0.2, 1.0);
    this.mat.uniforms.extra.value.set(1,0,0,0);

    //this.mat.needsUpdate = true;
    this.mesh.needsUpdate = true;
    this.meshS.needsUpdate = true;

    BSWG.render.scene.add( this.mesh );

    BSWG.bpmMatCache[matIdx].used = true;
    this.matIdx = matIdx;

    this.anchorT = 0.0;

    this.enemyT = 0.0;
    this.lclr = null;

    this.update();

    BSWG.bpmSmoothNormals = false;
    BSWG.bpmRotating = false;

}

BSWG.blockPolyMesh.prototype.update = function(clr, texScale, anchor, exRot, center) {

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

    var meshS = this.meshS;
    position = meshS.position;

    position.x = center.x + (offset?offset.x:0);
    position.y = center.y + (offset?offset.y:0);
    position.z = this.zoffset;
    meshS.rotation.z = angle + (exRot || 0);
    meshS.updateMatrix(true);
    meshS.updateMatrixWorld(true);

    var uniforms = this.mat.uniforms;

    uniforms.extra.value.x = texScale || 1.0;

    if (anchor && (!comp || comp.onCC === BSWG.game.ccblock)) {
        this.anchorT += (1.0 - this.anchorT) * 0.25;
    }
    else {
        this.anchorT += (0.0 - this.anchorT) * 0.25;   
    }

    uniforms.extra.value.y = Math.clamp(this.anchorT, 0, 1);
    uniforms.extra.value.z = BSWG.render.time;
    var dmg = comp ? (1.0 - (comp.hp / comp.maxHP)) : 0.0;

    uniforms.extra.value.w = dmg;
    uniforms.viewport.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);

    uniforms.envMapT.value = BSWG.render.envMapT;

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

    uniforms.warpIn.value -= BSWG.render.dt * 2.0;
    if (uniforms.warpIn.value < 0.0) {
        uniforms.warpIn.value = 0.0;
    }

    if (BSWG.game.storeMode && !BSWG.game.editMode && comp && comp.onCC === null && comp.type !== 'missile') {
        if (uniforms.warpIn.value < 0.25) {
            uniforms.warpIn.value += 0.6;
        }
    }

    if (clr) {
        uniforms.clr.value.set(clr[0], clr[1], clr[2], clr[3]);
        this.lclr = clr;
    }

    if (this.lclr) {
        var t = this.enemyT * 0.5;
        var clr2 = uniforms.clr.value;
        var br = this.lclr[0], bg = this.lclr[1], bb = this.lclr[2];
        var r = 1, g = 0, b = 0;
        if (BSWG.game.bossFight) {
            r = 0.2;
            g = b = -0.07;
            uniforms.vreflect.value = this.reflect * 0.125;
        }
        else {
            uniforms.vreflect.value = this.reflect;
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
        clr2.set(br * (1-t) + t * r, bg * (1-t) + t * g, bb * (1-t) + t * b, this.lclr[3]*(1-this.mat.uniforms.warpIn.value));
    }
    else {
        uniforms.vreflect.value = this.reflect;
    } 

    BSWG.bpmReflect = BSWG.bpmReflectDefault;
};

BSWG.blockPolyMesh.prototype.destroy = function() {

    BSWG.bpmMatCache[this.matIdx].used = false;

    BSWG.render.scene.remove( this.mesh );
    BSWG.render.sceneS.remove( this.meshS );

    //this.mesh.geometry.dispose();
    //this.mesh.material.dispose();
    this.mesh.geometry = null;
    this.mesh.material = null;
    this.mesh = null;
    this.mat = null;
    this.geom = null;

    //this.meshS.material.dispose();
    this.meshS.material = null;
    this.meshS.geometry = null;
    this.meshS = null;

};


BSWG.generateBlockPolyMesh = function(obj, iscale, zcenter, zoffset, depth) {

    return new BSWG.blockPolyMesh(obj, iscale, zcenter, zoffset, depth);

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

    this.mat = BSWG.render.newMaterial("basicVertex", "selectionFragment", {
        clr: {
            type: 'v4',
            value: new THREE.Vector4(0.5, 1.0, 0.5, 0.0)
        },
        warp: {
            type: 'v4',
            value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
        }
    }, THREE.NormalBlending, false);
    this.mesh = new THREE.Mesh( this.geom, this.mat );

    this.mat.needsUpdate = true;
    this.mesh.needsUpdate = true;
    this.mesh.renderOrder = 1400.0;

    BSWG.render.scene.add( this.mesh );

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
        this.mat.uniforms.clr.value.set(clr[0], clr[1], clr[2], clr[3]);
        if (clr[3] > 0) {
            this.mesh.visible = true;
        }
        else {
            this.mesh.visible = false;
        }
    }

    if (this.obj && this.obj.comp && this.obj.comp.onCC && this.obj.comp.onCC.defenseScreen) {
        var t = Math.clamp(this.obj.comp.onCC.defenseScreen, 0, 1);
        var c = this.mat.uniforms.clr.value;
        c.set(c.x*(1-t)+t*0.2, c.y*(1-t)+t*0.2, c.z*(1-t)+t, Math.max(t*0.75, c.w));
        if (c.w > 0) {
            this.mesh.visible = true;
        }
    }

    //this.mat.needsUpdate = true;
};

BSWG.blockPolyOutline.prototype.destroy = function() {

    BSWG.render.scene.remove( this.mesh );

    //this.mesh.geometry.dispose();
    this.mesh.material.dispose();
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