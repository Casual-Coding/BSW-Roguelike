BSWG.map_minZoneDist     = 20; // Minimum distance allowed between two zones
BSWG.map_minZoneEdgeDist = 20; // Minimum distance allowed from a zone center to edge of map
BSWG.map_gridSize        = 24.0; // overwritte as BSWG.tileSizeWorld
BSWG.map_flPlanetDist    = 0.9; // * size
BSWG.map_minPlanetDist   = 60; // Minimum distance allowed between planets
BSWG.map_planetSafeDist  = 9; // Size of zone surrounding planet

BSWG.enemySettings_compToStr = function (obj) {
    var str = obj.type;
    for (var key in obj) {
        if (key !== 'type' && key !== 'minLevel' && key !== 'alwaysLevel' && key !== 'minProb') {
            str += ',' + key + '=' + obj[key];
        }
    }
    return str;
};

BSWG.enemySettings = [
    {
        minLevel: 0,
        maxLevel: 10,
        minComponents: [
            { type: 'thruster', size: 1 },
            { type: 'blaster' },
            { type: 'block', width: 2, height: 2 },
            { type: 'hingehalf', size: 2 },
            { type: 'spikes', size: 2, pike: true }
        ],
        maxComponents: [
            { type: 'block', width: 3, height: 3,   minLevel: 5, alwaysLevel: 8,  minProb: 0.8 },
            { type: 'thruster', size: 2,            minLevel: 3, alwaysLevel: 6,  minProb: 0.5 },
            { type: 'missile-launcher',             minLevel: 3, alwaysLevel: 6,  minProb: 0.5 },
            { type: 'laser',                        minLevel: 7, alwaysLevel: 10, minProb: 0.65 },
            { type: 'sawblade', size: 3,            minLevel: 5, alwaysLevel: 7,  minProb: 0.8 },
            { type: 'detacherlauncher', size: 2,    minLevel: 5, alwaysLevel: 8,  minProb: 0.8 },
            { type: 'spikes', size: 3, pike: true,  minLevel: 5, alwaysLevel: 8,  minProb: 0.9 },
            { type: 'spikes', size: 3, pike: false, minLevel: 5, alwaysLevel: 8,  minProb: 0.9 },
            { type: 'chainlink',                    minLevel: 3, alwaysLevel: 5,  minProb: 0.6 }
        ],
        bosses: [ // ordered by difficulty
            [ { type: 'missile-boss', levelInc: 2 } ],
            [ { type: 'mele-boss', levelInc: 2 } ],
            [ { type: 'big-flail', levelInc: 2 } ],
            [ { type: 'mele-boss', levelInc: 2 }, { type: 'brute', levelInc: 1 } ],
            [ { type: 'big-flail', levelInc: 2 }, { type: 'heavy-fighter', levelInc: 1 } ],
            [ { type: 'crippler', levelInc: 2 }, { type: 'little-cruncher', levelInc: 1 } ],
            [ { type: 'cruncher-boss', levelInc: 2 }, { type: 'heavy-fighter', levelInc: 1 }, { type: 'heavy-fighter', levelInc: 1 } ], // TODO
        ],
        enemies: [
            { type: 'big-flail',        levels: [8,9,10] },
            { type: 'big-spinner',      levels: [6,7,8] },
            { type: 'brute',            levels: [5,6,7] },
            { type: 'brute',            levels: [8,9,10], max: 2 },
            { type: 'crippler',         levels: [8,9,10] },
            { type: 'fighter',          levels: [0,1,2,5,6], max: 2 },
            { type: 'four-blaster',     levels: [0,1,2] },
            { type: 'four-blaster',     levels: [0,1,2], with: [ 'uni-dir-fighter' ] },
            { type: 'four-blaster',     levels: [0,1,2], with: [ 'fighter' ] },
            { type: 'four-blaster',     levels: [0,1,2], with: [ 'four-blaster-x2' ] },
            { type: 'four-blaster-x2',  levels: [0,1,2] },
            { type: 'four-blaster-x2',  levels: [0,1,2], with: [ 'uni-dir-fighter' ] },
            { type: 'four-blaster-x2',  levels: [0,1,2], with: [ 'fighter' ] },
            { type: 'heavy-fighter',    levels: [6,7,9,10] },
            { type: 'laser-fighter',    levels: [4,5,6] },
            { type: 'laser-fighter',    levels: [4,5,6], with: [ 'msl-fighter' ] },
            { type: 'little-brute',     levels: [3,4,5,6], max: 2 },
            { type: 'little-charger-2', levels: [3,4,5,6], max: 2 },
            { type: 'little-charger',   levels: [4,5,6,7], max: 2 },
            { type: 'little-cruncher',  levels: [5,6,7] },
            { type: 'mele-boss',        levels: [8,9] },
            { type: 'missile-boss',     levels: [6,7,8], max: 2 },
            { type: 'missile-spinner',  levels: [2,3,4] },
            { type: 'missile-spinner',  levels: [2,3,4], with: [ 'fighter' ] },
            { type: 'missile-spinner',  levels: [6,7,8], max: 2 },
            { type: 'missile-spinner',  levels: [9,10], max: 3 },
            { type: 'msl-fighter',      levels: [2,3,4,5], max: 2 },
            { type: 'scorpion',         levels: [5,6,7], with: [ 'uni-laser', 'uni-laser'] },
            { type: 'spinner',          levels: [4,5,6], max: 2 },
            { type: 'spinner',          levels: [4,5,6], max: 1, with: [ 'little-charger', 'little-charger' ] },
            { type: 'spinner',          levels: [4,5,6], max: 1, with: [ 'little-charger-2', 'little-charger-2' ] },
            { type: 'spinner',          levels: [7,8], max: 3 },
            { type: 'uni-dir-fighter',  levels: [0,1] },
            { type: 'uni-dir-fighter',  levels: [2,3], max: 2 },
            { type: 'uni-fight-msl',    levels: [2,3] },
            { type: 'uni-fight-msl',    levels: [4,5], max: 2 },
            { type: 'uni-laser',        levels: [5,6,7], max: 2 },
            { type: 'uni-laser',        levels: [8,9,10], max: 4 },
            { type: 'little-tough-guy', levels: [0,1] },
            { type: 'little-tough-guy', levels: [2,3], max: 2 },
            { type: 'tough-guy',        levels: [5,6,7], max: 2 },
            { type: 'stinger',          levels: [2,3] },
            { type: 'stinger',          levels: [4,5,6], max: 2 },
            { type: 'brutenie',         levels: [0,1] },
            { type: 'brutenie',         levels: [1,2], with: [ 'brutenie'] },
            { type: 'brutenie',         levels: [0,1,2], with: [ 'uni-dir-fighter' ] },
            { type: 'brutenie',         levels: [1,2], with: [ 'fighter' ] },
            { type: 'marauder',         levels: [1,2,3] },
            { type: 'marauder',         levels: [2,3,4], with: [ 'marauder'] },
            { type: 'marauder',         levels: [2,3,4], with: [ 'little-tough-guy'] },
            { type: 'striker',          levels: [2,3,4], with: [ 'marauder' ] },
            { type: 'striker',          levels: [4,5,6], max: 2, with: [ 'marauder' ] },
            { type: 'striker',          levels: [2,3], max: 2, with: [ 'freighter' ] },
            { type: 'striker',          levels: [4,5,6], with: [ 'freighter' ] },
            { type: 'striker',          levels: [4,5,6], max: 2, with: [ 'freighter' ] },
            { type: 'striker',          levels: [4,5,6], with: [ 'little-brute', 'little-tough-guy'] },
            { type: 'freighter',        levels: [2,3,4,5,6] },
            { type: 'tracker',          levels: [0] },
            { type: 'tracker',          levels: [0] },
            { type: 'tracker',          levels: [0] },
            { type: 'tracker',          levels: [1], max: 2 },
            { type: 'tracker',          levels: [1], max: 2 },
            { type: 'tracker',          levels: [1], max: 2 }
        ]
    }
];

