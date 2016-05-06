BSWG.tileSize = 512;
BSWG.tileMeshSize = 64;
BSWG.tileSizeWorld = 24.0;
BSWG.tileHeightWorld = 16.0;

BSWG.tMask = {
    L: 1,
    R: 2,
    U: 4,
    D: 8
};

BSWG.tile = function (image, imgX, imgY, tileMask, color, water) {

    var self = this;
    this.heightMap = new Array(BSWG.tileSize * BSWG.tileSize);

    this.normalMap = BSWG.render.proceduralImage(BSWG.tileSize, BSWG.tileSize, function(ctx, w, h){
        ctx.drawImage(image, imgX, imgY, BSWG.tileSize, BSWG.tileSize, 0, 0, BSWG.tileSize, BSWG.tileSize);
        var imgData = ctx.getImageData(0, 0, w, h);
        for (var i=0; i<imgData.data.length; i+=4) {
            self.heightMap[~~(i/4)] = imgData.data[i+0];
        }
        BSWG.render.heightMapToNormalMap(self.heightMap, ctx, w, h, tileMask);
    });

    var mSize = BSWG.tileMeshSize; //water ? 4 : BSWG.tileMeshSize;
    this.geom = new THREE.PlaneBufferGeometry(BSWG.tileSizeWorld, BSWG.tileSizeWorld, mSize-1, mSize-1);
    var verts = this.geom.attributes.position;

    var offset = 0;

    var gSize = BSWG.tileSize / mSize;
    var sSize = BSWG.tileSizeWorld / (BSWG.tileSize-gSize);

    if (water) {
        sSize *= 10000.0;
    }

    for (var iy = 0; iy < BSWG.tileSize; iy += gSize) {
        for (var ix = 0; ix < BSWG.tileSize; ix += gSize) {

            var x = (ix * sSize - sSize*0.5) * (1 + (water ? 0 : 2 / BSWG.tileSize));
            var y = (-(iy * sSize - sSize*0.5)) * (1 + (water ? 0 : 2 / BSWG.tileSize));

            var x2 = ix;
            var y2 = iy;
            if ((ix + gSize) === BSWG.tileSize) {
                x2 = BSWG.tileSize - 1;
            }
            if ((iy + gSize) === BSWG.tileSize) {
                y2 = BSWG.tileSize - 1;
            }

            var z = BSWG.tileHeightWorld * self.heightMap[x2 + y2*BSWG.tileSize]/255;

            verts.array[offset+0] = x;
            verts.array[offset+1] = y;
            verts.array[offset+2] = z;
            
            offset += 3;
        }
    }
    //verts.dynamic = true;

    this.geom.computeFaceNormals();
    this.geom.computeVertexNormals();
    this.geom.computeBoundingBox();

    var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);

    if (water) {
        this.mat = BSWG.render.newMaterial("basicVertex", "tileWaterFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(color[0], color[1], color[2], color[3])
            }
        });
    }
    else {
        this.mat = BSWG.render.newMaterial("basicVertex", "tileFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(color[0], color[1], color[2], 1.0)
            },
            light: {
                type: 'v4',
                value: new THREE.Vector4(lp.x, lp.y, BSWG.render.cam3D.position.z * 7.0, 1.0)
            },
            map: {
                type: 't',
                value: this.normalMap.texture
            }
        });
    }

};

BSWG.testMap = {
    'tileset-mountain': {
        map: [
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
            [ 1, 0, 0, 1, 1, 0, 0, 0, 0, 1 ],
            [ 1, 0, 0, 0, 1, 1, 0, 0, 0, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
        ],
        color: [1.0, 1.0, 1.0]
    },
    'tileset-land': {
        map: [
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 1 ],
            [ 1, 0, 0, 0, 0, 0, 0, 1, 1, 1 ],
            [ 1, 0, 0, 0, 0, 0, 1, 1, 1, 1 ],
            [ 1, 0, 0, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 0, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 0, 1, 1, 1, 1, 1, 1, 0, 1 ],
            [ 1, 1, 1, 1, 0, 1, 1, 0, 0, 1 ],
            [ 1, 1, 1, 1, 1, 1, 0, 0, 0, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
        ],
        color: [0.2, 0.75, 0.2]
    },
    'tileset-below': {
        map: [
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]
        ],
        color: [0.75, 0.75, 0.20],
        isBelow: true
    },
    'water': {
        color: [0.05*0.5, 0.4*0.5, 0.75*0.5, 0.75],
        level: 0.25,
        isWater: true
    }
}

