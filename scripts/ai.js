BSWG.enemyStats = {};
BSWG.getEnemyStats = function(type) {
    return BSWG.getEnemy(type, true);
};
BSWG.getEnemy = function(type, statsOnly) {

    if (statsOnly) {
        if (BSWG.enemyStats[type]) {
            return BSWG.enemyStats[type];
        }
    }

    var estr = BSWG['ais_' + type];
    var eobj = estr ? JSON.parse(estr) : null;
    var stats = BSWG.enemyStats[type] || null;

    if (BSWG.componentList && !stats && eobj) {
        stats = BSWG.componentList.loadScan(eobj);
        BSWG.enemyStats[type] = stats;
    }

    if (statsOnly) {
        return stats;
    }

    var title = 'Unkown Enemy';

    switch (type) {
        case 'goliath':         title = 'Goliath'; break;
        case 'big-flail':       title = 'Big Flail'; break;
        case 'big-spinner':     title = 'Big Spinner'; break;
        case 'brute':           title = 'Brute'; break; 
        case 'crippler':        title = 'Crippler'; break;
        case 'cruncher-boss':   title = 'Crimson Cruncher'; break;
        case 'fighter':         title = 'Fighter'; break;
        case 'brutenie':        title = 'Brutenie'; break;
        case 'marauder':        title = 'Marauder'; break;
        case 'striker':         title = 'Striker'; break;
        case 'four-blaster-x2': title = '4x Blaster'; break;
        case 'four-blaster':    title = 'Pleb'; break;
        case 'heavy-fighter':   title = 'Heavy Fighter'; break;
        case 'laser-fighter':   title = 'Laser Fighter'; break;
        case 'little-brute':    title = 'Little Brute'; break;
        case 'little-charger-2':title = 'Little Charger X'; break;
        case 'little-charger':  title = 'Little Charger Y'; break;
        case 'little-cruncher': title = 'Little Cruncher'; break;
        case 'mele-boss':       title = 'Mele Monster'; break;
        case 'missile-boss':    title = 'Thorne'; break;
        case 'missile-spinner': title = 'Missile Spinner'; break;
        case 'msl-fighter':     title = 'Missile Fighter'; break;
        case 'scorpion':        title = 'Scorpion'; break;
        case 'spinner':         title = 'Spinner'; break;
        case 'uni-dir-fighter': title = 'Uni-Fighter'; break;
        case 'uni-fight-msl':   title = 'Uni-Fighter II'; break;
        case 'uni-laser':       title = 'Scanner'; break;
        case 'little-tough-guy':title = 'Lil\' Tough Guy'; break;
        case 'tough-guy':       title = 'Tough Guy'; break;
        case 'stinger':         title = 'Stinger'; break;
        case 'freighter':       title = 'Freighter'; break;
        case 'tracker':         title = 'Tracker'; break;
        case 'fighter-mg':      title = 'Fighter MG'; break;
        case 'four-minigun':    title = '4x Minigun'; break;
        case 'freighter-2':     title = 'Freighter II'; break;
        case 'little-brute-2':  title = 'Little Brute II'; break;
        case 'marauder-2':      title = 'Heavy Marauder'; break;
        case 'mini-gunner':     title = 'Gunner'; break;
        case 'mini-gunner-m2':  title = 'Gunner MII'; break;
        case 'mini-gunner-m3':  title = 'Gunner MIII'; break;
        case 'fighter-mg-2':    title = 'Fighter MG II'; break;
        default: break;
    }

    eobj.title = title;
    eobj.enemy_type_id = type;

    return {
        obj: eobj,
        stats: stats,
        title: title,
        type: type,
        compStats: function (ostats) {
            var ustats = {};
            for (var stat in stats) {
                var found = false;
                var count = stats[stat];
                for (var statj in stats) {
                    if (stat.localeCompare(statj) < 0 && BSWG.compImplied(stat, statj)) {
                        found = true;
                    }
                    if (BSWG.compImplied(statj, stat)) {
                        count += stats[statj];
                    }
                }
                if (!found) {
                    ustats[stat] = count;
                }
            }
            var f = 0, nf = 0;
            for (var stat in ustats) {
                var found = false;
                for (var i=0; i<ostats.length && !found; i++) {
                    if (BSWG.compImplied(stat, ostats[i])) {
                        f += ustats[stat];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    nf += ustats[stat];
                }
            }
            return f / (f+nf);
        }
    };
};

//////

BSWG.aiController = function (type, args) {

    for (var key in args) {
        this[key] = args[key];
    }

    this.type = type;
    this.lastDT = 1.0/60.0;
    this.tracker = false;

    switch (type) {

        case 'turret':
            this.oradius = this.radius || this.comp.obj.radius;
            this.forwardOffset = this.forwardOffset || 0.0;
            this.reverse = this.reverse || false;
            this.limit = this.limit || Math.PI/2.05;
            break;

        case 'tracker':
            this.tracker = true;
        case 'movement':
            this.hinge = this.hinge || false;
            this.oradius = this.radius || this.comp.obj.radius;
            this.revRadius = this.revRadius || (this.oradius * 2.0);
            this.forwardOffset = this.forwardOffset || 0.0;
            this.charge = this.charge || false;
            this.exclusive = this.exclusive || false;
            this.predComp = this.predComp || this.comp;

            this.reached = false;
            this.spinner = this.spinner || false;

            this.aDists = [];
            this.pDists = [];
            break;

        case 'radius':
            this.list = [];
            this.first = null;
            this.found = false;
            break;

        default:
            break;
    }

}

BSWG.aiController.prototype.track = function (p, keyDown, left, right, keyFire) { // Stateless

    if (!this.comp || !this.comp.obj || !this.comp.obj.body || !p) {
        return;
    }

    this.lastDT = BSWG.render.dt;

    left = left || BSWG.KEY.LEFT;
    right = right || BSWG.KEY.RIGHT;

    var mp = this.comp.obj.body.GetWorldCenter();
    var distance = Math.distVec2(mp, p);
    var radius = this.oradius;

    var angDiff = Math.angleBetween(mp, p) - (this.comp.obj.body.GetAngleWrapped() + this.comp.frontOffset + this.forwardOffset);
    angDiff = Math.atan2(Math.sin(angDiff), Math.cos(angDiff));

    if (angDiff > 0.0) {
        keyDown[left] = true;
    }
    else if (angDiff < 0.0) {
        keyDown[right] = true;
    }
    if (keyFire) {
        keyDown[keyFire] = true;
    }

};

BSWG.aiController.prototype.computeVel = function(dists) {
    if (dists.length < 2) {
        return 0.0;
    }
    else {
        var vels = 0, count = 0;
        for (var i=1; i<dists.length; i++) {
            vels += (dists[i] - dists[i-1]) / this.lastDT;
            count += 1.0;
        }
        return vels / count;
    }
};

BSWG.aiController.prototype.timeStop = function (tmag, ptype) {

    var mag = Math.abs(this.computeVel(ptype === 'vel' ? this.pDists : this.aDists));

    var damping = this.comp.obj.body.GetAngularDamping();
    if (!ptype || ptype === 'vel') {
        damping = this.comp.obj.body.GetLinearDamping();
    }

    damping = (1/(1 + damping));

    if (mag < 0.000001 || tmag < 0.000001) {
        return 1000000.0;
    }

    var ret = Math.log(tmag/mag) / Math.log(damping);
    if (isNaN(ret) || !(ret>0)) {
        return 1500000.0;
    }
    return ret;

};

BSWG.aiController.prototype.timeTarget = function (dist, ptype) {

    var mag = Math.abs(this.computeVel(ptype === 'vel' ? this.pDists : this.aDists));

    var damping = this.comp.obj.body.GetAngularDamping();
    if (!ptype || ptype === 'vel') {
        damping = this.comp.obj.body.GetLinearDamping();
    }

    damping = (1/(1 + damping));

    if (Math.abs(mag) < 0.001) {
        return 1500000.0;
    }

    var ld = Math.log(damping);
    var ret = Math.log(dist*ld/mag + 1.0) / ld;
    if (isNaN(ret) || !(ret>0)) {
        return 1500000.0;
    }
    return ret;
};

BSWG.aiController.prototype.predict = function (t, ptype) {

    var mag = this.computeVel(ptype === 'vel' ? this.pDists : this.aDists);

    var damping = this.comp.obj.body.GetAngularDamping();
    if (!ptype || ptype === 'vel') {
        damping = this.comp.obj.body.GetLinearDamping();
    }

    damping = (1/(1 + damping));

    return mag * (Math.pow(damping, t) - 1.0) / Math.log(damping);

};

BSWG.aiController.prototype.moveTo = function (p, keyDown, left, right, forward, reverse) {

    this.lastDT = BSWG.render.dt;

    if (!this.comp || !this.comp.obj || !this.comp.obj.body || !p) {
        return;
    }

    left = left || BSWG.KEY.LEFT;
    right = right || BSWG.KEY.RIGHT;
    if (!this.tracker) {
        forward = forward || BSWG.KEY.UP;
    }

    var doReverse = false;
    var mp = this.comp.obj.body.GetWorldCenter();
    var distance = Math.distVec2(mp, p);

    if (this.charge) {
        p = p.clone();
        p.x += (p.x - mp.x) / distance * this.oradius * 2;
        p.y += (p.y - mp.y) / distance * this.oradius * 2;
        distance = Math.distVec2(mp, p);
    }

    var radius = this.oradius;

    this.distance = distance;

    var vel = this.predComp.obj.body.GetLinearVelocity().clone();
    var vlen = Math.lenVec2(vel);

    if (vlen > 1.0) {
        vel.x /= vlen;
        vel.y /= vlen;

        var t = Math.min(4, this.timeTarget(distance, 'vel'));
        if (this.charge) {
            t = Math.max(t, 1);
        }
        var len2 = this.predict(t, 'vel');

        vel.x = p.x + vel.x * len2;
        vel.y = p.y + vel.y * len2;
    }
    else {
        vel.x = p.x;
        vel.y = p.y;
    }

    var angDiff = Math.angleBetween(mp, vel) - (this.comp.obj.body.GetAngleWrapped() + this.comp.frontOffset + this.forwardOffset);
    angDiff = Math.atan2(Math.sin(angDiff), Math.cos(angDiff));
    if (Math.abs(angDiff) > Math.PI*0.5 && reverse && distance < this.revRadius && !this.tracker) {
        doReverse = true;
        angDiff = Math.atan2(Math.sin(angDiff+Math.PI), Math.cos(angDiff+Math.PI));
    }

    this.angleDistance = angDiff;

    this.aDists.push(angDiff);
    this.pDists.push(distance);
    while (this.aDists.length > 10) {
        this.aDists.splice(0, 1);
    }
    while (this.pDists.length > 10) {
        this.pDists.splice(0, 1);
    }

    this.reached = this.tracker ? (Math.abs(angDiff) < Math.PI/90) : (distance <= radius);

    if (distance > radius || this.tracker) {
        if (this.spinner) {
            if (this.computeVel(this.aDists) > 0) {
                keyDown[right] = true;
            }
            else {
                keyDown[left] = true;
            }
        }
        else if (Math.abs(angDiff) > Math.PI/45) {
            var ad2 = angDiff + this.predict(1.0, 'ang');
            if (ad2 > 0.0) {
                keyDown[left] = true;
            }
            else if (ad2 < 0.0) {
                keyDown[right] = true;
            }
        }
        if (!this.tracker && (!(this.exclusive && (keyDown[left] || keyDown[right])) || this.spinner)) {
            var tt = this.timeTarget(distance, 'vel');
            if (Math.abs(angDiff) < Math.PI/4 && (tt > this.timeStop(0.2, 'vel') || (tt>10.0 && Math.abs(angDiff) < Math.PI/12) || this.charge)) {
                keyDown[doReverse ? reverse : forward] = true;
            }
        }
    }

    this.angDist = angDiff;

};


//////

BSWG.NNAI = {
    SENSOR_RANGE: 100, // in world units
    LEARN_RATE: 0.1,
    LEARN_ITERATIONS: 5000
};

BSWG.neuralAI = function(shipBlocks, networkJSON, aiDesc) {

    this.shipBlocks = shipBlocks || [];
    this.ccblock = null;
    this.allKeys = {};
    
    this.aiDesc = deepcopy(aiDesc || {});
    this.states = this.aiDesc.states || [];
    this.groups = {};
    this.groups[0] = [];

    for (var i=0; i<this.shipBlocks.length; i++) {
        var C = this.shipBlocks[i];
        if (C && C.type === 'cc') {
            this.ccblock = C;
        }
        if (C && C.allKeys) {
            for (var j=0; j<C.allKeys.length; j++) {
                this.allKeys[C[C.allKeys[j]]] = true;
            }
        }
    }
    this.keyList = [];
    for (var key in this.allKeys) {
        this.keyList.push(parseInt(key));
    }
    this.keyList.sort();

    this.maxStateProb = {};
    for (var i=0; i<this.states.length; i++) {
        var S = this.states[i];
        S.controller = null;
        S.group = S.group || 0;
        S.index = i;
        this.maxStateProb[S.group] = Math.max(this.maxStateProb[S.group] || 0, S.probability);
        if (!this.groups[S.group]) {
            this.groups[S.group] = [];
        }
        this.groups[S.group].push(S);
        if (S.type === 'movement') {
            S.controller = new BSWG.aiController(
                'movement',
                {
                    comp: this.ccblock,
                    radius: S.radius || 5,
                    charge: true,
                    hinge: true
                }
            );
            S.maxDistance = S.maxDistance || 30.0;
            S.minDistance = S.minDistance || 0.0;
            // S.left
            // S.right
            // S.forward
            // S.reverse
        }
        else if (S.type === 'tracker') {
            S.controller = new BSWG.aiController(
                'turret',
                {
                    comp: this.ccblock,
                    limit: Math.PI * 2
                }
            );
            S.maxDistance = S.maxDistance || 5.0;
            S.minDistance = S.minDistance || 0.0;
            // S.left
            // S.right
            // S.fire
        }
        else if (S.type === 'back-up') {
            // S.reverse
        }
        else if (S.type === 'key-press') {
            // S.keys || S.key
            // S.keysBlock
        }
    }

    this.numGroups = 0;
    for (var group in this.groups) {
        this.numGroups += 1;
    }

    this.outputLength = this.states.length + 2 * this.numGroups;
    this.inputLength = 12;

    this.network = null;
    this.enemyCC = null;
    this.keys = {};
    this.frameN = 0;

    this.pain = 0;
    this.pleasure = 0;
    this.totalPain = 0;

    this.recentPain = 0;
    this.recentPleasure = 0;

    this.lastInput = null;
    this.lastOutput = null;

    this.doneThisCount = 0;

    this.inputNames = [ "MASS", "SPD", "PROJ", "MELE", "DIRE", "DIRM", "RVA", "RVM", "RNG", "GOOD", "DMG", "REP" ];
    this.groupOutput = {};

    if (!this.load(networkJSON)) {
        this.reinit();
    }

    if (this.network) {
        this.network.optimize();
    }

};

BSWG.neuralAI.prototype.reinit = function() {

    this.network = new synaptic.Architect.Perceptron(this.inputLength, 10, 10, 10, this.outputLength);

};

BSWG.neuralAI.prototype.randOutput = function() {

    var ret = new Array(this.outputLength);
    for (var i=0; i<this.outputLength; i++) {
        ret[i] = Math._random();
    }
    return ret;

};

BSWG.neuralAI.prototype.load = function(obj) {

    if (!obj) {
        return false;
    }

    if (typeof obj === 'string') {
        obj = JSON.parse(obj);
    }

    if (obj) {
        if (this.inputLength !== obj.inputLength) {
            obj.networkJSON = null;
            console.warn("NN: inputLength !== inputLength");
        }
        if (this.outputLength !== obj.outputLength) {
            obj.networkJSON = null;
            console.warn("NN: outputLength !== outputLength");
        }
        if (obj.networkJSON) {
            this.lastInput = null;
            this.lastOutput = null;
            this.network = synaptic.Network.fromJSON(obj.networkJSON);
            return true;
        }
        else {
            console.warn("NN: network not loaded");
            return false;
        }
    }
    else {
        return false;
    }

};

BSWG.neuralAI.prototype.serialize = function() {

    var obj = {
        inputLength: this.inputLength,
        outputLength: this.outputLength,
        networkJSON: this.network.toJSON()
    };
    return obj;

};

BSWG.neuralAI.prototype.setEnemy = function(ccblock) {

    this.enemyCC = ccblock;

};

BSWG.neuralAI.prototype.varPower = function (val, variance, power) {

    if (val instanceof Array) {
        var ret = new Array(val.length);
        for (var i=0; i<ret.length; i++) {
            ret[i] = this.varPower(val[i], variance, power);
        }
        return ret;
    }
    
    return Math.clamp(Math.pow(val, power) + Math._random() * variance - 0.5 * variance, 0., 1.);

};

BSWG.ArrayFlatEqual = function(a, b) {
    if (!b || !a) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }
    for (var i=0; i<a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
};

BSWG.neuralAI.prototype.update = function(dt, pain, pleasure) {

    if (!this.network) {
        return;
    }

    if (!this.ccblock || this.ccblock.destroyed || !this.ccblock.obj || !this.ccblock.obj.body || !this.enemyCC || this.enemyCC.destroyed || !this.enemyCC.obj || !this.enemyCC.obj.body) {
        return;
    }

    this.totalPain += pain;
    this.pain += pain;
    this.pleasure += pleasure;

    var input = [];

    // Enemy ship masses
    var CC_MASS = this.enemyCC.obj.body.GetMass();
    var mass = this.enemyCC.totalMass / CC_MASS;
    if (!(mass > 2)) {
        input.push(0.0);
    }
    else if (mass < 6) {
        input.push(0.5);
    }
    else {
        input.push(1.0);
    }

    // Enemy speed ratings
    var tratio = this.enemyCC.speedRating / mass;
    if (!(tratio > 1/16)) {
        input.push(0.0);
    }
    else if (tratio < 1/6) {
        input.push(0.5);
    }
    else {
        input.push(1.0);
    }

    // Enemy projectile weapon ratings
    var pwratio = (this.enemyCC.pwepRating + 1) / (this.ccblock.pwepRating + 1);
    if (!(pwratio > 0.25)) {
        input.push(0.0);
    }
    else if (pwratio < 1.0) {
        input.push(0.5);
    }
    else {
        input.push(1.0);
    }

    // Enemy mele weapon ratings
    var mwratio = (this.enemyCC.mwepRating + 1) / (this.ccblock.mwepRating + 1);
    if (!(mwratio > 0.25)) {
        input.push(0.0);
    }
    else if (mwratio < 1.0) {
        input.push(0.5);
    }
    else {
        input.push(1.0);
    }

    // Directions
    var angDiff = Math.angleBetween(this.ccblock.p(), this.enemyCC.p()) + Math.PI / 4 + this.ccblock.obj.body.GetAngleWrapped();
    angDiff = Math.atan2(Math.sin(angDiff), Math.cos(angDiff)) / (Math.PI * 2.0) + 0.5;
    input.push(Math.floor(angDiff*4)/4);

    var angDiff = Math.angleBetween(this.ccblock.p(), this.enemyCC.p()) + Math.PI / 4 + this.enemyCC.obj.body.GetAngleWrapped();
    angDiff = Math.atan2(Math.sin(angDiff), Math.cos(angDiff)) / (Math.PI * 2.0) + 0.5;
    input.push(Math.floor(angDiff*4)/4);

    // Relative velocities
    var v1 = this.ccblock.obj.body.GetLinearVelocity().clone();
    var v2 = this.enemyCC.obj.body.GetLinearVelocity().clone();
    var angDiff = Math.angleBetween(v1, v2) + Math.PI / 4;
    angDiff = Math.atan2(Math.sin(angDiff), Math.cos(angDiff)) / (Math.PI * 2.0) + 0.5;
    input.push(Math.floor(angDiff*4)/4);

    var mag = Math.lenVec2(new b2Vec2(v1.x-v2.x, v1.y-v2.y));
    if (!(mag > 1)) {
        input.push(0.0);
    }
    else {
        input.push(1.0);
    }

    // Ranges
    var mag = Math.distVec2(this.ccblock.p(), this.enemyCC.p());
    if (!(mag > 4)) {
        input.push(0.0);
    }
    else if (mag < 16) {
        input.push(0.5);
    }
    else {
        input.push(1.0);
    }

    // Recent good/bad results
    var rating = Math.clamp(((this.pain * 0.25 + this.pleasure) * 20 + 1) / 4, 0, 1);
    rating = Math.floor(rating / 4) * 4;
    input.push(rating);

    // Self damage %
    var totalMax = 0;
    var total = 0;
    for (var i=0; i<this.shipBlocks.length; i++) {
        totalMax += this.shipBlocks[i].maxHP;
        if (this.shipBlocks[i].onCC === this.ccblock) {
            total += this.shipBlocks[i].hp;
        }
    }
    input.push(1 - (Math.floor(Math.clamp(total / totalMax, 0, 1) * 5) / 5));

    // Done this
    input.push(Math.clamp(Math.floor((this.doneThisCount / (30 * 4)) / 4), 0, 1) * 4);

    // Sanitize input
    for (var i=0; i<input.length; i++) {
        if (isNaN(input[i])) {
            input[i] = 0;
        }
        else {
            input[i] = Math.clamp(input[i], 0, 1);
        }
    }

    // Activate
    var output = this.network.activate(input);

    // Learning
    if (this.lastInput && !BSWG.ArrayFlatEqual(input, this.lastInput) && this.lastOutput) {
        var score = Math.clamp(pain * 4 + pleasure * 16, -1, 1);
        var K = BSWG.NNAI.LEARN_ITERATIONS * (Math.abs(score)+0.5);
        console.log("Train: " + Math.floor(K) + "(" + score + ")");
        for (var k=0; k<K; k++) {
            this.network.activate(deepcopy(this.lastInput));
            this.network.propagate(BSWG.NNAI.LEARN_RATE, score > 0 ? deepcopy(this.lastOutput) : this.randOutput());
        }
        this.pain = 0;
        this.pleasure = 0;
        this.doneThisCount = 0;
    }
    else {
        this.doneThisCount += 1;
    }

    this.lastInput = deepcopy(input);
    this.lastOutput = deepcopy(output);

    // Action

    for (var key in this.keys) {
        this.keys[key] = false;
    }

    this._tpos = {};

    var G = 0;
    for (var _G in this.groups) {

        var group = parseInt(_G);
        var states = this.groups[_G];

        if (!states.length) {
            continue;
        }

        var K = 0;
        var ep = this.enemyCC.p();
        var state = states[0].index;
        for (var i=0; i<states.length; i++) {
            var j = states[i].index;
            if (output[K+j]*(states[i].probability / this.maxStateProb[group]) > output[K+state]*(this.states[state].probability / this.maxStateProb[group])) {
                state = j;
            }
        }

        var S = this.states[state];
        this.groupOutput[group] = "G" + group + ": " + state + " (" + S.type + ")";

        if (S) {
            var K2 = this.states.length + G * 2;
            if ((S.type === 'movement') && ep) {
                var a = output[K2+0] * Math.PI * 2.0;
                var r = output[K2+1] * (S.maxDistance - S.minDistance) + S.minDistance;
                S.controller.moveTo(
                    this._tpos[group] = new b2Vec2(
                        ep.x + Math.cos(a) * r,
                        ep.y + Math.sin(a) * r
                    ),
                    this.keys,
                    BSWG.KEY[S.left] || null,
                    BSWG.KEY[S.right] || null,
                    BSWG.KEY[S.forward] || null,
                    BSWG.KEY[S.reverse] || null
                );
            }
            else if ((S.type === 'tracker') && ep) {
                var a = output[K2+0] * Math.PI * 2.0;
                var r = output[K2+1] * (S.maxDistance - S.minDistance) + S.minDistance;
                S.controller.track(
                    this._tpos[group] = new b2Vec2(
                        ep.x + Math.cos(a) * r,
                        ep.y + Math.sin(a) * r
                    ),
                    this.keys,
                    BSWG.KEY[S.left] || null,
                    BSWG.KEY[S.right] || null,
                    BSWG.KEY[S.fire] || null
                );
            }
            else if ((S.type === 'back-up') && ep) {
                var key = BSWG.KEY[S.reverse] || null;
                if (key) {
                    this.keys[key] = true;
                }
            }
            else if ((S.type === 'key-press') && ep) {
                var key = BSWG.KEY[S.key] || null;
                if (key) {
                    this.keys[key] = true;
                }
                for (var i=0; S.keys && i<S.keys.length; i++) {
                    var key = BSWG.KEY[S.keys[i]] || null;
                    if (key) {
                        this.keys[key] = true;
                    }
                }
                for (var i=0; S.keysBlock && i<S.keysBlock.length; i++) {
                    var key = BSWG.KEY[S.keysBlock[i]] || null;
                    if (key) {
                        this.keysBlock[key] = true;
                    }
                }
            }
        }

        G += 1;
    }

    input = output = null;

};

BSWG.neuralAI.prototype.debugRender = function(ctx, dt) {

    var p1 = null, p2 = null;
    if (this.ccblock && this.ccblock.p()) {
        p2 = BSWG.game.cam.toScreen(BSWG.render.viewport, this.ccblock.p().clone());
    }

    for (var G in this._tpos) {
        var p1 = null;
        if (this._tpos[G]) {
            p1 = BSWG.game.cam.toScreen(BSWG.render.viewport, this._tpos[G].clone());
        }
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#f00';
            ctx.closePath();
            ctx.stroke();
        }
    }

    if (p2 && this.lastInput) {
        var str = [];
        var input = this.lastInput;
        for (var i=0; i<input.length; i++) {
            str.push(this.inputNames[i] + ": " + Math.floor(input[i]*100));
        }
        str = str.join(", ");
        ctx.font = '10px Orbitron';
        ctx.fillStyle = '#f0f';
        ctx.fillText(str, p2.x, p2.y);
        var y = p2.y;
        for (var G in this.groupOutput) {
            y += 11;
            ctx.font = '10px Orbitron';
            ctx.fillStyle = '#f0f';
            ctx.fillText(this.groupOutput[G], p2.x, y);
        }
    }

};