BSWG.genMap = function(size, numZones, numPlanets, areaNo) {

    BSWG.map_gridSize = BSWG.tileSizeWorld;

    var ret = new Object();

    if (typeof size === 'object') {

        var scan = function (obj) {
        
            ret = size;

            if (typeof obj === 'object') {
                for (var k in obj) {
                    if (obj[k] && obj[k].__isVec) {
                        obj[k] = new b2Vec2(obj[k].x, obj[k].y);
                    }
                    else if (obj[k] && obj[k].__isVec3) {
                        obj[k] = new THREE.Vector3(obj[k].x, obj[k].y, obj[k].z);
                    }
                    else if (obj[k] && obj[k].__isVec4) {
                        obj[k] = new THREE.Vector4(obj[k].x, obj[k].y, obj[k].z, obj[k].w);
                    }
                    else if (obj[k] && obj[k].__isZone) {
                        obj[k] = ret.zones[obj[k].index];
                    }
                    else {
                        scan(obj[k]);
                    }
                }
            }

        };

        scan(ret);

        Math.seedrandom();
        /*for (var i=0; i<ret.planets.length; i++) {
            if (!ret.planets[i].pobj) {
                console.log('Map load error: Couldn\'t load planet');
            }
            else {
                //ret.planets[i].pobj = BSWG.planets.add(ret.planets[i].pobj);
            }
        }*/

        for (var i=0; i<ret.zones.length; i++) {
            BSWG.genMap_LoadMusicSettings_Zone(ret.zones[i], ret.eInfo);
        }

        size       = ret.size;
        areaNo     = ret.areaNo;
        numZones   = ret.zones.length;
        numPlanets = ret.planets.length;
    }
    else {

        size       = size || 128;
        numZones   = numZones || 20;
        numPlanets = numPlanets || 5;
        areaNo     = areaNo || 0;

        ret.eInfo = BSWG.enemySettings[areaNo];

        ret.size     = size;
        ret.areaNo   = areaNo;
        ret.zones    = new Array(numZones);
        ret.gridSize = BSWG.map_gridSize;
        ret.zoneMap  = new Array(size);
        ret.edgeMap  = new Array(size);
        ret.colMap   = new Array(size);
        ret.terMap   = new Array(size);
        ret.obMap    = new Array(size);
        ret.disMap   = new Array(size);
        ret.planets  = new Array(numPlanets);
        ret.enemies_placed = false;

        for (var i=0; i<size; i++) {
            ret.zoneMap[i] = new Array(size);
            ret.edgeMap[i] = new Array(size);
            ret.colMap[i]  = new Array(size);
            ret.terMap[i]  = new Array(size);
            ret.obMap[i]   = new Array(size);
            ret.disMap[i]  = new Array(size);
            for (var j=0; j<size; j++) {
                ret.zoneMap[i][j] = -1;
                ret.edgeMap[i][j] = -1;
                ret.colMap[i][j]  = -1;
                ret.terMap[i][j]  = -1;
                ret.obMap[i][j]   = 0;
                ret.disMap[i][j]  = 0;
            }
        }

        var randPoint = function() {
            return new b2Vec2(Math.random()*(size-(BSWG.map_minZoneDist*2)) + BSWG.map_minZoneDist,
                              Math.random()*(size-(BSWG.map_minZoneDist*2)) + BSWG.map_minZoneDist);
        };

        for (var i=0; i<numZones; i++) {
            var k;
            for (k=0; k<1000; k++) {
                var p = randPoint();
                var valid = true;
                for (var j=0; j<i && valid; j++) {
                    if (Math.distSqVec2(p, ret.zones[j].p) < BSWG.map_minZoneDist*BSWG.map_minZoneDist) {
                        valid = false;
                    }
                }
                if (valid) {
                    ret.zones[i] = new Object();
                    ret.zones[i].p = p;
                    ret.zones[i].worldP = new b2Vec2(p.x * ret.gridSize, p.y * ret.gridSize);
                    ret.zones[i].name = BSWG.randomName.get();
                    ret.zones[i].discovered = false;
                    ret.zones[i].id = i;
                    ret.zones[i].biome = BSWG.map_genBiome();
                    break;
                }
            }
            if (k >= 1000) {
                numZones = i;
                ret.zones.length = numZones;
                if (i === 0) {
                    console.log('Map generation error: Number of zones forced to 0');
                }
                if (i < numPlanets) {
                    console.log('Map generation error: Number of zones forced to less than number of planets')
                }
                break;
            }
        }

        var found = false;
        for (var i=0; i<numZones && !found; i++) {
            for (var j=i+1; j<numZones && !found; j++) {
                if (Math.distVec2(ret.zones[i].p, ret.zones[j].p) > size*BSWG.map_flPlanetDist) {
                    ret.planets[0] = new Object();
                    ret.planets[1] = new Object();
                    ret.planets[0].zone = ret.zones[i];
                    ret.planets[1].zone = ret.zones[j];
                    ret.planets[0].p = ret.zones[i].p;
                    ret.planets[1].p = ret.zones[j].p;
                    ret.planets[0].worldP = new b2Vec2(ret.planets[0].p.x * ret.gridSize, ret.planets[0].p.y * ret.gridSize);
                    ret.planets[1].worldP = new b2Vec2(ret.planets[1].p.x * ret.gridSize, ret.planets[1].p.y * ret.gridSize);
                    ret.zones[i].hasPlanet = true;
                    ret.zones[j].hasPlanet = true;
                    ret.zones[i].home = true;
                    ret.zones[i].safe = true;
                    ret.zones[j].end = true;
                    found = true;
                }
            }
        }

        if (!found) {
            return BSWG.genMap(size, numZones, numPlanets);
        }

        for (var i=2; i<numPlanets; i++) {
            var k;
            for (k=0; k<1000; k++) {
                var z = ret.zones[~~(Math.random()*ret.zones.length)];
                var valid = true;
                for (var j=0; j<i && valid; j++) {
                    if (Math.distVec2(z.p, ret.planets[j].p) < BSWG.map_minPlanetDist) {
                        valid = false;
                    }
                }
                if (valid) {
                    ret.planets[i] = new Object();
                    ret.planets[i].zone = z;
                    ret.planets[i].p = z.p;
                    ret.planets[i].worldP = new b2Vec2(ret.planets[i].p.x * ret.gridSize, ret.planets[i].p.y * ret.gridSize);
                    z.hasPlanet = true;
                    break;
                }
            }
            if (k >= 1000) {
                numPlanets = i;
                ret.planets.length = numPlanets;
            }
        }

        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {
                var p = new b2Vec2(x, y);
                var best = 0;
                for (var i=1; i<numZones; i++) {
                    var dista = Math.distSqVec2(ret.zones[best].p, p);
                    var distb = Math.distSqVec2(ret.zones[i].p, p)
                    if (ret.zones[best].hasPlanet && dista > (BSWG.map_planetSafeDist*BSWG.map_planetSafeDist)) {
                        dista *= 1000.0;
                    }
                    if (ret.zones[i].hasPlanet && distb > (BSWG.map_planetSafeDist*BSWG.map_planetSafeDist)) {
                        distb *= 1000.0;
                    }
                    if (dista > distb) {
                        best = i;
                    }
                }
                ret.zoneMap[x][y] = best;
            }
        }

        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {
                if (x === 0 || y === 0 || x === (size-1) || y === (size-1) ||
                    ret.zoneMap[x-1][y] !== ret.zoneMap[x][y] ||
                    ret.zoneMap[x+1][y] !== ret.zoneMap[x][y] ||
                    ret.zoneMap[x][y-1] !== ret.zoneMap[x][y] ||
                    ret.zoneMap[x][y+1] !== ret.zoneMap[x][y] ||
                    ret.zoneMap[x-1][y-1] !== ret.zoneMap[x][y] ||
                    ret.zoneMap[x+1][y+1] !== ret.zoneMap[x][y] ||
                    ret.zoneMap[x+1][y-1] !== ret.zoneMap[x][y] ||
                    ret.zoneMap[x-1][y+1] !== ret.zoneMap[x][y]) {
                    ret.edgeMap[x][y] = ret.zoneMap[x][y];
                }
            }
        }

        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {
                ret.colMap[x][y] = ret.edgeMap[x][y] > -1;
                var zone = ret.zones[ret.zoneMap[x][y]];
                if (!zone.hasPlanet && Math.random() < 0.05) {
                    ret.colMap[x][y] = true;
                }
            }
        }

        var start = ret.planets[0].zone;
        var visited = {};
        var vcount = 0;
        while (vcount < (ret.zones.length-1)) {
            visited[start.id] = true;
            vcount += 1;
            start.order = vcount;

            var best = null, bestD = null;
            for (var i=0; i<ret.zones.length; i++) {
                if (!visited[i]) {
                    var d = Math.distSqVec2(ret.zones[i].p, start.p);
                    if (best === null || d < bestD) {
                        best = ret.zones[i];
                        bestD = d;
                    }
                }
            }

            for (var x=0; x<size; x++) {
                for (var y=0; y<size; y++) {
                    if (Math.pointLineDistance(start.p, best.p, new b2Vec2(x, y)) < 2) {
                        ret.colMap[x][y] = false;
                    }
                }
            }

            start = best;
        }
        start.order = vcount+1;

        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {            
                if (!ret.colMap[x][y]) {
                    var zone = ret.zones[ret.zoneMap[x][y]];
                    var B = zone.biome;
                    if (BSWG.mapPerlin(x, y) || (B.water > 0.75 && BSWG.mapPerlin(x+141, y+341))) {
                        ret.terMap[x][y] = 0;
                    }
                    else {
                        var L = new Array();
                        L.push([B.grass, 1, 1541, 14]);
                        L.push([B.sand, 2, 454, 515]);
                        L.push([B.rock, 3, 5981, 1567]);
                        L.push([B.snow, 4, 145, 8701]);
                        L.sort(function(a,b){
                            if (a[0] < b[0]) {
                                return -1;
                            }
                            else if (a[0] === b[0]) {
                                return 0;
                            }
                            else {
                                return 1;
                            }
                        });
                        ret.terMap[x][y] = L[0][1];
                        for (var i=1; i<L.length; i++) {
                            if (Math.pow(BSWG.mapPerlinF(x+L[i][2], y+L[i][3]), 3.0) < L[i][0]) {
                                ret.terMap[x][y] = L[i][1];
                                break;
                            }
                        }
                    }
                }
            }
        }

        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {
                var xy = new b2Vec2(x,y);
                for (var i=0; i<numPlanets; i++) {
                    var p = ret.planets[i];
                    var dist = Math.distVec2(p.p, xy);
                    if (dist < 3) {
                        ret.terMap[x][y] = 0;
                    }
                    if (dist < 5) {
                        ret.obMap[x][y] = (~~(Math.random()*8) + 1);
                        break;
                    }
                }
                xy = null;
            }
        }

        ret.ctileSeed = ~~(Math.random()*100000);
    }

    Math.seedrandom(ret.ctileSeed);
    var obtiles = BSWG.makeCityTiles(1);

    ret.tm_desc = {
        'city-tiles': {
            decals: obtiles,
            normalMap: BSWG.render.images['test_nm'].texture,
            normalMapScale: 24.0,
            normalMapAmp: 5.0,
            map: function(x, y) {
                if (x >= 0 && y >= 0 && x < size && y < size) {
                    return ret.obMap[x][y];
                }
                else {
                    return 0;
                }
            },
            color: [0.5, 0.5, 1.5],
            flashColor: [1.1, 1.1, 1.5],
            reflect: 0.75,
        },
        'tileset-mountain': {
            map: function(x,y) {
                return x < 0 || y < 0 || x >= size || y >= size || ret.colMap[x][y];
            },
            collision: true,
            color: [1.0, 1.0, 1.0],
            reflect: 0.2,
            normalMapAmp: 3.5,
        },
        'tileset-land': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 1;
            },
            color: [0.4, 0.75, 0.2],
            relfect: 0.2,
            normalMapAmp: 3.0,
        },
        'tileset-sand': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 2;
            },
            color: [1.5, 1.0, 0.5],
            reflect: 0.3,
            normalMap: BSWG.render.images['water_nm'].texture,
            normalMapScale: 3.0,
            normalMapAmp: 1.0,
        },
        'tileset-rockland': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 3;
            },
            color: [0.75/3, 0.5/3, 0.5/3],
            reflect: 0.15,
            normalMapAmp: 5.0,
        },
        'tileset-snow': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 4;
            },
            color: [2.25, 2.25, 2.25],
            reflect: 0.3,
            normalMap: BSWG.render.images['water_nm'].texture,
            normalMapScale: 2.5,
            normalMapAmp: 0.75,
        },
        'tileset-below': {
            map: function(x,y) {
                return !(x < 0 || y < 0 || x >= size || y >= size || ret.colMap[x][y]);
            },
            color: [0.75, 0.75, 0.20],
            isBelow: true,
            reflect: 0.5,
            normalMapAmp: 1.5
        },
        'water': {
            color: [0.05*0.5, 0.4*0.25, 0.75*0.5, 0.65],
            level: 0.20,
            map: function(x,y) {
                return true
            },
            isWater: true
        },
        'minimap': {
            bounds: [ 0, 0, size, size ],
            getColor: function(x, y) {
                if (this.getDiscovered(x, y)) {
                    if (ret.colMap[x][y]) {
                        return 'rgba(192, 192, 192, 1)';
                    }
                    else if (ret.terMap[x][y] === 0) {
                        return 'rgba(6, 50, 80, 1)';
                    }
                    else if (ret.terMap[x][y] === 1) {
                        return 'rgba(40, 80, 20, 1)';
                    }
                    else if (ret.terMap[x][y] === 2) {
                        return 'rgba(96, 72, 48, 1)';
                    }
                    else if (ret.terMap[x][y] === 3) {
                        return 'rgba(56, 40, 40, 1)';
                    }
                    else if (ret.terMap[x][y] === 4) {
                        return 'rgba(130, 130, 130, 1)';
                    }
                }
                else {
                    return 'rgba(0, 0, 0, 1)';
                }
            },
            setDiscovered: function(x, y, undis) {
                if (x >= 0 && y >= 0 && x < size && y < size) {
                    var zone = ret.zones[ret.zoneMap[x][y]];
                    if (!zone.discovered) {
                        undis = true;
                    }
                    ret.disMap[x][y] = (!undis) ? 1 : 0;
                }
            },
            getDiscovered: function(x, y) {
                if (x >= 0 && y >= 0 && x < size && y < size) {
                    return ret.disMap[x][y] ? true : false;
                }
                else {
                    return false;
                }
            }
        }
    };

    ret.serialize = function () {

        var self = this;

        var odesc = this.tm_desc;
        this.tm_desc = null;

        for (var i=0; i<this.zones.length; i++) {
            this.zones[i].__zoneIndex = (i+1);
        }

        var ZU = {};

        var scan = function(obj) {
            if (obj instanceof Array) {
                var R = new Array(obj.length);
                for (var i=0; i<obj.length; i++) {
                    R[i] = scan(obj[i]);
                }
                return R;
            }
            else if (typeof obj === 'object' && obj) {
                if (typeof obj.serialize === 'function' && obj !== self) {
                    return obj.serialize();
                }
                else if (obj instanceof b2Vec2) {
                    return {
                        x: obj.x,
                        y: obj.y,
                        __isVec: true
                    };
                }
                else if (obj instanceof THREE.Vector3) {
                    return {
                        x: obj.x,
                        y: obj.y,
                        z: obj.z,
                        __isVec3: true
                    };
                }
                else if (obj instanceof THREE.Vector4) {
                    return {
                        x: obj.x,
                        y: obj.y,
                        z: obj.z,
                        w: obj.w,
                        __isVec4: true
                    };
                }
                else if (obj instanceof BSWG.uiControl) {
                    return null;
                }
                else if (obj instanceof BSWG.song) {
                    return null;
                }
                else {
                    if (obj.__zoneIndex) {
                        if (ZU[obj.__zoneIndex]) {
                            return {
                                __isZone: true,
                                index: (obj.__zoneIndex-1)
                            };
                        }
                        else {
                            ZU[obj.__zoneIndex] = true;
                        }
                    }
                    var R = new Object();
                    if (obj.zones) { // zones first
                        R.zones = scan(obj.zones);
                    }
                    for (var key in obj) {
                        if (key === 'zones') {
                            continue;
                        }
                        R[key] = scan(obj[key]);
                    }
                    return R;
                }
            }
            else if (typeof obj === 'function') {
                return null;
            }
            else {
                return obj;
            }
        };

        var ret = scan(this);

        this.tm_desc = odesc;
        odesc = null;

        return ret;
    };

    ret.renderZoneMap = function (ctx, clr, flipY, scale, onlyDisc) {

        var alpha = parseFloat(ctx.globalAlpha);
        ctx.fillStyle = clr;

        scale = scale || 1;

        for (var x=0; x<this.size; x++) {
            for (var y=0; y<this.size; y++) {
                var val = this.zoneMap[x][y];
                if (val > -1 && (!onlyDisc || this.zones[val].discovered)) {
                    ctx.globalAlpha = alpha * (val+1) / this.zones.length * 0.5;
                    ctx.fillRect(x*scale, (flipY ? (this.size-1)-y : y) * scale, scale, scale);
                    ctx.globalAlpha = alpha * (val+1) / this.zones.length * 0.5;
                    ctx.fillRect(x*scale-scale/2, (flipY ? (this.size-1)-y : y) * scale-scale/2, scale*2, scale*2);
                }
            }
        }

        ctx.globalAlpha = alpha;

    };

    ret.renderEdgeMap = function (ctx, clr, flipY, scale, onlyDisc) {

        var alpha = parseFloat(ctx.globalAlpha);
        ctx.fillStyle = clr;

        scale = scale || 1;

        ctx.globalAlpha = alpha * 0.5;

        for (var x=0; x<this.size; x++) {
            for (var y=0; y<this.size; y++) {
                var val = this.edgeMap[x][y];
                if (val > -1 && (!onlyDisc || this.zones[val].discovered)) {
                    ctx.fillRect(x*scale+scale/4, (flipY ? (this.size-1)-y : y) * scale+scale/4, scale/2, scale/2);
                    ctx.fillRect(x*scale, (flipY ? (this.size-1)-y : y) * scale, scale, scale);
                }
            }
        }

        ctx.globalAlpha = alpha;

    };

    ret.worldToMap = function(p) {
        return new b2Vec2(
            p.x / this.gridSize,
            (this.size-1) - p.y / this.gridSize
        );
    };

    ret.getColMap = function(p) {
        var x = Math.floor(p.x/BSWG.tileSizeWorld);
        var y = Math.floor(p.y/BSWG.tileSizeWorld);
        return this.colMap[x] && this.colMap[x][y];
    };

    ret.getZone = function(p) {
        p = new b2Vec2(
            p.x / this.gridSize,
            p.y / this.gridSize
        );
        var best     = 0;
        var bestDist = Math.distSqVec2(this.zones[0].p, p);
        if (this.zones[0].hasPlanet && bestDist > (BSWG.map_planetSafeDist*BSWG.map_planetSafeDist)) {
            bestDist *= 1000.0;
        }
        for (var i=1; i<this.zones.length; i++) {
            var dist = Math.distSqVec2(this.zones[i].p, p);
            if (this.zones[i].hasPlanet && dist > (BSWG.map_planetSafeDist*BSWG.map_planetSafeDist)) {
                dist *= 1000.0;
            }
            if (dist < bestDist) {
                best = i;
                bestDist = dist;
            }
        }
        return this.zones[best];
    };

    var lastP = null;
    var lastBattleP = null;
    var lastBattleZone = null;
    var lastZone = null;
    var distanceLeft = Math.random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;

    ret.mapTime = 0.0;

    ret.tickSpawner = function(dt, p) {

        ret.mapTime += dt;

        var zone = this.getZone(p);

        if (BSWG.game.battleMode) {
            distanceLeft = Math.random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;
            lastBattleP = p.clone();
            lastP = p.clone();
            lastZone = zone;
            if (zone !== lastBattleZone) {
                return 'escape';
            }
            return null;
        }

        if (zone !== lastZone) {
            distanceLeft = Math.random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;
        }

        if (lastP) {
            distanceLeft -= Math.distVec2(lastP, p);
        }

        if (!lastBattleP || Math.distVec2(lastBattleP, p) > this.gridSize) {

            if (zone.hasPlanet && zone.boss) {

            }
            else if (zone.enemies && zone.enemies.length) {
                if (distanceLeft <= 0) {
                    this.escapeDistance = this.gridSize * 6.0 / 1.35;
                    lastBattleZone = zone;
                    distanceLeft = Math.random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;
                    return zone.enemies[~~(Math.random()*zone.enemies.length*0.9999)];
                }
            }

        }

        lastP = p.clone();
        lastZone = zone;

        return null;

    };

    if (!ret.enemies_placed) {
        BSWG.genMap_EnemyPlacement(ret, ret.eInfo);
        ret.enemies_placed = true;
    }

    return ret;

};

