BSWG.tileSize = 80;
BSWG.tileMeshSize = 80;
BSWG.tileSizeWorld = 48.0;
BSWG.tileHeightWorld = 32.0;
BSWG.minimapTileSize = 4;

BSWG.tMask = {
    L: 1,
    R: 2,
    U: 4,
    D: 8
};

BSWG.tile = function (image, imgX, imgY, tileMask, color, water, nmap, nmapScale, nmapAmp, reflect, zscale) {

    var _color = [ color[0], color[1], color[2], color[3] ];

    if (!reflect && reflect !== 0.0) {
        reflect = 0.125;
    }

    var self = this;
    this.heightMap = new Float32Array(BSWG.tileSize * BSWG.tileSize);

    this.normalMap = BSWG.render.proceduralImage(BSWG.tileSize, BSWG.tileSize, function(ctx, w, h){
        ctx.drawImage(image, imgX, imgY, BSWG.tileSize, BSWG.tileSize, 0, 0, BSWG.tileSize, BSWG.tileSize);
        var imgData = ctx.getImageData(0, 0, w, h);
        for (var i=0; i<imgData.data.length; i+=4) {
            self.heightMap[~~(i/4)] = imgData.data[i+0];
        }
        imgData.data.length = 0;
        imgData = null;
    }, true);

    var mSize = water ? 2 : BSWG.tileMeshSize;
    this.geom = new THREE.PlaneBufferGeometry(BSWG.tileSizeWorld, BSWG.tileSizeWorld, mSize, mSize);
    var verts = this.geom.attributes.position;
    var norms = this.geom.attributes.normal;

    var gSize = BSWG.tileSize / mSize;
    var sSize = BSWG.tileSizeWorld / BSWG.tileSize;

    if (water) {
        //sSize *= 10.0;
    }

    var offset = 0;

    for (var iy = 0; iy <= BSWG.tileSize; iy += gSize) {
        for (var ix = 0; ix <= BSWG.tileSize; ix += gSize) {

            var x = (ix * sSize - sSize*0.5) * (1 + (water ? 0 : 1.00005 / BSWG.tileSize));
            var y = (-(iy * sSize - sSize*0.5)) * (1 + (water ? 0 : 1.00005 / BSWG.tileSize));

            var x2 = ~~(ix / (BSWG.tileSize) * (BSWG.tileSize-0.001));
            var y2 = ~~(iy / (BSWG.tileSize) * (BSWG.tileSize-0.001));

            var z = zscale * BSWG.tileHeightWorld * self.heightMap[x2 + y2*BSWG.tileSize]/255;

            verts.array[offset+0] = x;
            verts.array[offset+1] = y;
            verts.array[offset+2] = z;
          
            offset += 3;
        }
    }

    this.geom.computeVertexNormalsTile = function () {

        var index = this.index;
        var attributes = this.attributes;
        var groups = this.groups;

        if ( attributes.position ) {

            var positions = attributes.position.array;

            if ( attributes.normal === undefined ) {

                this.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( positions.length ), 3 ) );

            } else {

                // reset existing normals to zero

                var array = attributes.normal.array;

                for ( var i = 0, il = array.length; i < il; i ++ ) {

                    array[ i ] = 0;

                }

            }

            var normals = attributes.normal.array;

            var vA, vB, vC,

            pA = new THREE.Vector3(),
            pB = new THREE.Vector3(),
            pC = new THREE.Vector3(),

            cb = new THREE.Vector3(),
            ab = new THREE.Vector3();

            var indices = index.array;

            if ( groups.length === 0 ) {

                this.addGroup( 0, indices.length );

            }

            for ( var j = 0, jl = groups.length; j < jl; ++ j ) {

                var group = groups[ j ];

                var start = group.start;
                var count = group.count;

                var mask = tileMask;

                var x2=0, y2=0;
                var _f = 1 + (water ? 0 : 1.005 / BSWG.tileSize);
                var _c1 = (mask & 1) && (mask & 2);
                var _c2 = (mask & 2) && (mask & 1);
                var _c3 = (mask & 4) && (mask & 8);
                var _c4 = (mask & 8) && (mask & 4);

                var V = function(X, Y, ret) {

                    X *= gSize;
                    Y *= gSize;

                    ret.x = (X * sSize - sSize*0.5) * _f;
                    ret.y = -(Y * sSize - sSize*0.5) * _f;

                    if (_c1 && X<0) {
                        X = (((X/gSize) + (mSize+1) * 100) % (mSize+1)) * gSize;
                    }
                    else if (X<0) {
                        X = 0;
                    }

                    if (_c2 && (X/gSize)>mSize) {
                        X = (((X/gSize) + (mSize+1) * 100) % (mSize+1)) * gSize;
                    }

                    else if ((X/gSize)>mSize) {
                        X = mSize*gSize;
                    }

                    if (_c3 && Y<0) {
                        Y = (((Y/gSize) + (mSize+1) * 100) % (mSize+1)) * gSize;
                    }
                    else if (Y<0) {
                        Y = 0;
                    }

                    if (_c4 && (Y/gSize)>mSize) {
                        Y = (((Y/gSize) + (mSize+1) * 100) % (mSize+1)) * gSize;
                    }
                    else if ((Y/gSize)>mSize) {
                        Y = mSize*gSize;
                    }

                    x2 = ~~(X / BSWG.tileSize * (BSWG.tileSize-0.001));
                    y2 = ~~(Y / BSWG.tileSize * (BSWG.tileSize-0.001));

                    ret.z = BSWG.tileHeightWorld * self.heightMap[x2 + y2*BSWG.tileSize]/255;

                };

                var off = [
                    [  1,  0 ],
                    [  1, -1 ],
                    [  0, -1 ],
                    [ -1, -1 ],
                    [ -1,  0 ],
                    [ -1,  1 ],
                    [  0,  1 ],
                    [  1,  1 ]
                ];

                var idx = 0;
                for (var y = 0; y <= mSize; y++) {
                    for (var x = 0; x <= mSize; x++) {

                        for (var i=0; i<off.length; i++) {
                            var j = (i+1)%off.length;
                            V(x, y, pA);
                            V(x + off[i][0], y + off[i][1], pB);
                            V(x + off[j][0], y + off[j][1], pC);

                            cb.subVectors( pC, pB );
                            ab.subVectors( pA, pB );
                            cb.cross( ab );

                            normals[ idx + 0 ] += cb.x;
                            normals[ idx + 1 ] += cb.y;
                            normals[ idx + 2 ] += cb.z;
                        }

                        idx += 3;
                    }
                }

            }

            this.normalizeNormals();

            attributes.normal.needsUpdate = true;

        }

    };

    this.geom.computeFaceNormals();
    this.geom.computeVertexNormalsTile();
    this.geom.computeBoundingBox();

    var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);

    if (!water) {
        this.shadowMat = BSWG.render.newMaterial("basicVertex", "shadowFragment", {});
    }

    if (water) {
        this.mat = BSWG.render.newMaterial("basicVertex2", "tileWaterFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(color[0], color[1], color[2], color[3])
            },
            exMap: {
                type: 't',
                value: BSWG.render.images['water_nm'].texture
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
            shadowMap: {
                type: 't',
                value: BSWG.render.shadowMap.depthTexture
            },
            shadowMatrix: {
                type: 'm4',
                value: BSWG.render.shadowMatrix
            },
            shadowViewMatrix: {
                type: 'm4',
                value: BSWG.render.shadowViewMatrix
            },
            extra: {
                type: 'v4',
                value: new THREE.Vector4(BSWG.render.time, 1., nmapAmp || 1.0, nmapScale || 1.0)
            },
            light: {
                type: 'v4',
                value: new THREE.Vector4(lp.x, lp.y, BSWG.render.cam3D.position.z * 7.0, 1.0)
            },
            viewport: {
                type: 'v2',
                value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
            },
            cam: {
                type: 'v3',
                value: new THREE.Vector3(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z)
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
    }
    else {
        this.mat = BSWG.render.newMaterial("basicVertex2", "tileFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(color[0], color[1], color[2], 1.0)
            },
            waterLevel: {
                type: 'f',
                value: BSWG.tileGWLevel
            },
            waterClr: {
                type: 'v4',
                value: new THREE.Vector4(BSWG.tileGWColor[0], BSWG.tileGWColor[1], BSWG.tileGWColor[2], BSWG.tileGWColor[3])
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
            vreflect: {
                type: 'f',
                value: reflect
            },
            light: {
                type: 'v4',
                value: new THREE.Vector4(lp.x, lp.y, BSWG.render.cam3D.position.z * 7.0, 1.0)
            },
            exMap: {
                type: 't',
                value: nmap || BSWG.render.images['grass_nm'].texture
            },
            shadowMatrix: {
                type: 'm4',
                value: BSWG.render.shadowMatrix
            },
            shadowViewMatrix: {
                type: 'm4',
                value: BSWG.render.shadowViewMatrix
            },
            shadowMap: {
                type: 't',
                value: BSWG.render.shadowMap.depthTexture
            },
            extra: {
                type: 'v4',
                value: new THREE.Vector4(BSWG.render.time, 0., nmapAmp || 1.0, nmapScale || 1.0)
            },
            viewport: {
                type: 'v2',
                value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
            },
            cam: {
                type: 'v3',
                value: new THREE.Vector3(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z)
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
        this.mat.needsUpdate = true;
    }

    this.time = Math.random()*1000;

    this.update = function(dt) {
        var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);
        this.mat.uniforms.light.value.set(lp.x, lp.y, BSWG.render.cam3D.position.z * 7.0, 1.0);
        this.mat.uniforms.extra.value.x = BSWG.render.time;
        this.mat.uniforms.viewport.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);
        this.mat.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z);
        this.mat.uniforms.envMap.value = BSWG.render.envMap.texture;
        this.mat.uniforms.envMapT.value = BSWG.render.envMapT;
        var darkt = 1 - 0.90 * BSWG.render.tileDark;
        color[0] = _color[0] * darkt;
        color[1] = _color[1] * darkt;
        color[2] = _color[2] * darkt;
        color[3] = _color[3] * darkt;
        //this.mat.uniforms.shadowMatrix.needsUpdate = true;
        //this.mat.uniforms.shadowMatrix.value.needsUpdate = true;
        if (this.flashColor) {
            var t = Math.pow(Math.sin(this.time*3.5)*0.5+0.5, 3.0);
            this.mat.uniforms.clr.value.set(color[0]*(1-t)+this.flashColor[0]*t, color[1]*(1-t)+this.flashColor[1]*t, color[2]*(1-t)+this.flashColor[2]*t, 1.0);
        }
        else {
            this.mat.uniforms.clr.value.set(color[0], color[1], color[2], water ? color[3] : 1);
        }
        //this.mat.needsUpdate = true;
        this.time += dt;
    };

    this.destroy = function() {
        this.geom.dispose();
        this.geom = null;
        this.mat.dispose();
        this.mat = null;
        this.heightMap.length = 0;
        this.heightMap = null;
        this.normalMap.destroy();
        this.normalMap = null;
    };

};

