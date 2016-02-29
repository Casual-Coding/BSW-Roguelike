// BlockShip Wars Rougelike - Helper functions for jpoints (weld points)

BSWG.maxJPointsRender = 192;
BSWG.jpointRenderer = new function() {

    var baseLen, geom, len, posArray, clrArray, mat, mesh, vertices, faces;
    var hasInit = false;

    this.init = function () {

        hasInit = true;

        baseLen = 5;

        len = BSWG.maxJPointsRender * baseLen * 3;
        vertices = new Float32Array(len);
        var k = 0;
        for (var i=0; i<BSWG.maxJPointsRender; i++) {
            vertices[k++] =  0.0; vertices[k++] = -1.0; vertices[k++] =  0.0;
            vertices[k++] =  1.0; vertices[k++] =  0.0; vertices[k++] =  0.0;
            vertices[k++] =  0.0; vertices[k++] =  1.0; vertices[k++] =  0.0;
            vertices[k++] = -1.0; vertices[k++] =  0.0; vertices[k++] =  0.0;
            vertices[k++] =  0.0; vertices[k++] =  0.0; vertices[k++] =  0.5;
        }

        len = BSWG.maxJPointsRender * baseLen * 4;
        posArray = new Float32Array(len);
        clrArray = new Float32Array(len);
        for (var i=0; i<len; i++) {
            posArray[i] = 0.0; // x,y,angle,radius
            clrArray[i] = 0.0; // r,g,b,a
        }

        len = BSWG.maxJPointsRender * 4 * 3;
        faces = new Uint32Array(len);
        var k = 0;
        for (var i=0; i<BSWG.maxJPointsRender; i++) {
            var j = i * baseLen;
            faces[k++] = j+0; faces[k++] = j+1; faces[k++] = j+2;
            faces[k++] = j+0; faces[k++] = j+2; faces[k++] = j+3;
            faces[k++] = j+0; faces[k++] = j+3; faces[k++] = j+4;
            faces[k++] = j+0; faces[k++] = j+4; faces[k++] = j+1;
        }

        geom = new THREE.BufferGeometry();
        geom.setIndex( new THREE.BufferAttribute( faces, 1 ) );
        geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        geom.addAttribute( 'pos',      new THREE.BufferAttribute( posArray, 4 ) );
        geom.addAttribute( 'clr',      new THREE.BufferAttribute( clrArray, 4 ) );

        mat = BSWG.render.newMaterial("jpointsVertex", "jpointsFragment");
        mesh = new THREE.Mesh( geom, mat );
        mesh.position.z = 0.05;

        geom.needsUpdate = true;
        mat.needsUpdate = true;
        mesh.needsUpdate = true;

        BSWG.render.scene.add( mesh );

    };

    this.render = function () {

        if (!hasInit) {
            this.init();
        }

        var pos = new THREE.Vector4(0,0,0,0);
        var clr = new THREE.Vector4(0,0,0,0);

        var posAttr = geom.getAttribute('pos');
        var clrAttr = geom.getAttribute('clr');

        posArray = posAttr.array;
        clrArray = clrAttr.array;

        var compList = new Array();
        for (var i=0; i<BSWG.componentList.compList.length; i++) {
            compList.push(BSWG.componentList.compList[i]);
        }
        var comp0center = new b2Vec2(BSWG.game.cam.x, BSWG.game.cam.y);
        compList.sort(function(a, b){

            var diff = Math.distSqVec2(comp0center, a.obj.body.GetWorldCenter()) - 
                       Math.distSqVec2(comp0center, b.obj.body.GetWorldCenter());

            if (diff < 0) {
                return -1;
            }
            else if (diff > 0) {
                return 1;
            }
            return 0;

        });

        mesh.position.x = comp0center.x;
        mesh.position.y = comp0center.y;
        mesh.updateMatrix();

        var idx = 0;
        var idxWidth = baseLen * 4;
        for (var i=0; i<compList.length && idx<BSWG.maxJPointsRender; i++) {
            var comp = compList[i];
            if (comp.jpointsw) {
                var map = {};
                for (var j=0; j<comp.jmatch.length; j++) {
                    map[comp.jmatch[j][0]] = comp.jmatch[j][1].jpointsw[comp.jmatch[j][2]];
                }

                var jp = comp.jpointsw;
                for (var j=0; j<jp.length; j++) {
                    if (!BSWG.game.editMode && !comp.welds[j]) {
                        continue;
                    }

                    var r = map[j]?(comp.jmhover===j?160:110):80;
                    if (comp.welds[j] && comp.jmhover !== j) {
                        r = 110;
                    }

                    if (comp.welds[j]) {
                        if (comp.jmhover === j) {
                            clr.set(1.0, 0.1, 0.1, 1.0);
                        }
                        else {
                            clr.set(0.75, 0.75, 1.0, 1.0);
                        }
                    }
                    else {
                        if (map[j]) {
                            if (comp.jmhover === j) {
                                clr.set(0.1, 1.0, 0.1, 1.0);
                            }
                            else {
                                clr.set(0.4, 1.0, 0.4, 1.0);
                            }
                        }
                        else {
                            clr.set(0.8, 0.8, 0.8, 1.0);
                        }
                    }

                    pos.set(
                        jp[j].x - comp0center.x,
                        jp[j].y - comp0center.y,
                        comp.obj.body.GetAngle(),
                        r/1250.0
                    );

                    for (var k=0; k<baseLen; k++) {
                        var k2 = k*4 + idx*idxWidth;
                        var f = k<2 ? 1.0 : 0.65;
                        clrArray[k2+0] = clr.x * f;
                        clrArray[k2+1] = clr.y * f;
                        clrArray[k2+2] = clr.z * f;
                        clrArray[k2+3] = clr.w;
                        posArray[k2+0] = pos.x;
                        posArray[k2+1] = pos.y;
                        posArray[k2+2] = pos.z;
                        posArray[k2+3] = pos.w;
                    }
                    idx += 1;
                }
            }
        }
        for (; idx<BSWG.maxJPointsRender; idx++) {
            var k = idx*idxWidth;
            for (var i=0; i<idxWidth; i++) {
                clrArray[k+i] = 0.0;
                posArray[k+i] = 0.0;
            }
        }

        clrAttr.needsUpdate = true;
        posAttr.needsUpdate = true;
    };

}();