BSWG.map_genBiome = function() {

    Math.seedrandom();

    var ret = new Object();
    ret.water = Math.random();
    ret.grass = Math.random();
    ret.sand = Math.random();
    ret.rock = Math.pow(Math.random(), 0.5);
    ret.snow = Math.random();

    if (ret.sand > ret.snow) {
        ret.snow /= 10;
    }
    else {
        ret.sand /= 10;
    }

    if (ret.grass > ret.sand) {
        ret.sand /= 3;
    }
    else {
        ret.grass /= 3;
    }

    if (ret.grass > ret.snow) {
        ret.snow /= 10;
    }
    else {
        ret.grass /= 10;
    }

    if (ret.sand > ret.water) {
        ret.water /= 3;
    }
    else {
        ret.sand /= 3;
    }

    var sum = (ret.grass + ret.sand + ret.rock + ret.snow) / 4.0;
    ret.grass /= sum;
    ret.sand /= sum;
    ret.rock /= sum;
    ret.snow /= sum;

    ret.waterF = ret.water;
    ret.grassF = ret.grass;
    ret.sandF = ret.sand + ret.grassF;
    ret.rockF = ret.rock + ret.sandF;
    ret.snowF = ret.snow + ret.rockF;

    ret.heat = (ret.sand + ret.rock*0.5 + ret.grass*0.5) - ret.snow;
    ret.wet = (Math.random()*ret.water*0.25 + Math.random()*ret.snow*0.5 + Math.random()*ret.grass*0.25 - Math.random()*ret.sand*1.0) * 3.0;
    ret.dark = Math.pow(Math.random(), 1.5);

    return ret;
};