BSWG.neuralAI.prototype.getKeys = function(keys) {

    if (this.keys) {
        for (var key in this.keys) {
            keys[key] = this.keys[key];
        }
    }

};

BSWG.neuralAI.prototype.destroy = function() {

    this.shipBlocks = null;
    this.network = null;
    this.keys = {};
    for (var i=0; i<this.states.length; i++) {
        this.states[i].controller = null;
        this.states[i] = null;
    }
    this.states = null;
    this.aiDesc = null;

};


///

BSWG.NNTourny = function(shipIDs, args) {

    if (BSWG.NNActiveTourny) {
        BSWG.NNActiveTourny.stop();
    }

    this.shipIDs = deepcopy(shipIDs);

    this.args = args || {};

    if (this.args.resetFirst) {
        this.resetAI();
    }

    this.autoSave = this.args.autoSave !== undefined ? !!this.args.autoSave : true;
    this.iterations = this.args.iterations || 10; // Total matches: (# of ships ^ 2) * # of iterations
    this.matchLength = this.args.matchLength || (5 * 60); // Default 5 minutes max match length
    this.escapeDistance = this.args.escapeDistance || (BSWG.NNAI.SENSOR_RANGE * 1.5); // Maximum distance ships can pull apart before match is ended
    this.minLevel = this.args.minLevel || 0;
    this.maxLevel = this.args.maxLevel || 4;

    // Generate testing sequence

    this.sequence = [];
    for (var k=0; k<this.iterations; k++) {
        for (var i=0; i<this.shipIDs.length; i++) {
            for (var j=0; j<this.shipIDs.length; j++) {
                this.sequence.push([i, j]);
            }
        }
    }

    //

    this.inBattle = false;
    this.ready = false;

    BSWG.NNActiveTourny = this;
    BSWG.render.aiTrainMode = true;
    BSWG.game.changeScene(BSWG.SCENE_GAME2, {}, '#000', 0.25);

    this.lastTime = Date.timeStamp();
    this.time = 0.0;
    this.dt = 1/60;
};