BSWG.addJPointsForSeg = function(jp, a, b, boxMethod) {

    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt(dx*dx + dy*dy);
    dx /= len;
    dy /= len;

    if (boxMethod) {
        if (!(Math.floor(len)%2)) {
            jp.push(new b2Vec2(a.x + dx * len * 0.5, a.y + dy * len * 0.5));
        }
        for (var i=0; i<len; i++) {
            jp.push(new b2Vec2(a.x + dx * 0.5 + i * dx, a.y + dy * 0.5 + i * dy));
        }
    }
    else {
        for (var i=0; i<Math.max(0.9, len*0.5-0.5); i+=1.0) {
            if (i === 0) {
                jp.push(new b2Vec2(a.x + dx * len * 0.5, a.y + dy * len * 0.5));
            }
            else {
                jp.push(new b2Vec2(a.x + dx * len * 0.5 - i * dx, a.y + dy * len * 0.5 - i * dy));
                jp.push(new b2Vec2(a.x + dx * len * 0.5 + i * dx, a.y + dy * len * 0.5 + i * dy));
            }
        }
    }

};

BSWG.createPolyJPoints = function(verts, exclude, boxMethod) {

    var jp = new Array();
    var ex = {};

    if (exclude) {
        for (var i=0; i<exclude.length; i++) {
            ex[exclude[i]] = true;
        }
    }

    for (var i=0; i<verts.length; i++) {
        if (ex[i]) {
            continue;
        }
        BSWG.addJPointsForSeg(jp, verts[i], verts[(i+1)%verts.length], boxMethod);
    }

    return jp;

};

BSWG.createBoxJPoints = function(w, h, t) {

    var jp = new Array();

    if (t) {

        for (var y=0; y<h; y++) {
            jp.push(new b2Vec2(t*-w * 0.5, y - h * 0.5 + 0.5));
        }

        if (!(h%2)) {
            jp.push(new b2Vec2(t*-w * 0.5, 0.0));
        }

        for (var x=0; x<w; x++) {
            jp.push(new b2Vec2(x - w * 0.5 + 0.5,  h * 0.5));
        }

        if (!(w%2)) {
            jp.push(new b2Vec2(0.0,  h * 0.5));
        }

        var l = Math.sqrt(w*w + h*h);
        var dx = w/l, dy = h/l;
        var x0 = dx * 0.5 * l - w * 0.5, 
            y0 = dy * 0.5 * l - h * 0.5;
        if (t === -1) {
            x0 = -x0;
            dx = -dx;
        }

        jp.push(new b2Vec2(
            x0, y0
        ));

        for (var i=1.0; i<l*0.5 - 0.5; i+=1.0) {
            jp.push(new b2Vec2(
                x0 - dx * i,
                y0 - dy * i
            ));
            jp.push(new b2Vec2(
                x0 + dx * i,
                y0 + dy * i
            ));
        }

        return jp;

    };

    for (var y=0; y<h; y++) {
        jp.push(new b2Vec2(-w * 0.5, y - h * 0.5 + 0.5));
        jp.push(new b2Vec2( w * 0.5, y - h * 0.5 + 0.5));
    }

    if (!(h%2)) {
        jp.push(new b2Vec2(-w * 0.5, 0.0));
        jp.push(new b2Vec2( w * 0.5, 0.0));
    }

    for (var x=0; x<w; x++) {
        jp.push(new b2Vec2(x - w * 0.5 + 0.5, -h * 0.5));
        jp.push(new b2Vec2(x - w * 0.5 + 0.5,  h * 0.5));
    }

    if (!(w%2)) {
        jp.push(new b2Vec2(0.0, -h * 0.5));
        jp.push(new b2Vec2(0.0,  h * 0.5));
    }

    return jp;

};