BSWG.genMap_EnemyPlacement = function(ret, eInfo) {

    var startZone = ret.planets[0].zone;
    var endZone = ret.planets[1].zone;
    var tDist = Math.distSqVec2(startZone.p, endZone.p);

    var withBoss = new Array();

    var order = new Array();
    for (var i=0; i<ret.zones.length; i++) {
        order.push(ret.zones[i]);
    }
    order.sort(function(a,b){
        return a.order - b.order;
    });

    for (var i=0; i<order.length; i++) {
        var zone = order[i];
        var startDist = Math.distSqVec2(zone.p, startZone.p);
        var endDist = Math.distSqVec2(zone.p, endZone.p);

        var level1 = (startDist / tDist) * (eInfo.maxLevel - eInfo.minLevel) + eInfo.minLevel;
        var level2 = (1.0 - endDist / tDist) * (eInfo.maxLevel - eInfo.minLevel) + eInfo.minLevel;

        var level = Math.floor(((zone.order - 1) / (ret.zones.length-1)) * (eInfo.maxLevel - eInfo.minLevel)) + eInfo.minLevel;

        zone.minLevel = Math.floor(Math.min(level1, level2));
        zone.maxLevel = Math.ceil(Math.max(level1, level2));
        zone.minLevel = Math.max(zone.minLevel, zone.maxLevel-3);

        var range = zone.maxLevel - zone.minLevel;
        if (i < 2) {
            range = 0;
        }
        else {
            range = 1;
        }
        zone.minLevel = level;
        zone.maxLevel = level + range;

        BSWG.genMap_MusicSettings_Zone(zone, eInfo);

        if (!zone.hasPlanet) {
            BSWG.genMap_EnemyPlacement_Zone(zone, eInfo);
        }
        else if (!zone.home) {
            withBoss.push(zone);
        }
    }

    withBoss.sort(function(a,b){
        return ((a.minLevel + a.maxLevel) * 0.5) - ((b.minLevel + b.maxLevel) * 0.5);
    });

    for (var i=0; i<withBoss.length && i<eInfo.bosses.length; i++) {
        withBoss[i].boss = eInfo.bosses[i];
    }

};