BSWG.NNTourny.prototype.update = function() {

    var newTime = Date.timeStamp();
    this.dt = Math.clamp(newTime - this.lastTime, 0, 1);
    this.lastTime = newTime;

    if (!this.ready) {
        return;
    }

    if (!this.inBattle) {
        this.curSeq = this.sequence[0];
        if (!this.curSeq) {
            this.stop();
            return;
        }
        this.ccblocks = new Array(this.curSeq.length);
        this.ccsLoaded = 0;
        this.matchTime = 0.0;
        this.startBattle(this.curSeq);
        this.sequence.splice(0, 1);
    }

    if (this.inBattle && this.ccsLoaded === this.ccblocks.length) {

        this.matchTime += this.dt;

        var ended = false;

        if (this.ccblocks[0].destroyed || this.ccblocks[1].destroyed) {
            console.log("Ended: 1 or both destroyed");
            ended = true;
        }
        else if (this.ccblocks[0].p() && this.ccblocks[1].p() && Math.distVec2(this.ccblocks[0].p(), this.ccblocks[1].p()) > this.escapeDistance) {
            console.log("Ended: Escape");
            ended = true;
        }
        else if (this.matchTime >= this.matchLength) {
            console.log("Ended: Time limit");
            ended = true;
        }

        if (ended) {
            var winner = -1;
            if (this.ccblocks[0].destroyed) {
                winner = 1;
                if (this.ccblocks[0].aiNN) {
                    this.ccblocks[0].aiNN.update(1/30, 1, 0);
                }
                else if (this.ccblocks[1].aiNN) {
                    this.ccblocks[1].aiNN.update(1/30, 0, 1);
                }
            }
            else if (this.ccblocks[1].destroyed) {
                winner = 0;
                if (this.ccblocks[1].aiNN) {
                    this.ccblocks[1].aiNN.update(1/30, 1, 0);
                }
                else if (this.ccblocks[1].aiNN) {
                    this.ccblocks[1].aiNN.update(1/30, 0, 1);
                }
            }
            else {
                if (this.ccblocks[0].aiNN) {
                    this.ccblocks[0].aiNN.update(1/30, 0.5, 0);
                }
                if (this.ccblocks[1].aiNN) {
                    this.ccblocks[1].aiNN.update(1/30, 0.5, 0);
                }
                if (this.ccblocks[0].aiNN && !this.ccblocks[1].aiNN) {
                    winner = 0;
                }
                else if (!this.ccblocks[0].aiNN && this.ccblocks[1].aiNN) {
                    winner = 1;
                }
                else if (this.ccblocks[0].aiNN && this.ccblocks[1].aiNN) {
                    winner = this.ccblocks[0].aiNN.totalPain < this.ccblocks[1].aiNN.totalPain ? 0 : 1;
                }
            }

            if (this.curSeq[0] === this.curSeq[1]) {
                if (winner > -1) {
                    if (this.ccblocks[winner].aiNN) {
                        this.saveAI(this.shipIDs[this.curSeq[winner]], this.ccblocks[winner].aiNN.serialize());
                    }
                }
            }
            else {
                if (this.ccblocks[0].aiNN) {
                    this.saveAI(this.shipIDs[this.curSeq[0]], this.ccblocks[0].aiNN.serialize());
                }
                if (this.ccblocks[1].aiNN) {
                    this.saveAI(this.shipIDs[this.curSeq[1]], this.ccblocks[1].aiNN.serialize());
                }
            }

            this.inBattle = false;
        }
        else if (this.ccblocks[0].aiNN && this.ccblocks[1].aiNN) {
            this.ccblocks[0].aiNN.setEnemy(this.ccblocks[1]);
            this.ccblocks[1].aiNN.setEnemy(this.ccblocks[0]);
        }

    }

};