BSWG.tileGWLevel = -32;
BSWG.tileGWColor = null;

BSWG.tileMap = function (layers, zoff) {

    zoff = zoff || 0.0;

    this.layers = layers;
    this.sets = {};
    this.minimap = layers.minimap || null;
    if (this.minimap) {
        layers.minimap = null;
        delete layers['minimap'];
    }
    BSWG.tileGWLevel = (layers.water ? (layers.water.level * BSWG.tileHeightWorld * (layers.water.zscale || 1.0) - 10.0) : -32) + (zoff || 0) - 16.0;
    BSWG.tileGWColor = (layers.water ? layers.water.color : [0,0,0,0]) || [0,0,0,0];
    BSWG.tileGWColor = [ BSWG.tileGWColor[0], BSWG.tileGWColor[1], BSWG.tileGWColor[2], layers.water ? layers.water.reflect : 0.3 ];
    for (var set in layers) {
        if (layers[set].decals) {
            this.sets[set] = new BSWG.tileSet(layers[set].decals, layers[set].color, null, layers[set].normalMap, layers[set].normalMapScale, layers[set].normalMapAmp, layers[set].flashColor, layers[set].reflect, zoff, layers[set].zscale);
        }
        else {
            this.sets[set] = new BSWG.tileSet(set, layers[set].color, layers[set].level ? layers[set].level : null, layers[set].normalMap, layers[set].normalMapScale, layers[set].normalMapAmp, layers[set].flashColor, layers[set].reflect, zoff, layers[set].zscale);
        }
    }

    var fcID = 10000000;

    this.clear = function() {
        for (var setk in layers) {
            var set = this.sets[setk];
            var layer = layers[setk];
            var cache = layer.cache;
            if (cache) {
                for (var k in cache) {
                    for (var i=0; i<cache[k].length; i++)
                    {
                        if (colCache[k]) {
                            BSWG.componentList.removeQueryable(colCache[k], colCache[k].collisionMesh);
                            BSWG.componentList.removeStatic(colCache[k]);
                            if (colCache[k].collisionMesh) {
                                colCache[k].collisionMesh.geometry = null;
                                colCache[k].collisionMesh.material = null;
                                colCache[k].collisionMesh = null;
                            }
                        }
                        set.removeTile(cache[k][i]);
                        cache[k][i] = null;
                    }
                    cache[k].length = 0;
                    cache[k] = null;
                }
            }
            cache = null;
            layer.cache = null;
        }
    };

    this.destroy = function() {
        this.clear();
        for (var set in layers) {
            this.sets[set].destroy();
            this.sets[set] = null;
        }
        layers = null;
    };

    var mmtCache = {};
    this.getMinimapTile = function (clr, tileset, size) {
        var key = clr + ',' + tileset + ',' + size;
        if (mmtCache[key]) {
            return mmtCache[key];
        }
        var hm = this.sets[tileset].tiles[1][1].heightMap;
        return mmtCache[key] = BSWG.render.proceduralImage(size, size, function(ctx, w, h){
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = clr;
            ctx.globalAlpha = 1;
            var minh = 1, maxh = 0;
            for (var x=0; x<w; x++) {
                for (var y=0; y<h; y++) {
                    var height = hm[x*BSWG.tileSize/BSWG.minimapTileSize + (y*BSWG.tileSize/BSWG.minimapTileSize) * BSWG.tileSize] / 256.0;
                    minh = Math.min(height, minh);
                    maxh = Math.max(height, maxh);
                }
            }
            for (var x=0; x<w; x++) {
                for (var y=0; y<h; y++) {
                    var height = hm[x*BSWG.tileSize/BSWG.minimapTileSize + (y*BSWG.tileSize/BSWG.minimapTileSize) * BSWG.tileSize] / 256.0;
                    ctx.globalAlpha = (height-minh) / (maxh-minh) * 0.6 + 0.4;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            ctx.globalAlpha = 1;
            hm = null;
        });
    };

    this.renderMinimap = function (x1, y1, x2, y2) {
        if (!this.minimap) {
            return;
        }
        var W = this.minimap.bounds[2] - this.minimap.bounds[0];
        var H = this.minimap.bounds[3] - this.minimap.bounds[1];
        if (!this.minimap.image) {
            this.minimap.image = BSWG.render.proceduralImage(W*BSWG.minimapTileSize, H*BSWG.minimapTileSize, function(ctx, w, h){
                ctx.clearRect(0, 0, W, H);
            }, true);
        }
        var ctx = this.minimap.image.getContext('2d');
        var ox = -this.minimap.bounds[0], oy = -this.minimap.bounds[1];
        ctx.save();
        //ctx.clearRect(x1+ox, H - (y2+oy), x2-x1, y2-y1);
        for (var x=x1; x<=x2; x++) {
            for (var y=y1; y<=y2; y++) {
                var R = this.minimap.getColor(x, y);
                if (R instanceof Array) {
                    var img = this.getMinimapTile(R[0], R[1], BSWG.minimapTileSize);
                    if (img) {
                        ctx.drawImage(img, 0, 0, img.width, img.height, (x+ox)*BSWG.minimapTileSize, ((H-1) - (y+oy))*BSWG.minimapTileSize, BSWG.minimapTileSize, BSWG.minimapTileSize);
                        img = null;
                    }
                }
                else {
                    ctx.fillStyle = R;
                    ctx.fillRect((x+ox)*BSWG.minimapTileSize, ((H-1) - (y+oy))*BSWG.minimapTileSize, BSWG.minimapTileSize, BSWG.minimapTileSize);
                }
            }
        }
        ctx.restore();
    };

    if (this.minimap) {
        this.renderMinimap(this.minimap.bounds[0], this.minimap.bounds[1], this.minimap.bounds[2], this.minimap.bounds[3]);
    }

    var colCache = {};

    this.addCollision = function(x1, y1, w, h) {

        var K = function(_x, _y) {
            return _x+_y*1024;
        };

        var mat = new THREE.MeshBasicMaterial({});
        var geom = new THREE.BoxGeometry( BSWG.tileSizeWorld, BSWG.tileSizeWorld, 50.0 );

        var self = this;
        for (var setk in layers) {
            var set = this.sets[setk];
            var layer = layers[setk];

            if (layer.collision) {
                var map = layer.map;
                var M;
                if (typeof map === 'function') {
                    M = map;
                }
                else {
                    M = function(X,Y) {
                        return !!(map && map[X] && map[X][Y]);
                    };
                }

                for (var x=x1; x<(x1+w); x++) {
                    for (var y=y1; y<(y1+h); y++) {
                        if (M(x,y)) {
                            var k = K(x, y);
                            var fakeComp = {
                                id: fcID++,
                                isStatic: true,
                                center: new b2Vec2((x+0.5) * BSWG.tileSizeWorld, (y+0.5) * BSWG.tileSizeWorld),
                                radius: BSWG.tileSizeWorld * 0.5,
                                takeDamage: function() {}
                            };
                            fakeComp.collisionMesh = new THREE.Mesh( geom, mat );
                            fakeComp.collisionMesh.position.set((x+0.5) * BSWG.tileSizeWorld, (y+0.5) * BSWG.tileSizeWorld, -10.0 + zoff);
                            fakeComp.collisionMesh.rotation.z = Math.PI/2;
                            fakeComp.collisionMesh.updateMatrix();
                            fakeComp.collisionMesh.updateMatrixWorld();
                            BSWG.componentList.addStatic(fakeComp);
                            colCache[k] = fakeComp;
                        }
                    }
                }
            }
        }

        BSWG.componentList.updateStaticHash();
    };

    this.update = function(dt) {

        var p1 = BSWG.render.unproject3D(new b2Vec2(0.0, 0.0), 0.0);
        var p2 = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w, BSWG.render.viewport.h), 0.0);

        var K = function(x, y) {
            return x+y*1024;
        };

        if (this.minimap) {
            var tx1 = (~~(Math.min(p1.x, p2.x) / BSWG.tileSizeWorld)) - 3 - 0,
                ty1 = (~~(Math.min(p1.y, p2.y) / BSWG.tileSizeWorld)) - 2 - 2,
                tx2 = (~~(Math.max(p1.x, p2.x) / BSWG.tileSizeWorld)) + 2 + 0,
                ty2 = (~~(Math.max(p1.y, p2.y) / BSWG.tileSizeWorld)) + 2 + 2;
            var change = false;
            for (var x=tx1; x<=tx2; x++) {
                for (var y=ty1; y<=ty2; y++) {
                    var disc = this.minimap.getDiscovered(x, y);
                    this.minimap.setDiscovered(x, y);
                    if (disc !== this.minimap.getDiscovered(x, y)) {
                        change = true;
                    }
                }
            }
            if (change) {
                this.renderMinimap(tx1, ty1, tx2, ty2);
            }
        }

        var self = this;
        for (var setk in layers) {
            var set = this.sets[setk];
            var layer = layers[setk];
            var cache = layer.cache = layer.cache || {};
            var visible = {};
            var map = layer.map;
            var _M;
            if (typeof map === 'function') {
                _M = map;
            }
            else {
                _M = function(X,Y) {
                    return !!(map && map[X] && map[X][Y]);
                };
            }
            var M = _M;/* function(X,Y) {
                if (!self.minimap || self.minimap.getDiscovered(X,Y)) {
                    return _M(X,Y);
                }
                else {
                    return false;
                }
            }*/

            var tx1 = (~~(Math.min(p1.x, p2.x) / BSWG.tileSizeWorld)) - 2,
                ty1 = (~~(Math.min(p1.y, p2.y) / BSWG.tileSizeWorld)) - 2,
                tx2 = (~~(Math.max(p1.x, p2.x) / BSWG.tileSizeWorld)) + 2,
                ty2 = (~~(Math.max(p1.y, p2.y) / BSWG.tileSizeWorld)) + 2;
            if (zoff < -5) {
                tx1 -= 1;
                ty1 -= 1;
                tx2 += 1;
                ty2 += 1;
            }
            /*if (layer.isWater) {
                tx1 = (~~(Math.min(p1.x, p2.x) / (BSWG.tileSizeWorld * 10))) - 3;
                ty1 = (~~(Math.min(p1.y, p2.y) / (BSWG.tileSizeWorld * 10))) - 2;
                tx2 = (~~(Math.max(p1.x, p2.x) / (BSWG.tileSizeWorld * 10))) + 2;
                ty2 = (~~(Math.max(p1.y, p2.y) / (BSWG.tileSizeWorld * 10))) + 2;                
            }*/

            for (var x=tx1; x<=tx2; x++) {
                for (var y=ty1; y<=ty2; y++) {
                    var V = M(x, y);
                    if (!layer.isWater && V) {
                        var k = K(x,y);
                        visible[k] = true;
                        if (!cache[k]) {
                            cache[k] = new Array();
                            var itile = set.tiles[1][1];
                            if (layer.decals) {
                                itile = set.tiles[(V-1)%3][~~((V-1)/3)];
                            }
                            cache[k].push(set.addTile(itile, x, y, !!layer.collision));
                            if (layer.collision) {
                                var tile = cache[k][0];
                                if (BSWG.componentList && colCache[k]) {
                                    BSWG.componentList.makeQueryable(colCache[k], colCache[k].collisionMesh);
                                }
                            }
                            if (!layer.isWater && !layer.decals) {
                                for (var ox=-1; ox<=1; ox++) {
                                    for (var oy=-1; oy<=1; oy++) {
                                        if (ox || oy) {
                                            if (!M(x+ox, y+oy)) {
                                                cache[k].push(set.addTile(set.tiles[ox+1][oy+1], x+ox, y+oy));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (layer.isWater) {
                for (var x=tx1; x<=tx2; x++) {
                    for (var y=ty1; y<=ty2; y++) {
                        if (M(x,y)) {
                            var k = K(x,y);
                            visible[k] = true;
                            if (!cache[k]) {
                                cache[k] = new Array();
                                var tobj = set.addTile(set.tiles[1][1], x/**10*/, y/**10*/);
                                tobj.mesh.renderOrder = 1000.0;
                                cache[k].push(tobj);
                            }
                        }
                    }
                }
            }
            for (var k in cache) {
                if (!visible[k] && cache[k]) {
                    for (var i=0; i<cache[k].length; i++)
                    {
                        set.removeTile(cache[k][i]);
                        cache[k][i] = null;
                    }
                    cache[k].length = 0;
                    cache[k] = null;
                    delete cache[k];
                }
            }

            set.update(dt);
        }

    };

};

BSWG.makeCityTiles = function (seed) {

    Math.seedrandom(seed);

    var image = BSWG.render.proceduralImage(512*3, 512*3, function(ctx, w, h){

        var W = 512,
            H = 512;

        var l = ~~(0.0 * 255);
        ctx.fillStyle = 'rgba(' + l + ',' + l + ',' + l + ', 1.0)';
        ctx.fillRect(0, 0, w, h);

        for (var cn=0; cn<9; cn++) {
            var x1 = (cn%3) * W, y1 = ((cn-(cn%3))/3) * H;

            var minh = 0.5, maxh = 0.85;
            if (cn === 0) {
                maxh = minh;
            }

            var hist = [];
            var k = 0;
            for (var i=0; i<6; i++) {
                var sz = (~~(Math.random()*12) + 12) * 4;
                var it = {
                    sz: sz,
                    x: ~~(Math.cwRandom(16.0) * (W - sz - 4)) + sz/2 + 2,
                    y: ~~(Math.cwRandom(16.0) * (H - sz - 4)) + sz/2 + 2,
                    h: Math.random() * (maxh - minh) + minh
                };
                var valid = true;
                for (var j=0; j<hist.length; j++) {
                    var dx = Math.abs(hist[j].x - it.x),
                        dy = Math.abs(hist[j].y - it.y);
                    if (dx < (it.sz*0.25 + hist[j].sz*0.25 + 2) ||
                        dy < (it.sz*0.25 + hist[j].sz*0.25 + 2)) {
                        valid = false;
                        break;
                    }
                }
                if (!valid) {
                    i --;
                    k++;
                    if (k>1000) {
                        var l = ~~(0.0 * 255);
                        ctx.fillStyle = 'rgba(' + l + ',' + l + ',' + l + ', 1.0)';
                        ctx.fillRect(x1, y1, W, H);
                        hist.length = 0;
                        i = -1;
                    }
                    continue;
                }
                k = 0;

                var l = ~~(it.h * 255);
                var sz = it.sz/2;
                while (sz > 0) {
                    var l2 = ~~(l * ((it.sz*0.5 - sz) / (it.sz*0.5) * 0.5 + 0.5));
                    ctx.fillStyle = 'rgba(' + l2 + ',' + l2 + ',' + l2 + ', 1.0)';
                    ctx.fillRect(x1+it.x-sz, y1+it.y-sz, sz*2, sz*2);
                    sz -= 1;
                }
                hist.push(it);
            }
            var l = ~~(0.0 * 255);
            ctx.fillStyle = 'rgba(' + l + ',' + l + ',' + l + ', 1.0)';
            ctx.strokeRect(x1, y1, W, H);
        }

    }, true);

    Math.seedrandom();

    return image;

};

BSWG.tileSet = function (imageName, color, waterLevel, nmap, nmapScale, nmapAmp, flashColor, reflect, zoff, zscale) {

    zscale = zscale || 1.0;

    zoff = (zoff || 0.0) - 16;

    var image = (typeof imageName === 'string') ? BSWG.render.images[imageName] : imageName;

    if (waterLevel) {
        image = {
            width: BSWG.tileSize*3,
            height: BSWG.tileSize*3
        };
    }

    this.image = BSWG.render.proceduralImage(BSWG.tileSize*3, BSWG.tileSize*3, function(ctx, w, h){
        ctx.globalAlpha = 1.0;
        if (waterLevel) {
            var l = ~~(waterLevel * 255);
            ctx.fillStyle = 'rgba(' + l + ',' + l + ',' + l + ', 1.0)';
            ctx.fillRect(0, 0, w, h);
        }
        else {
            var _W = image.width/3, _H = image.height/3;
            var ovr = 1;
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, w, h);
            ctx.drawImage(image, _W-1, 0,    1, _H*3,   BSWG.tileSize-ovr, 0,     ovr*2, h);
            ctx.drawImage(image, _W*2-1, 0,  1, _H*3,   BSWG.tileSize*2-ovr, 0,   ovr*2, h);
            ctx.drawImage(image, 0, _H-1,    _W*3, 1,   0, BSWG.tileSize-ovr,     w, ovr*2);
            ctx.drawImage(image, 0, _H*2-1,  _W*3, 1,   0, BSWG.tileSize*2-ovr,   w, ovr*2);
        }
    }, true);

    this.tiles = [
        [
            new BSWG.tile(this.image, BSWG.tileSize*0, BSWG.tileSize*0, BSWG.tMask.R | BSWG.tMask.D, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale),
            new BSWG.tile(this.image, BSWG.tileSize*1, BSWG.tileSize*0, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.D, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale),
            new BSWG.tile(this.image, BSWG.tileSize*2, BSWG.tileSize*0, BSWG.tMask.L | BSWG.tMask.D, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale)
        ],
        [
            new BSWG.tile(this.image, BSWG.tileSize*0, BSWG.tileSize*1, BSWG.tMask.R | BSWG.tMask.D | BSWG.tMask.U, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale),
            new BSWG.tile(this.image, BSWG.tileSize*1, BSWG.tileSize*1, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.D | BSWG.tMask.U, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale),
            new BSWG.tile(this.image, BSWG.tileSize*2, BSWG.tileSize*1, BSWG.tMask.L | BSWG.tMask.D | BSWG.tMask.U, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale)
        ],
        [
            new BSWG.tile(this.image, BSWG.tileSize*0, BSWG.tileSize*2, BSWG.tMask.R | BSWG.tMask.U, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale),
            new BSWG.tile(this.image, BSWG.tileSize*1, BSWG.tileSize*2, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.U, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale),
            new BSWG.tile(this.image, BSWG.tileSize*2, BSWG.tileSize*2, BSWG.tMask.L | BSWG.tMask.U, color, !!waterLevel, nmap, nmapScale, nmapAmp, reflect, zscale)
        ]
    ];

    this.destroy = function () {
        this.image.destroy();
        for (var i=0; i<this.tiles.length; i++) {
            for (var j=0; j<this.tiles[i].length; j++) {
                if (this.tiles[i][j]) {
                    this.tiles[i][j].destroy();
                }
            }
            this.tiles[i].length = 0;
            this.tiles[i] = null;
        }
        this.tiles.length = 0;
        this.tiles = null;
    };

    this.update = function (dt) {
        for (var i=0; i<this.tiles.length; i++) {
            for (var j=0; j<this.tiles[i].length; j++) {
                if (this.tiles[i][j]) {
                    this.tiles[i][j].flashColor = flashColor || null;
                    this.tiles[i][j].update(dt);
                }
            }
        }
    };

    this.test = function () {

        for (var x=0; x<3; x++) {
            for (var y=0; y<3; y++) {
                var tile = this.tiles[x][y];
                var mesh = new THREE.Mesh( tile.geom, tile.mat );
                mesh.position.set((x-1) * BSWG.tileSizeWorld, (y-1) * BSWG.tileSizeWorld, -16.0);
                mesh.rotation.z = Math.PI/2;
                mesh.updateMatrix();
                BSWG.render.scene.add(mesh);
                tile.mesh = mesh;
                /*if (tile.shadowMat) {
                    var smesh = new THREE.Mesh( tile.geom, tile.shadowMat );
                    smesh.position.set((x-1) * BSWG.tileSizeWorld, (y-1) * BSWG.tileSizeWorld, -16.0);
                    smesh.rotation.z = Math.PI/2;
                    smesh.updateMatrix();
                    tile.smesh = smesh;
                }*/
            }
        }

    };

    this.addTile = function(tile, x, y, coln) {

        var ret = new Object();
        ret.mesh = new THREE.Mesh( tile.geom, tile.mat );
        ret.mesh.position.set(x * BSWG.tileSizeWorld, y * BSWG.tileSizeWorld, -10.0+zoff);
        ret.mesh.rotation.z = Math.PI/2;
        ret.mesh.updateMatrix();
        if (tile.shadowMat) {
            ret.smesh = new THREE.Mesh( tile.geom, tile.shadowMat );
            ret.smesh.position.set(x * BSWG.tileSizeWorld, y * BSWG.tileSizeWorld, -10.0+zoff);
            ret.smesh.rotation.z = Math.PI/2;
            ret.smesh.updateMatrix();
            BSWG.render.sceneS.add(ret.smesh);
        }

        if (coln) {
            //ret.collisionMesh.visible = false;
            //BSWG.render.scene.add(ret.collisionMesh);
        }

        BSWG.render.scene.add(ret.mesh);
        return ret;

    };

    this.removeTile = function (tile) {

        if (!tile.mesh) {
            return;
        }

        BSWG.render.scene.remove(tile.mesh);
        tile.mesh.geometry = null;
        tile.mesh.material = null;
        tile.mesh = null;
        if (tile.smesh) {
            BSWG.render.sceneS.remove(tile.smesh);
            tile.smesh.geometry = null;
            tile.smesh.material = null;
            tile.smesh = null;            
        }
    };
    
};

BSWG.mapPerlin = function (x, y) {
    x += 100;
    y += 50;
    var h = Math.random2d(~~(x/2), ~~(y/2)) * 0.5 +
            Math.random2d(~~(x/1.5), ~~(y/1.5)) * 0.25 +
            Math.random2d(~~(x/1.1), ~~(y/1.1)) * 0.125;
    return h > 0.475;
};
BSWG.mapPerlinF = function (x, y) {
    x += 100;
    y += 50;
    var h = Math.random2d(~~(x/4), ~~(y/4)) * 0.5 +
            Math.random2d(~~(x/3), ~~(y/3)) * 0.25 +
            Math.random2d(~~(x/2), ~~(y/2)) * 0.125 +
            Math.random2d(~~(x/1.5), ~~(y/1.5)) * 0.125/2 + 
            Math.random2d(~~(x/1), ~~(y/1)) * 0.125/4;
    return h;
};
BSWG.mapPerlinSparse = function (x, y) {
    x += 100;
    y += 50;
    var h = Math.random2d(~~(x/2), ~~(y/2)) * 0.5 +
            Math.random2d(~~(x/1.5), ~~(y/1.5)) * 0.25 +
            Math.random2d(~~(x/1.1), ~~(y/1.1)) * 0.125;
    return h > 0.7;
};