BSWG.tileMap = function (layers) {

    this.layers = layers;
    this.sets = {};
    for (var set in layers) {
        this.sets[set] = new BSWG.tileSet(set, layers[set].color, layers[set].level ? layers[set].level : null);
    }

    this.update = function(dt) {

        var p1 = BSWG.render.unproject3D(new b2Vec2(0.0, 0.0), 0.0);
        var p2 = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w, BSWG.render.viewport.h), 0.0);

        var tx1 = (~~(Math.min(p1.x, p2.x) / BSWG.tileSizeWorld)) - 2,
            ty1 = (~~(Math.min(p1.y, p2.y) / BSWG.tileSizeWorld)) - 2,
            tx2 = (~~(Math.max(p1.x, p2.x) / BSWG.tileSizeWorld)) + 2,
            ty2 = (~~(Math.max(p1.y, p2.y) / BSWG.tileSizeWorld)) + 2;

        var K = function(x, y) {
            return x+y*1024;
        };

        for (var setk in layers) {
            var set = this.sets[setk];
            var layer = layers[setk];
            var cache = layer.cache = layer.cache || {};
            var visible = {};
            var map = layer.map;
            var M = function(X,Y) {
                return !!(map && map[X] && map[X][Y]);
            };
            for (var x=tx1; x<=tx2; x++) {
                for (var y=ty1; y<=ty2; y++) {
                    if (!layer.isWater && M(x,y)) {
                        var k = K(x,y);
                        visible[k] = true;
                        if (!cache[k]) {
                            cache[k] = new Array();
                            cache[k].push(set.addTile(set.tiles[1][1], x, y));
                            if (!layer.isWater) {
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
                var k = 1;
                visible[k] = true;
                if (!cache[k]) {
                    cache[k] = new Array();
                    var tobj = set.addTile(set.tiles[1][1], -5, -5);
                    tobj.mesh.renderOrder = 1000.0;
                    cache[k].push(tobj);
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
        }

    };

};

BSWG.tileSet = function (imageName, color, waterLevel) {

    var image = (typeof imageName === 'string') ? BSWG.render.images[imageName] : imageName;

    if (waterLevel) {
        image = {
            width: BSWG.tileSize*3,
            height: BSWG.tileSize*3
        };
    }

    this.image = BSWG.render.proceduralImage(image.width, image.height, function(ctx, w, h){
        ctx.globalAlpha = 1.0;
        if (waterLevel) {
            var l = ~~(waterLevel * 255);
            ctx.fillStyle = 'rgba(' + l + ',' + l + ',' + l + ', 1.0)';
            ctx.fillRect(0, 0, w, h);
        }
        else {
            ctx.drawImage(image, 0, 0);
            ctx.drawImage(image, BSWG.tileSize-1, 0,    1, h,   BSWG.tileSize-1, 0,     3, h);
            ctx.drawImage(image, BSWG.tileSize*2-1, 0,  1, h,   BSWG.tileSize*2-1, 0,   3, h);
            ctx.drawImage(image, 0, BSWG.tileSize-1,    w, 1,   0, BSWG.tileSize-1,     w, 3);
            ctx.drawImage(image, 0, BSWG.tileSize*2-1,  w, 1,   0, BSWG.tileSize*2-1,   w, 3);
        }
    }, true);

    this.tiles = [
        [
            new BSWG.tile(this.image, BSWG.tileSize*0, BSWG.tileSize*0, BSWG.tMask.R | BSWG.tMask.D, color, !!waterLevel),
            new BSWG.tile(this.image, BSWG.tileSize*1, BSWG.tileSize*0, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.D, color, !!waterLevel),
            new BSWG.tile(this.image, BSWG.tileSize*2, BSWG.tileSize*0, BSWG.tMask.L | BSWG.tMask.D, color, !!waterLevel)
        ],
        [
            new BSWG.tile(this.image, BSWG.tileSize*0, BSWG.tileSize*1, BSWG.tMask.R | BSWG.tMask.D | BSWG.tMask.U, color, !!waterLevel),
            new BSWG.tile(this.image, BSWG.tileSize*1, BSWG.tileSize*1, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.D | BSWG.tMask.U, color, !!waterLevel),
            new BSWG.tile(this.image, BSWG.tileSize*2, BSWG.tileSize*1, BSWG.tMask.L | BSWG.tMask.D | BSWG.tMask.U, color, !!waterLevel)
        ],
        [
            new BSWG.tile(this.image, BSWG.tileSize*0, BSWG.tileSize*2, BSWG.tMask.R | BSWG.tMask.U, color, !!waterLevel),
            new BSWG.tile(this.image, BSWG.tileSize*1, BSWG.tileSize*2, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.U, color, !!waterLevel),
            new BSWG.tile(this.image, BSWG.tileSize*2, BSWG.tileSize*2, BSWG.tMask.L | BSWG.tMask.U, color, !!waterLevel)
        ]
    ];

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
            }
        }

    };

    this.addTile = function(tile, x, y) {

        var ret = new Object();
        ret.mesh = new THREE.Mesh( tile.geom, tile.mat );
        ret.mesh.position.set(x * BSWG.tileSizeWorld, y * BSWG.tileSizeWorld, -8.0);
        ret.mesh.rotation.z = Math.PI/2;
        ret.mesh.updateMatrix();
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

    };
    
};