BSWG.NNTourny.prototype.shipLoaded = function(ccblock) {

    if (!this.curSeq) {
        return;
    }

    if (this.ccsLoaded >= this.ccblocks.length) {
        console.log("NNTourny: Too many ships loaded");
        return;
    }

    for (var i=0; i<this.ccblocks.length; i++) {
        if (!this.ccblocks[i] && ccblock.enemy_type_id === this.shipIDs[this.curSeq[i]]) {
            this.ccsLoaded += 1;
            this.ccblocks[i] = ccblock;
            break;
        }
    }

};

BSWG.NNTourny.prototype.getAI = function(ship) {

    var defaultObj = null;

    var obj = BSWG.storage.load('nnai-' + ship) || defaultObj;

    return obj;

};

BSWG.NNTourny.prototype.saveAI = function(ship, json) {

    BSWG.storage.save('nnai-' + ship, json);

};

BSWG.NNTourny.prototype.startBattle = function(shipIndexes) {

    var spawns = [];
    for (var i=0; i<shipIndexes.length; i++) {
        var e = BSWG.getEnemy(this.shipIDs[shipIndexes[i]]);
        if (e && e.obj) {
            spawns.push([e.obj, Math._random()*(this.maxLevel - this.minLevel) + this.minLevel])    
        }
        else {
            return;
        }
    }
    
    BSWG.componentList.clear();
    BSWG.game.spawnEnemies(spawns);
    BSWG.game.battleMode = true;
    this.inBattle = true;

};

