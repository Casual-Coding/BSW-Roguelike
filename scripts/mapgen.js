BSWG.map_minZoneDist     = 15; // Minimum distance allowed between two zones
BSWG.map_minZoneEdgeDist = 20; // Minimum distance allowed from a zone center to edge of map
BSWG.map_gridSize        = 24.0; // overwritte as BSWG.tileSizeWorld
BSWG.map_flPlanetDist    = 0.9; // * size
BSWG.map_minPlanetDist   = 30; // Minimum distance allowed between planets
BSWG.map_planetSafeDist  = 8; // Size of zone surrounding planet

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
        intro: {
            who: -1,
            friend: true,
            text: [
                "Are you there?",
                "Your sister took the pictures of miss wiskers with her when we all moved out! .... All 20 billion of them!",
                "Will you be a dear and find her and get the pictures back for me? With all of you moved out.... and your father gone.... they're really the only thing I have.",
                "I'd ask her myself, but I don't know how to contact her. She was angry when she left, .... she must have felt like I didn't do enough for your brother Zef.",
                "From what I've been told Zef has taken to cloning himself, he's created a small army and is slowly taking over the system.... Watch out for his clones when you're out there!",
                { text: "What's that? You deconstructed your ship? Well hurry up and build it up again! There should be some components in your store for that.", btnHighlight: "store" },
                { text: "You can take components out and put them in from anywhere, just be careful about leaving them around, they might disappear!", btnHighlight: "store" },
                { text: "Go into build mode to attach components to your ship, you can drag them around with left mouse, and weld them together by clicking the weld points.", btnHighlight: "build" },
                { text: "Some components are activated by keypress, for those ones you can right click them when they're attached to your ship and press a key to bind to that component.", btnHighlight: "keys" },
                { text: "I think that's everything... be safe and good luck! ...... Oh, and come back here any time if you need something for your ship... I don't have much, but I'll help you if I can!", btnHighlight: "trade" }
            ]
        },
        bosses: [ // ordered by difficulty
            {
                who: 161,
                enemies: [ { type: 'missile-boss', levelInc: 2.0 } ],
                dialog: {
                    who: 161,
                    friend: false,
                    text: [
                        "I hear you've been destroying my drone ships!",
                        "Have you heard that I'm going to kill you?",
                        "Because I'm going to kill you!",
                        "PREPARE TO DIE!"
                    ]
                },
                wdialog: {
                    who: 161,
                    friend: true,
                    text: [
                        "Ouch... Good thing I escaped my ship just in time...",
                        "What? There's only one of you? Damn, I almost killed you...",
                        "You really should make clones of yourself... no?",
                        "Why not? The universe is a dangerous place! Look what happened to dad...",
                        "I guess owe you, you know, for allmost whiping you out...",
                        { text: "Tell you what, come here any time and I'll trade with you... Just don't tell any other Zef you were here!", btnHighlight: "trade" }
                    ]
                }
            },
            {
                who: 54,
                enemies: [ { type: 'mele-boss', levelInc: 2.0 } ],
                dialog: {
                    who: 54,
                    friend: false,
                    text: [
                        "I've been trying to find you,",
                        "And now you're here!",
                        "I'm going to slash and grind you",
                        "MY NAME IS FEAR!"
                    ]
                },
                wdialog: {
                    who: 54,
                    friend: true,
                    text: [
                        "Allright allright! I get the point!",
                        "This is just like when we were little... always scrapping...",
                        "Mom hated it when we fought, always tried to break it up...",
                        "If it was just Dad around though he wouldn't do it unless our fights went too far... He knew we needed to... to make us strong...",
                        "But it still wasn't enough! If only we had been stronger, he'd still be here.",
                        { text: "Help you find sister? Nah, I have to stay here, a Zef never abandons his post... But come back here whenever you want, I'll try to help you if I can.", btnHighlight: "trade"} 
                    ]
                }                
            },
            {
                who: 77,
                enemies: [ { type: 'big-flail', levelInc: 2 } ],
                dialog: {
                    who: 77,
                    friend: false,
                    text: [
                        "Smash crash!",
                        "Smash bash!",
                        "Slice dice!",
                        "...",
                        "...",
                        "Damnit, I suck at poetry...",
                        "BUT I DON'T NEED POEMS TO DESTROY YOU!"
                    ]
                },
                wdialog: {
                    who: 77,
                    friend: true,
                    text: [
                        "Seems like I suck at being a warlord too...",
                        "Maybe I should become a merchant like Dad?",
                        "It runs in the blood after all!",
                        "You know the day before dad died I'd never seen him so scared...",
                        "I overheard him talking to mother, he refused to sell components to someone...",
                        "Something about not supporting evil.. You know if I was him I would sell to anyone!",
                        "No sense in getting yourself killed over some blocks! I mean, what if you had children to support and you were killed?",
                        { text: "Haha, yes that means I'll sell to you! Just don't let any other Zef see you here! They're my main customers!" }
                    ]
                }
            },
            {
                who: 31,
                enemies: [ { type: 'mele-boss', levelInc: 2 }, { type: 'brute', levelInc: 1 } ]
            },
            {
                who: 11,
                enemies: [ { type: 'big-flail', levelInc: 2 }, { type: 'heavy-fighter', levelInc: 1 } ]
            },
            {
                who: 49,
                enemies: [ { type: 'crippler', levelInc: 2 }, { type: 'cruncher-boss', levelInc: 1 } ]
            },
            {
                who: 3,
                enemies: [ { type: 'goliath', levelInc: 2 }, { type: 'heavy-fighter', levelInc: 1 }, { type: 'heavy-fighter', levelInc: 1 } ]
            }
        ],
        enemies: [
            { type: 'big-flail',        levels: [8,9,10] },
            { type: 'big-spinner',      levels: [6,7,8] },
            { type: 'brute',            levels: [5,6,7] },
            { type: 'brute',            levels: [8,9,10], max: 2 },
            { type: 'crippler',         levels: [8,9,10] },
            { type: 'fighter',          levels: [0,1,2,5,6], max: 2 },
            { type: 'fighter',          levels: [0,1], with: [ 'uni-dir-fighter' ] },
            { type: 'fighter',          levels: [0,1], with: [ 'fighter' ] },
            { type: 'fighter',          levels: [0,1], with: [ 'four-blaster-x2' ] },
            { type: 'four-blaster-x2',  levels: [0,1] },
            { type: 'four-blaster-x2',  levels: [0,1], with: [ 'uni-dir-fighter' ] },
            { type: 'four-blaster-x2',  levels: [0,1], with: [ 'fighter' ] },
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
            { type: 'little-tough-guy', levels: [0,1,2] },
            { type: 'little-tough-guy', levels: [2,3], max: 2 },
            { type: 'tough-guy',        levels: [5,6,7], max: 2 },
            { type: 'stinger',          levels: [2,3] },
            { type: 'stinger',          levels: [4,5,6], max: 2 },
            { type: 'brutenie',         levels: [0,1] },
            { type: 'brutenie',         levels: [1,2], with: [ 'brutenie'] },
            { type: 'brutenie',         levels: [0,1,2], with: [ 'uni-dir-fighter' ] },
            { type: 'brutenie',         levels: [1,2], with: [ 'fighter' ] },
            { type: 'marauder',         levels: [1,2,3] },
            { type: 'marauder',         levels: [1,2,3] },
            { type: 'marauder',         levels: [1,2,3], with: [ 'mini-gunner' ] },
            { type: 'marauder',         levels: [2,3,4], with: [ 'mini-gunner' ] },
            { type: 'marauder-2',       levels: [3,4,5,6] },
            { type: 'marauder-2',       levels: [4,5,6,7] },
            { type: 'marauder-2',       levels: [4,5,6,7] },
            { type: 'marauder',         levels: [2,3,4], with: [ 'marauder'] },
            { type: 'marauder',         levels: [2,3,4], with: [ 'little-tough-guy'] },
            { type: 'striker',          levels: [2,3,4], with: [ 'marauder' ] },
            { type: 'striker',          levels: [4,5,6], max: 2, with: [ 'marauder' ] },
            { type: 'striker',          levels: [2,3], max: 2, with: [ 'freighter' ] },
            { type: 'striker',          levels: [4,5], max: 2, with: [ 'freighter-2' ] },
            { type: 'marauder-2',       levels: [5,6,7], max: 2, with: [ 'freighter-2' ] },
            { type: 'striker',          levels: [4,5,6], with: [ 'freighter' ] },
            { type: 'striker',          levels: [4,5,6], max: 2, with: [ 'freighter' ] },
            { type: 'striker',          levels: [4,5,6], with: [ 'little-brute', 'little-tough-guy'] },
            { type: 'freighter',        levels: [2,3,4,5,6] },
            { type: 'freighter-2',      levels: [4,5,6] },
            { type: 'tracker',          levels: [0] },
            { type: 'tracker',          levels: [0] },
            { type: 'tracker',          levels: [0] },
            { type: 'tracker',          levels: [1], max: 2 },
            { type: 'tracker',          levels: [1], max: 2 },
            { type: 'tracker',          levels: [1], max: 2 },
            { type: 'fighter-mg',       levels: [1, 2, 3], max: 2 },
            { type: 'fighter-mg',       levels: [2, 3], max: 2 },
            { type: 'fighter-mg',       levels: [2], max: 2 },
            { type: 'four-minigun',     levels: [1, 2, 3], max: 2 },
            { type: 'four-minigun',     levels: [1, 2], max: 2 },
            { type: 'four-minigun',     levels: [2], max: 2 },
            { type: 'mini-gunner',      levels: [1] },
            { type: 'mini-gunner',      levels: [1] },
            { type: 'mini-gunner',      levels: [1, 2] },
            { type: 'mini-gunner',      levels: [1, 2] },
            { type: 'mini-gunner',      levels: [1, 2] },
            { type: 'fighter-mg-2',     levels: [1, 2] },
            { type: 'fighter-mg-2',     levels: [1, 2] },
            { type: 'fighter-mg-2',     levels: [1, 2] },
            { type: 'fighter-mg-2',     levels: [2, 3], max: 2 },
            { type: 'fighter-mg-2',     levels: [2, 3], max: 2 },
            { type: 'fighter-mg-2',     levels: [2, 3], max: 2 },
            { type: 'mini-gunner',      levels: [1, 2, 3] },
            { type: 'mini-gunner',      levels: [1, 2, 3] },
            { type: 'mini-gunner',      levels: [2, 3, 4], max: 2 },
            { type: 'mini-gunner',      levels: [3, 4, 5], max: 2 },
            { type: 'mini-gunner-m2',   levels: [3, 4, 5] },
            { type: 'mini-gunner-m2',   levels: [3, 4, 5] },
            { type: 'mini-gunner-m2',   levels: [3, 4, 5] },
            { type: 'mini-gunner-m3',   levels: [5, 6, 7] },
            { type: 'mini-gunner-m3',   levels: [5, 6, 7] },
            { type: 'mini-gunner-m3',   levels: [5, 6, 7] }
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

        var bn = 0;
        for (var i=0; i<ret.zones.length; i++) {
            BSWG.genMap_LoadMusicSettings_Zone(ret.zones[i], ret.eInfo);
            BSWG.genMap_updateBosses(ret, BSWG.enemySettings[ret.areaNo]);
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
                var a = Math.ceil(Math.sqrt(numZones));
                var p = new b2Vec2((i%a)+0.5, (~~(i/a))+0.5);
                var sc = ret.size / a;
                p.x *= sc;
                p.y *= sc;
                p.x += Math.random()*6-3;
                p.y += Math.random()*6-3;
                var valid = true;
                if (true) {
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
                return BSWG.genMap(size, numZones, numPlanets);
                /*numZones = i;
                ret.zones.length = numZones;
                if (i === 0) {
                    console.log('Map generation error: Number of zones forced to 0');
                }
                if (i < numPlanets) {
                    console.log('Map generation error: Number of zones forced to less than number of planets')
                }*/
                break;
            }
        }

        var start = ~~(Math.random()*100000) % ret.zones.length;
        var vcount = 0;

        var a = Math.ceil(Math.sqrt(numZones));
        var sc = size / a;

        ret.maxMazeLevel = 0;

        var paths = [];

        var mazeGen = function(id, level) {
            var z = ret.zones[id];
            if (z.order) {
                return;
            }
            vcount += 1;
            z.order = vcount;
            z.mazeLevel = level = level || 0;
            ret.maxMazeLevel = Math.max(ret.maxMazeLevel, z.mazeLevel);
            var x = id % a;
            var y = ~~(id / a);
            var ord = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];
            while (ord.length) {
                var idx = Math.floor(Math.random()*10000) % ord.length;
                var vec = ord[idx];
                ord.splice(idx, 1);
                if (vec[0]+x >= 0 && vec[0]+x < a && vec[1]+y >= 0 && vec[1]+y < a) {
                    var id2 = (vec[0]+x) + (vec[1]+y) * a;
                    var z2 = ret.zones[id2];
                    if (!z2.order) {
                        paths.push([z, z2]);
                        mazeGen(id2, level+1);
                    }
                }
            }
        }

        mazeGen(start);

        if (ret.maxMazeLevel < numPlanets*2) {
            return BSWG.genMap(size, numZones, numPlanets, areaNo);
        }

        ret.planets[0] = new Object();
        ret.planets[0].zone = ret.zones[start];
        ret.planets[0].p = ret.zones[start].p;
        ret.planets[0].worldP = new b2Vec2(ret.planets[0].p.x * ret.gridSize, ret.planets[0].p.y * ret.gridSize);
        ret.zones[start].home = true;
        ret.zones[start].safe = true;
        ret.zones[start].hasPlanet = true;

        var end = -1;

        for (var i=0; i<ret.zones.length; i++) {
            if (end === -1 || ret.zones[i].mazeLevel > ret.zones[end].mazeLevel) {
                end = i;
            }
        }
        
        ret.planets[1] = new Object();
        ret.planets[1].zone = ret.zones[end];
        ret.planets[1].p = ret.zones[end].p;
        ret.planets[1].worldP = new b2Vec2(ret.planets[1].p.x * ret.gridSize, ret.planets[1].p.y * ret.gridSize);
        ret.zones[end].hasPlanet = true;
        ret.zones[end].end = true;

        for (var i=2; i<ret.planets.length; i++) {
            var mazeLevel = Math.floor((i-1) / (ret.planets.length-1) * ret.maxMazeLevel);
            var j = -1;
            for (var k=0; k<ret.zones.length; k++) {
                if (ret.zones[k].mazeLevel === mazeLevel && !ret.zones[k].hasPlanet) {
                    j = k;
                    break;
                }
            }
            var z = ret.zones[j];
            ret.planets[i] = new Object();
            ret.planets[i].zone = z;
            ret.planets[i].p = z.p;
            ret.planets[i].worldP = new b2Vec2(ret.planets[i].p.x * ret.gridSize, ret.planets[i].p.y * ret.gridSize);
            z.hasPlanet = true;
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
            }
        }
        for (var k=0; k<10000; k++) {
            var x = Math.floor(Math.random() * (ret.size-2)) + 1;
            var y = Math.floor(Math.random() * (ret.size-2)) + 1;
            if ((ret.colMap[x-1][y] || ret.colMap[x+1][y] || ret.colMap[x][y-1] || ret.colMap[x][y+1]) && Math.random() > 1/10) {
                ret.colMap[x][y] = true;
            }
        }

        for (var x=0; x<size; x++) {
            for (var y=0; y<size; y++) {
                var zone = ret.zones[ret.zoneMap[x][y]];
                if (!zone.hasPlanet && Math.random() < 0.01 && Math.distVec2(zone.p, new b2Vec2(x, y)) > 1.5) {
                    ret.colMap[x][y] = true;
                }
            }
        }

        for (var i=0; i<paths.length; i++) {
            for (var _x=0; _x<size; _x++) {
                for (var _y=0; _y<size; _y++) {
                    if (Math.pointLineDistance(paths[i][0].p, paths[i][1].p, new b2Vec2(_x, _y)) < 2) {
                        ret.colMap[_x][_y] = false;
                    }
                }
            }
        }

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
                for (var i=0; i<ret.zones.length; i++) {
                    var p = ret.zones[i];
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
            normalMap: BSWG.render.images['rock_nm'].texture,
            collision: true,
            color: [0.2, 0.2, 0.2],
            reflect: 0.1,
            normalMapAmp: 1.0,
            normalMapScale: 1.0,
            zscale: 2.0
        },
        'tileset-land': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 1;
            },
            color: [0.4*.85, 0.75*.85, 0.25*.85],
            normalMap: BSWG.render.images['grass_nm'].texture,
            relfect: 0.05,
            normalMapAmp: 2.0,
            normalMapScale: 0.7
        },
        'tileset-sand': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 2;
            },
            color: [1.75*0.35, 1.25*0.35, 0.1*0.35],
            reflect: 0.05,
            normalMap: BSWG.render.images['sand_nm'].texture,
            normalMapScale: 0.1,
            normalMapAmp: 1.0,
        },
        'tileset-rockland': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 3;
            },
            normalMap: BSWG.render.images['rock_nm'].texture,
            color: [0.75/3, 0.6/3, 0.6/3],
            reflect: 0.15,
            normalMapScale: 2.0,
            normalMapAmp: 1.0,
        },
        'tileset-snow': {
            map: function(x,y) {
                return x >= 0 && y >= 0 && x < size && y < size && ret.terMap[x][y] === 4;
            },
            color: [2.25*0.5, 2.3*0.5, 2.5*0.5],
            reflect: 0.05,
            normalMap: BSWG.render.images['snow_nm'].texture,
            normalMapScale: 0.2,
            normalMapAmp: 0.75,
        },
        'tileset-below': {
            map: function(x,y) {
                return !(x < 0 || y < 0 || x >= size || y >= size || ret.colMap[x][y]);
            },
            color: [0.75/2, 0.75/2, 0.20/2],
            normalMap: BSWG.render.images['rock_nm'].texture,
            isBelow: true,
            reflect: 0.25,
            normalMapAmp: 1.0,
            normalMapScale: 2.5
        },
        'water': {
            color: [0.05*0.5, 0.4*0.25, 0.75*0.5, 0.85],
            level: 0.20,
            normalMapScale: 0.5,
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
                        return ['rgba(192, 192, 192, 1)', 'tileset-mountain'];
                    }
                    else if (ret.terMap[x][y] === 0) {
                        return ['rgba(6, 50, 80, 1)', 'water'];
                    }
                    else if (ret.terMap[x][y] === 1) {
                        return ['rgba(40, 80, 20, 1)', 'tileset-land'];
                    }
                    else if (ret.terMap[x][y] === 2) {
                        return ['rgba(96, 72, 48, 1)', 'tileset-sand'];
                    }
                    else if (ret.terMap[x][y] === 3) {
                        return ['rgba(56, 40, 40, 1)', 'tileset-rockland'];
                    }
                    else if (ret.terMap[x][y] === 4) {
                        return ['rgba(130, 130, 130, 1)', 'tileset-snow'];
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
                else if (obj instanceof BSWG.orb) {
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

    for (var i=0; i<ret.zones.length; i++) {
        ret.zones[i].rmin = new b2Vec2(10000, 10000);
        ret.zones[i].rmax = new b2Vec2(-10000, -10000);
        for (var x=0; x<ret.size; x++) {
            for (var y=0; y<ret.size; y++) {
                if (ret.zoneMap[x][y] === i) {
                    ret.zones[i].rmin.x = Math.min(ret.zones[i].rmin.x, x);
                    ret.zones[i].rmax.x = Math.max(ret.zones[i].rmax.x, x);
                    ret.zones[i].rmin.y = Math.min(ret.zones[i].rmin.y, y);
                    ret.zones[i].rmax.y = Math.max(ret.zones[i].rmax.y, y);
                }
            }
        }
    }

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

    ret.getTType = function(p) {
        var x = Math.floor(p.x/BSWG.tileSizeWorld);
        var y = Math.floor(p.y/BSWG.tileSizeWorld);
        if (this.terMap[x]) {
            return this.terMap[x][y] || 0;
        }
        else {
            return 0;
        }
    };

    ret.colInBox = function(x1, y1, x2, y2) {
        var ax = Math.floor(x1/BSWG.tileSizeWorld);
        var ay = Math.floor(y1/BSWG.tileSizeWorld);
        var bx = Math.floor(x2/BSWG.tileSizeWorld);
        var by = Math.floor(y2/BSWG.tileSizeWorld);
        for (var x=ax; x<=bx; x++) {
            for (var y=ay; y<=by; y++) {
                if (this.colMap[x] && this.colMap[x][y]) {
                    return true;
                }
            }
        }
        return false;
    }

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

    ret.mlMap = {};

    ret.minLevelComp = function(key) {

        if (typeof key !== 'string') {
            key = key.getKey();
        }
        if (key in this.mlMap) {
            return this.mlMap[key];
        }
        else {
            return this.eInfo.maxLevel+1;
        }

    };

    ret.updateMinLevelComp = function(key, level) {

        if (typeof key !== 'string') {
            key = key.getKey();
        }

        level = Math.floor(level || 0);

        if (!(key in this.mlMap) || (this.mlMap[key] > level)) {
            this.mlMap[key] = level;
        }

    };

    var lastP = null;
    var lastBattleP = null;
    var lastBattleZone = null;
    var lastZone = null;
    var distanceLeft = Math.random() * 10 * ret.gridSize / 1.35 + 6 * ret.gridSize / 1.35;

    ret.mapTime = 0.0;

    ret.resetTickSpawner = function(zone) {
        if (!zone) {
            distanceLeft = this.gridSize * 8;
            return;
        }
        if (zone.boss && !zone.bossDefeated) {
            distanceLeft = this.gridSize * 2.5;
        }
        else {
            distanceLeft = Math.random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;
        }
    };

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

        if (BSWG.orbList.atSafe() || zone.bossDefeated) {
            this.resetTickSpawner(zone);
            return null;
        }

        if (zone !== lastZone) {
            if (zone.boss && !zone.bossDefeated) {
                distanceLeft = this.gridSize * 2.5;
            }
            else {
                distanceLeft = Math._random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;
            }
        }

        if (lastP) {
            distanceLeft -= Math.distVec2(lastP, p);
        }

        if (!lastBattleP || Math.distVec2(lastBattleP, p) > this.gridSize) {

            if (zone.hasPlanet && zone.boss) {
                this.escapeDistance = this.gridSize * 1000.0;
                lastBattleZone = zone;
                distanceLeft = Math._random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;
                if (zone.boss.dialog) {
                    BSWG.game.linearDialog(zone.boss.dialog, true);
                }
                return zone.boss.enemies;
            }
            else if (zone.enemies && zone.enemies.length) {
                if (distanceLeft <= 0) {
                    this.escapeDistance = this.gridSize * 4.0 / 1.35;
                    lastBattleZone = zone;
                    distanceLeft = Math._random() * 10 * this.gridSize / 1.35 + 6 * this.gridSize / 1.35;
                    var _ex = ((Math._random() < 0.15) ? .01 + ((Math._random() < 0.25) ? .01 : 0) : 0);
                    Math.seedrandom(Math.floor(p.x / (this.gridSize*8)) + 10000 * Math.floor(p.y / (this.gridSize*8)) + this.getTType(p)*0.1 + _ex);
                    var e = zone.enemies[~~(Math.random()*zone.enemies.length*0.9999)];
                    Math.seedrandom();
                    return e;
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

    for (var i=0; i<ret.zones.length; i++) {
        if (ret.zones[i].mazeLevel < 1) {
            ret.zones[i].maxLevel = ret.zones[i].minLevel = 0;
        }
        else if (ret.zones[i].maxLevel < 2) {
            ret.zones[i].minLevel = 0;
            ret.zones[i].maxLevel = 1;
        }
    }

    for (var i=0; i<ret.zones.length; i++) {
        BSWG.genMap_ComputeCompCount(ret.zones[i], ret.eInfo, ret.zones[i].home);
        for (var key in ret.zones[i].compHist) {
            ret.updateMinLevelComp(key, ret.zones[i].maxLevel);
        }
    }

    for (var i=0; i<ret.zones.length; i++) {
        BSWG.genMap_ComputeTrading(ret.zones[i], ret.zones, ret.eInfo);
    }

    return ret;

};

BSWG.map_genBiome = function() {

    Math.seedrandom(Math.random());

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
        ret.sand /= 10;
    }
    else {
        ret.grass /= 10;
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

    var sand = ret.sand > ret.grass && ret.sand > ret.snow ? ret.sand : 0.0;
    var grass = ret.grass > ret.sand && ret.grass > ret.snow ? ret.grass : 0.0;
    var snow = ret.snow > ret.grass && ret.snow > ret.sand ? ret.snow : 0.0;

    ret.heat = (sand*2.0 + grass) - snow*2.0;
    ret.wet = (ret.water*0.25 + snow*0.5 + grass*0.5 - sand) * 1.75;
    ret.dark = Math.pow(Math.random(), 0.35);

    return ret;
};

BSWG.genMap_updateBosses = function(ret, eInfo) {

    var withBoss = new Array();
    for (var i=0; i<ret.zones.length; i++) {
        if (ret.zones[i].boss) {
            withBoss.push(ret.zones[i]);
        }
    }

    withBoss.sort(function(a,b){
        return ((a.minLevel + a.maxLevel) * 0.5) - ((b.minLevel + b.maxLevel) * 0.5);
    });

    for (var i=0; i<withBoss.length && i<eInfo.bosses.length; i++) {
        withBoss[i].boss = eInfo.bosses[i];
    }
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

        zone.minLevel = Math.floor((zone.mazeLevel / (ret.maxMazeLevel+1)) * (eInfo.maxLevel - eInfo.minLevel) + eInfo.minLevel);
        zone.maxLevel = ((zone.mazeLevel+1) / (ret.maxMazeLevel+1)) * (eInfo.maxLevel - eInfo.minLevel) + eInfo.minLevel;

        BSWG.genMap_MusicSettings_Zone(zone, eInfo);

        if (!zone.hasPlanet) {
            BSWG.genMap_EnemyPlacement_Zone(zone, eInfo, i === 0 ? null : order[i-1]);
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
    //zone.song = new BSWG.song(3, bpm, 0.0, settings);

    if (zone.hasPlanet) {
        var capSettings = {};
        for (var key in settings) {
            capSettings[key] = settings[key];
        }
        capSettings.happy = Math.random()*0.4 + 0.6;
        capSettings.intense *= 0.5;
        zone.musicCapSettings = capSettings;
        //zone.songCap = new BSWG.song(3, bpm, 0.0, capSettings);
    }

};

BSWG.genMap_LoadMusicSettings_Zone = function(zone, eInfo) {

    if (zone.musicBPM && zone.musicSettings) {

        var settings = zone.musicSettings;
        Math.seedrandom((settings.seed1 || 51) + (settings.seed2 || 0) * 1000.0);
        //zone.song = new BSWG.song(3, zone.musicBPM, 0.0, settings);

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
            //zone.songCap = new BSWG.song(3, zone.musicBPM, 0.0, capSettings);
        }
    }
    else {
        BSWG.genMap_MusicSettings_Zone(zone, eInfo);
    }

};

BSWG.pickEnemyLevel = function(zone, E) {
    if (zone.boss) {
        return ((zone.maxLevel + zone.minLevel) * 0.5) + E.levelInc;
    }

    var maxLevel = zone.maxLevel;
    if (Math.floor(BSWG.game.ccblock.level()) >= Math.floor(maxLevel)) {
        maxLevel = Math.floor(maxLevel) + 1;
    }

    var possible = new Array();
    for (var j=0; j<E.levels.length; j++) {
        if (E.levels[j] >= zone.minLevel && E.levels[j] <= maxLevel) {
            possible.push(E.levels[j] + Math.random() * (maxLevel - E.levels[j]));
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

BSWG.genMap_ComputeCompCount = function(zone, eInfo, isFirst) {

    zone.compHist = {};
    zone.compHistBoss = {};

    var addEnemy = function(type, boss) {
        var stats = BSWG.getEnemyStats(type); // cached
        for (var key in stats) {
            if (key.split(',')[0] !== 'cc') {
                var fkey = BSWG.componentList.fixKey(key);
                zone.compHist[fkey] = (zone.compHist[fkey] ? zone.compHist[fkey] : 0) + stats[key];
                if (boss) {
                    zone.compHistBoss[fkey] = (zone.compHistBoss[fkey] ? zone.compHistBoss[fkey] : 0) + stats[key];
                }
            }
        }
    };

    if (isFirst) {
        for (var i=0; i<BSWG.game.initComponents.length; i++) {
            var key = BSWG.game.initComponents[i];
            var fkey = BSWG.componentList.fixKey(key);
            zone.compHist[fkey] = (zone.compHist[fkey] ? zone.compHist[fkey] : 0) + 4;
        }
    }

    if (zone.boss) {
        if (zone.boss.enemies) {
            for (var i=0; i<zone.boss.enemies.length; i++) {
                addEnemy(zone.boss.enemies[i].type, true);
            }
        }
    }
    else if (zone.enemies) {
        for (var i=0; i<zone.enemies.length; i++) {
            var E = zone.enemies[i];
            if (E.max) {
                for (var j=0; j<E.max; j++) {
                    addEnemy(E.type);
                }
            }
            else {
                addEnemy(E.type);
            }
            if (E.with) {
                for (var j=0; j<E.with.length; j++) {
                    addEnemy(E.with[j]);
                }
            }
        }
    }

};

BSWG.genMap_ComputeTrading = function(zone, all, eInfo) {

    var minLevel = Math.max(zone.minLevel - 2, 0);
    var maxLevel = zone.maxLevel + 1;

    var compHist = {};
    var compHistBoss = {};

    for (var i=0; i<all.length; i++) {
        var Z = all[i];
        if (Z.maxLevel >= minLevel && Z.minLevel <= maxLevel) {
            if (Z.compHist) {
                for (var key in Z.compHist) {
                    compHist[key] = (compHist[key] ? compHist[key] : 0) + Z.compHist[key];
                }
                if (Z === zone) {
                    for (var key in Z.compHistBoss) {
                        compHistBoss[key] = (compHistBoss[key] ? compHistBoss[key] : 0) + Z.compHistBoss[key];
                    }
                }
            }
        }
    }

    var compVal = {};
    for (var key in compHist) {
        compVal[key] = BSWG.componentList.compStrValue(key);
        if (compHistBoss[key] === compHist[key]) {
            compVal[key] *= 1.75;
        }
    }

    var list = [];
    for (var key in compHist) {
        list.push([key, compVal[key] / Math.pow(Math.max(compHist[key] - (compHistBoss[key] || 0.0), 1), 0.75), compVal[key], compHist[key]]);
    }

    list.sort(function(a,b){
        return b[1] - a[1];
    });

    zone.compValList = [];
    zone.compValMaxValue = 0;
    for (var i=0; i<list.length; i++) {
        zone.compValList.push({
            key: list[i][0],
            value: list[i][1],
            rare: compHist[list[i][0]] && (compHistBoss[list[i][0]] === compHist[list[i][0]])
        });
        zone.compValMaxValue = Math.max(zone.compValMaxValue, list[i][1]);
    }
    zone.compValLookup = {};
    for (var i=0; i<zone.compValList.length; i++) {
        zone.compValLookup[zone.compValList[i].key] = zone.compValList[i];
    }

    /*zone.exchanges = [];

    for (var i=0; i<list.length; i++) {
        var ex = {
            key: list[i][0],
            cost: list[i][1],
            trade: []
        };
        Math.seedrandom(ex.key);
        for (var k=0; k<100; k++) {
            ex.trade = [];
            var cost = ex.cost;
            for (var j=i+1; j<list.length; j++) {
                if (compHistBoss[list[j][0]] === compHist[list[j][0]]) {
                    continue;
                }
                if (Math.random() > 0.5) {
                    continue;
                }
                if (ex.trade.length >= 3) {
                    break;
                }
                if (list[j][1] > cost*0.95) {
                    continue;
                }
                var subex = {
                    key: list[j][0],
                    count: 0
                };
                while (cost >= list[j][1] && cost > (0.01 * ex.cost) && subex.count < 10) {
                    cost -= list[j][1];
                    subex.count += 1;
                }
                if (subex.count > 0) {
                    ex.trade.push(subex);
                }
            }
            if (cost < (ex.cost*0.25)) {
                zone.exchanges.push(ex);
                break;
            }
        }
    }

    console.log(zone.exchanges);*/

};

BSWG.genMap_EnemyPlacement_Zone = function(zone, eInfo, lastZone) {

    zone.enemies = new Array();
    var k = 1000;
    var U = {};
    while (zone.enemies.length < 16 && k-- > 0) {
        for (var i=0; i<eInfo.enemies.length; i++) {
            if (U[i]) {
                continue;
            }
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
            for (var j=0; found && lastZone && lastZone.enemies && j < lastZone.enemies.length; j++) {
                if (lastZone.enemies[j].type === E.type && Math.random() < 0.5) {
                    found = false;
                }
            }
            if (found) {
                var E2 = BSWG.getEnemy(E.type);
                if (E2 && E2.obj && E2.stats) {
                    if (Math.random() < 0.05) {
                        zone.enemies.push(E);
                        U[i] = true;
                    }
                }
            }
        }
    }

};