BSWG.genMap_MusicSettings_Zone = function(zone, eInfo) {

    var diff = Math.random() * (zone.maxLevel - zone.minLevel) + zone.minLevel;
    diff -= eInfo.minLevel * 0.5;
    diff = Math.clamp(diff/10, 0, 1);

    var bpm = 100 + ~~(45 * diff);
    var settings = {
        happy: 1.0-diff,
        intense: diff,
        rise: Math.random(),
        drop: Math.random(),
        crazy: Math.random()*diff*0.9+0.1,
        harmonize: Math.random(),
        smooth: 1-Math.random()*diff,
        rep: 0.05,
        seed1: ~~(Math.random()*100),
        seed2: 1 + ~~(Math.random()*99)
    };

    zone.musicBPM = bpm;
    zone.musicSettings = settings;
    Math.seedrandom((settings.seed1 || 51) + (settings.seed2 || 0) * 1000.0);
    zone.song = new BSWG.song(3, bpm, 0.0, settings);

    if (zone.hasPlanet) {
        var capSettings = {};
        for (var key in settings) {
            capSettings[key] = settings[key];
        }
        capSettings.happy = Math.random()*0.4 + 0.6;
        capSettings.intense *= 0.5;
        zone.musicCapSettings = capSettings;
        zone.songCap = new BSWG.song(3, bpm, 0.0, capSettings);
    }

};

