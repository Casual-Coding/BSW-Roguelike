BSWG.map_minZoneDist     = 10; // Minimum distance allowed between two zones
BSWG.map_minZoneEdgeDist = 10; // Minimum distance allowed from a zone center to edge of map
BSWG.map_gridSize        = 50.0;

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
            break;
        }
    }

    for (var x=0; x<size; x++) {
        for (var y=0; y<size; y++) {
            var p = new b2Vec2(x, y);
            var best = 0;
            for (var i=1; i<numZones; i++) {
                if (Math.distSqVec2(ret.zones[best].p, p) > Math.distSqVec2(ret.zones[i].p, p)) {
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
        for (var i=1; i<this.zones.length; i++) {
            var dist = Math.distSqVec2(this.zones[i].p, p);
            if (dist < bestDist) {
                best = i;
                bestDist = dist;
            }
        }
        return this.zones[best];
    };

    return ret;

};