BSWG.NNTourny.prototype.resetAI = function() {

    // ??? delete files instead?

};

BSWG.NNTourny.prototype.stop = function () {

    BSWG.NNActiveTourny = null;
    BSWG.render.aiTrainMode = false;
    BSWG.game.changeScene(BSWG.SCENE_GAME2, {}, '#000', 0.25);

};

BSWG.NNActiveTourny = null;

///


BSWG.ai = new function() {

    var EDITOR_WIDTH = 550;

    this.aiTestLevel = 0;
    this.playerTestLevel = 0;

    this.getFile = false;
    this.testOtherShip = null;

    this.init = function () {

        this.closeEditor();
        this.testMenuOpen = false;
        if (this.getFile) {
            BSWG.input.REMOVE_GFILE(this.getFile);
            this.getFile = null;
        }

    };

    this.saveCode = function () {

        if (this.editor && this.editorCC) {
            this.editorCC.aiStr = this.editor.getValue();
        }

    };

    this.addEditor = function ( ) {

        if (this.editor) {
            this.removeEditor();
        }

        this.editorDiv = document.createElement('div');
        this.editorDiv.style.position = 'fixed';
        this.editorDiv.style.zIndex = '50';
        this.editorDiv.style.width = (EDITOR_WIDTH-8) + 'px';
        this.editorDiv.style.height = '400px';
        this.editorDiv.style.top = '66px';
        this.editorDiv.style.border = '4px solid rgba(100,100,100,1.0)';
        document.body.appendChild(this.editorDiv);

        this.editor = ace.edit(this.editorDiv);
        this.editor.setFontSize(14);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.getSession().setMode("ace/mode/javascript");
        this.editor.focus();

        this.editor.setValue(this.editorCC.aiStr || BSWG.ai_Template, -1);

    };

    this.removeEditor = function ( ) {

        if (!this.editor) {
            return;
        }

        this.lastCursor = this.editor.getCursorPosition();

        document.body.removeChild(this.editorDiv);
        this.editorDiv = null;
        this.editor.destroy();
        this.editor = null;

    };

    this.showDebug = false;

    this.openEditor = function (ccblock) {

        var self = this;

        this.closeEditor();

        this.editorCC = ccblock;
        this.showDebug = false;

        this.addEditor();

        this.consoleDiv = document.createElement('code');
        this.consoleDiv.style.position = 'fixed';
        this.consoleDiv.style.zIndex = '50';
        this.consoleDiv.style.width = (EDITOR_WIDTH-8) + 'px';
        this.consoleDiv.style.height = '144px';
        this.consoleDiv.style.top = '66px';
        this.consoleDiv.style.border = '4px solid rgba(100,100,100,1.0)';
        this.consoleDiv.style.overflowX = 'hidden';
        this.consoleDiv.style.overflowY = 'scroll';
        this.consoleDiv.style.color = 'rgb(248, 248, 242)';
        this.consoleDiv.style.backgroundColor = 'rgb(39, 40, 34)';
        this.consoleDiv.readOnly = true;
        document.body.appendChild(this.consoleDiv);

        if (this.lastCursor) {
            this.editor.navigateTo(this.lastCursor.row, this.lastCursor.column);
        }

        this.runBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 80, h: 50,
            text: "Run",
            selected: false,
            click: function (me) {
                self.logError('Run -------------');
                self.saveCode();
                self.editorCC.reloadAI();
            }
        });

        this.updateBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 125, h: 50,
            text: "Update",
            selected: false,
            click: function (me) {
                self.logError('Update ----------');
                self.saveCode();
                self.editorCC.reloadAI(true);
            }
        });

        this.stopBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 100, h: 50,
            text: "Stop",
            selected: false,
            click: function (me) {
                self.editorCC.removeAI();
                self.logError('Stop ------------');
            }
        });

        this.testMenuOpen = false;

        this.testBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 100, h: 50,
            text: "Test",
            selected: this.testMenuOpen,
            click: function (me) {
                self.testMenuOpen = !self.testMenuOpen;
                me.selected = self.testMenuOpen;
                if (self.testMenuOpen) {
                    self.testSelBtn.add();
                    if (self.testOtherShip && self.testOtherShipName) {
                        self.testRunBtn.add();
                    }
                }
                else {
                    self.testSelBtn.remove();
                    self.testRunBtn.remove();
                }
            }
        });

        this.testSelBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 115, h: 50,
            text: "Import",
            selected: false,
            click: function (me) {
            }
        });

        this.runMode = false;

        this.testRunBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 115, h: 50,
            text: "Run Test",
            selected: false,
            click: function (me) {
                me.selected = !me.selected;
                self.runMode = me.selected;
                if (me.selected) {
                    self.logError('Test Start ------');
                    self.saveCode();
                    me.text = "Stop Test";
                    self.removeEditor();
                    BSWG.game.shipTest(self.testOtherShip);
                    self.showDebugBtn.add();
                }
                else {
                    self.logError('Test End --------');
                    me.text = "Run Test";
                    self.addEditor();
                    BSWG.game.shipTest();
                    self.editorCC = BSWG.game.ccblock;
                    self.showDebugBtn.remove();
                }
            }
        });
        this.testSelBtn.remove();
        this.testRunBtn.remove();

        this.showDebugBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 150, h: 50,
            text: "Show Debug",
            selected: this.showDebug,
            click: function (me) {
                self.showDebug = !self.showDebug;
                me.selected = self.showDebug;
            }
        });
        this.showDebugBtn.remove();

        this.getFile = BSWG.input.GET_FILE(function(data, x, y){
            if (!data) {
                if (!self.testSelBtn || !self.testMenuOpen) {
                    return false;
                }
                return x >= self.testSelBtn.p.x && y >= self.testSelBtn.p.y &&
                       x <= (self.testSelBtn.p.x + self.testSelBtn.w) && y <= (self.testSelBtn.p.y + self.testSelBtn.h);
            }

            try {
                self.testOtherShip = JSON.parse(data.data);
                self.testOtherShipName = data.filename;
            } catch (err) {
                self.testOtherShip = null;
                self.testOtherShipName = null;
            }
            
        }, "text");

    };

    this.closeEditor = function () {

        if (this.getFile) {
            BSWG.input.REMOVE_GFILE(this.getFile);
            this.getFile = null;
        }

        if (this.consoleDiv) {

            this.saveCode();

            this.removeEditor();

            document.body.removeChild(this.consoleDiv);
            this.consoleDiv = null;
            this.runBtn.destroy();
            this.runBtn.remove();
            this.runBtn = null;
            this.updateBtn.destroy();
            this.updateBtn.remove();
            this.updateBtn = null;
            this.stopBtn.destroy();
            this.stopBtn.remove();
            this.stopBtn = null;
            this.testBtn.destroy();
            this.testBtn.remove();
            this.testBtn = null;
            this.testSelBtn.destroy();
            this.testSelBtn.remove();
            this.testSelBtn = null;
            this.testRunBtn.destroy();
            this.testRunBtn.remove();
            this.testRunBtn = null;

            this.editorCC = null;
        }

    };

    this.logError = function(text) {
        text = text + '';
        var lines = text.match(/[^\r\n]+/g);
        if (!lines) {
            return;
        }
        for (var i=0; i<lines.length; i++) {
            if (lines[i].length > 70) {
                lines[i] = lines[i].substring(0, 35) + ' ... ' + lines[i].substring(lines[i].length-35);
            }
        }
        text = lines.join('\n') + '\n';
        console.log(text);
        if (this.consoleDiv) {
            this.consoleDiv.innerText += text + '\n';
            this.consoleDiv.scrollTop = this.consoleDiv.scrollHeight - this.consoleDiv.clientHeight;
        }
    };

    this.nextSave = 10;

    this.update = function ( ctx, dt ) {

        if (!this.consoleDiv) {
            return;
        }

        if (this.nextSave <= 0 && this.editor) {
            this.saveCode();
            this.nextSave = ~~((1/BSWG.render.dt) * 0.5);
        }
        this.nextSave -= 1;

        var mx = BSWG.input.MOUSE('x'), my = BSWG.input.MOUSE('y');

        if (this.editorDiv) {
            this.editorDiv.style.left = (10) + 'px';
            this.editorDiv.style.height = (window.innerHeight - 70 - 20 - 50 - 4 - (this.testMenuOpen ? 60 : 0) - 150 - 128) + 'px';
        }
        this.consoleDiv.style.left = (10) + 'px';
        if (this.editorDiv) {
            this.consoleDiv.style.top = (parseInt(this.editorDiv.style.top) + parseInt(this.editorDiv.style.height) + 12) + 'px';
        }

        if ((this.editorDiv &&
                mx >= parseInt(this.editorDiv.style.left) && my >= parseInt(this.editorDiv.style.top) &&
                mx < parseInt(this.editorDiv.style.left) + parseInt(this.editorDiv.style.width) &&
                my < parseInt(this.editorDiv.style.top) + parseInt(this.editorDiv.style.height)) ||
            (this.consoleDiv &&
                mx >= parseInt(this.consoleDiv.style.left) && my >= parseInt(this.consoleDiv.style.top) &&
                mx < parseInt(this.consoleDiv.style.left) + parseInt(this.consoleDiv.style.width) &&
                my < parseInt(this.consoleDiv.style.top) + parseInt(this.consoleDiv.style.height))) {
            BSWG.render.setCustomCursor(false);
            BSWG.input.EAT_MOUSE('wheel');
        }
        else {
            BSWG.render.setCustomCursor(true);
        }

        this.updateBtn.p.x = 10;
        this.updateBtn.p.y = BSWG.render.viewport.h - this.runBtn.h - 10 - 128;
        this.runBtn.p.x = this.updateBtn.p.x + this.updateBtn.w + 10;
        this.runBtn.p.y = this.updateBtn.p.y;
        this.stopBtn.p.x = this.runBtn.p.x + this.runBtn.w + 10;
        this.stopBtn.p.y = this.runBtn.p.y;
        this.testBtn.p.x = this.stopBtn.p.x + this.stopBtn.w + 10;
        this.testBtn.p.y = this.stopBtn.p.y;

        if (this.testMenuOpen) {
            this.testSelBtn.p.x = this.updateBtn.p.x;
            this.testSelBtn.p.y = this.updateBtn.p.y - 10 - this.testSelBtn.h + 3;
            this.testRunBtn.p.x = parseInt(this.consoleDiv.style.width) + parseInt(this.consoleDiv.style.left) - this.testRunBtn.w;
            this.testRunBtn.p.y = this.updateBtn.p.y - 10 - this.testSelBtn.h + 3;

            if (this.runMode) {
                this.consoleDiv.style.top = (window.innerHeight - (parseInt(this.consoleDiv.style.height) + 5 + 8)) + 'px';
                this.testSelBtn.p.y += 1000;
                this.testRunBtn.p.y = parseInt(this.consoleDiv.style.top) - (this.testRunBtn.h + 5);
                this.showDebugBtn.p.y = this.testRunBtn.p.y;
                this.showDebugBtn.p.x = this.testRunBtn.p.x - this.showDebugBtn.w - 10;
                this.runBtn.p.y += 1000;
                this.stopBtn.p.y += 1000;
                this.testBtn.p.y += 1000;
                this.updateBtn.p.y += 1000;
            }

            if (this.testOtherShip && this.testOtherShipName) {
                var x = this.runMode ? this.testSelBtn.p.x : this.testSelBtn.p.x + 10 + this.testSelBtn.w;
                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#00f';
                ctx.font = '10px Orbitron';
                ctx.textAlign = 'left';
                ctx.fillTextB(this.testOtherShipName, x, this.testSelBtn.p.y + this.testSelBtn.h * 0.5 + 10/2, true);
                this.testRunBtn.add();
            }
        }

        if (this.editorDiv) {
            if (this.editor.isFocused()) {
                this.editorDiv.style.border = '4px solid rgba(200,200,200,1.0)';
            }
            else {
                this.editorDiv.style.border = '4px solid rgba(100,100,100,1.0)';
            }
        }

    };

}();