BSWG.genMap_LoadMusicSettings_Zone = function(zone, eInfo) {

    if (zone.musicBPM && zone.musicSettings) {

        var settings = zone.musicSettings;
        Math.seedrandom((settings.seed1 || 51) + (settings.seed2 || 0) * 1000.0);
        zone.song = new BSWG.song(3, zone.musicBPM, 0.0, settings);

        if (zone.hasPlanet) {
            var capSettings = zone.musicCapSettings;
            if (!capSettings) {
                capSettings = {};
                for (var key in settings) {
                    capSettings[key] = settings[key];
                }
                capSettings.happy = Math.random()*0.4 + 0.6;
                capSettings.intense *= 0.5;
                zone.musicCapSettings = capSettings;
            }
            zone.songCap = new BSWG.song(3, zone.musicBPM, 0.0, capSettings);
        }
    }
    else {
        BSWG.genMap_MusicSettings_Zone(zone, eInfo);
    }

};

BSWG.pickEnemyLevel = function(zone, E) {
    var possible = new Array();
    for (var j=0; j<E.levels.length; j++) {
        if (E.levels[j] >= zone.minLevel && E.levels[j] <= zone.maxLevel) {
            possible.push(E.levels[j]);
        }
    }
    if (possible.length === 0) {
        console.log('BSWG.pickEnemyLevel error');
        return zone.minLevel;
    }
    else {
        return possible[(~~(Math.random()*1000000)) % possible.length];
    }
};

