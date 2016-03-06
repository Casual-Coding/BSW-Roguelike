BSWG.map_minZoneDist     = 10; // Minimum distance allowed between two zones
BSWG.map_minZoneEdgeDist = 10; // Minimum distance allowed from a zone center to edge of map
BSWG.map_gridSize        = 50.0;
BSWG.map_flPlanetDist    = 0.9; // * size
BSWG.map_minPlanetDist   = 30; // Minimum distance allowed between planets
BSWG.map_planetSafeDist  = 6.5; // Size of zone surrounding planet

BSWG.genMap = function(size, numZones, numPlanets) {

    var ret = new Object();

    size       = size || 128;
    numZones   = numZones || 20;
    numPlanets = numPlanets || 5;

    ret.size     = size;
    ret.zones    = new Array(numZones);
    ret.gridSize = BSWG.map_gridSize;
    ret.zoneMap  = new Array(size);
    ret.edgeMap  = new Array(size);
    ret.planets  = new Array(numPlanets);

    for (var i=0; i<size; i++) {
        ret.zoneMap[i] = new Array(size);
        ret.edgeMap[i] = new Array(size);
        for (var j=0; j<size; j++) {
            ret.zoneMap[i][j] = -1;
            ret.edgeMap[i][j] = -1;
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
                ret.zones[i].name = BSWG.randomName.get();
                ret.zones[i].discovered = false;
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
                console.log('Map generator error: Number of zones forced to less than number of planets')
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
                ret.zoneMap[x-1][y+1] !== ret.zoneMap[x][y])
                ret.edgeMap[x][y] = ret.zoneMap[x][y];
        }
    }

    ret.renderZoneMap = function (ctx, clr, flipY, scale, onlyDisc) {

        var alpha = parseFloat(ctx.globalAlpha);
        ctx.fillStyle = clr;

        scale = scale || 1;

        for (var x=0; x<this.size; x++) {
            for (var y=0; y<this.size; y++) {
                var val = ret.zoneMap[x][y];
                if (val > -1 && (!onlyDisc || this.zones[val].discovered)) {
                    ctx.globalAlpha = alpha * (val+1) / ret.zones.length;
                    ctx.fillRect(x*scale, (flipY ? (this.size-1)-y : y) * scale, scale, scale);
                }
            }
        }

        ctx.globalAlpha = alpha;

    };

    ret.renderEdgeMap = function (ctx, clr, flipY, scale, onlyDisc) {

        var alpha = parseFloat(ctx.globalAlpha);
        ctx.fillStyle = clr;

        scale = scale || 1;

        for (var x=0; x<this.size; x++) {
            for (var y=0; y<this.size; y++) {
                var val = ret.edgeMap[x][y];
                if (val > -1 && (!onlyDisc || this.zones[val].discovered)) {
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

    return ret;

};