BSWG.genMap_EnemyPlacement_Zone = function(zone, eInfo) {

    zone.tech = new Array();
    for (var i=0; i<eInfo.minComponents.length; i++) {
        zone.tech.push(BSWG.enemySettings_compToStr(eInfo.minComponents[i]));
    }
    for (var i=0; i<eInfo.maxComponents.length; i++) {
        var C = eInfo.maxComponents[i];
        if (C.minLevel <= zone.minLevel) {
            var t = Math.clamp((C.minLevel - zone.minLevel) / (C.alwaysLevel - C.minLevel), 0, 1);
            var prob = t + C.minProb * (1-t);
            if (prob >= Math.random()) {
                zone.tech.push(BSWG.enemySettings_compToStr(C));
            }
        }
    }
    for (var i=0; i<zone.tech.length; i++) {
        var found = false;
        for (var j=i+1; j<zone.tech.length && !found; j++) {
            if (BSWG.compImplied(zone.tech[i], zone.tech[j])) {
                found = true;
            }
        }
        if (found) {
            zone.tech.splice(i, 1);
            i --;
            continue;
        }
    }

    zone.enemies = new Array();
    var k = 250;
    while (zone.enemies.length < 8 && k-- > 0) {
        for (var i=0; i<eInfo.enemies.length; i++) {
            var E = eInfo.enemies[i];
            var found = false;
            for (var j=0; j<zone.enemies.length && !found; j++) {
                if (zone.enemies[j] === E) {
                    found = true;
                }
            }
            if (found) {
                continue;
            }
            found = false;
            for (var j=0; j<E.levels.length; j++) {
                if (E.levels[j] >= zone.minLevel && E.levels[j] <= zone.maxLevel) {
                    found = true;
                }
            }
            if (found) {
                var E2 = BSWG.getEnemy(E.type);
                if (E2 && E2.obj && E2.stats) {
                    //var prob = E2.compStats(zone.tech);
                    //prob = Math.pow(prob, 2.0);
                    //if (Math.random() < prob) {
                    //    zone.enemies.push(E);
                    //}
                    if (Math.random() < 0.05) {
                        zone.enemies.push(E);
                    }
                }
            }
        }
    }

};