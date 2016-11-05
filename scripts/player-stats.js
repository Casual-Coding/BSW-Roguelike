BSWG.enemyLevelInfo = {
    0: {
        buffi: -2
    },
    1: {
        buffi: -2
    },
    2: {
        buffi: -1.25
    },
    3: {
        buffi: -0.25
    },
    4: {
        buffi: 0.5
    },
    5: {
        buffi: 0.75
    },
    6: {
        buffi: 1.0
    },
    7: {
        buffi: 1.0
    },
    8: {
        buffi: 1.25
    },
    9: {
        buffi: 1.5
    },
    10: {
        buffi: 2.0
    },
    11: {
        buffi: 2.0
    },
    12: {
        buffi: 2.0
    },
    13: {
        buffi: 2.25
    }
};

BSWG.levelXpPer = [
    0.75, // 0
    0.30, // 1
    0.20, // 2
    0.20, // 3
    0.20, // 4
    0.15, // 5
    0.15, // 6
    0.15, // 7
    0.15, // 8
    0.10, // 9
    0.10, // 10
    // ... (0.20)
];

BSWG.xpInfo = {
    0: {
        xpi: 0,
        pointsi: 0,
        buff: 0
    },
    1: {
        xpi: 150,
        pointsi: 1,
        buff: 1
    },
    2: {
        xpi: 600,
        pointsi: 1,
        buff: 2
    },
    3: {
        xpi: 1200,
        pointsi: 1,
        buff: 3
    },
    4: {
        xpi: 2000,
        pointsi: 2,
        buff: 5
    },
    5: {
        xpi: 4500,
        pointsi: 1,
        buff: 6
    },
    6: {
        xpi: 9000,
        pointsi: 1,
        buff: 7
    },
    7: {
        xpi: 18000,
        pointsi: 1,
        buff: 9
    },
    8: {
        xpi: 36000,
        pointsi: 2,
        buff: 10
    },
    9: {
        xpi: 72000,
        pointsi: 1,
        buff: 11
    },
    10: {
        xpi: 158000,
        pointsi: 2,
        buff: 12
    },
    11: {
        xpi: 300000,
        pointsi: 1,
        buff: 13
    },
    12: {
        xpi: 400000,
        pointsi: 1,
        buff: 15
    },
    13: {
        xpi: 750000,
        pointsi: 2,
        buff: 17
    }
};

(function() {
    for (var i=0; i<100; i++) {
        if (BSWG.xpInfo[i]) {
            BSWG.xpInfo[i].xp = (BSWG.xpInfo[i-1] ? BSWG.xpInfo[i-1].xp : 0) + BSWG.xpInfo[i].xpi;
            BSWG.xpInfo[i].points = (BSWG.xpInfo[i-1] ? BSWG.xpInfo[i-1].points : 0) + BSWG.xpInfo[i].pointsi;
            BSWG.enemyLevelInfo[i].buff = BSWG.xpInfo[i].buff + (BSWG.enemyLevelInfo[i].buffi || 0);
        }
    }
})();

BSWG.specialsUnlockInfo = {
    'attack': {
        'title': 'Guns',
        'levels': {
            1: 'fury',           // +35% firerate on projectile weapons for 20s
            3: 'torpedo',        // Fire torpedo from CC to user selected point, does splash damage, doesn't collide with anything
            5: 'emp-attack',     // Same as torpedo, except EMP
            7: 'over-power',     // +50% damage on non-mele weapons for 25s
            9: 'torpedo-spread', // Fires three tropedoes instead of one, larger range
        }
    },
    'mele': {
        'title': 'Mele',
        'levels': {
            2: 'massive',        // +30% mass for all blocks on ship 3s for more ramming damage
            4: 'spin-up',        // Double saw speed for 6s
            6: 'double-mele',    // +50% damage for all mele weapons for 6s
            8: 'massive2',       // +50% mass for all blocks on ship 3s for more ramming damage
        }
    },
    'defend': {
        'title': 'Defense',
        'levels': {
            1: 'heal',            // Heal in selected radius
            3: 'defense-screen',  // Deploys shield for 25s, take half damage
            5: 'emp-defend',      // EMP blast from CC (larger than emp-attack) that does not effect self
            7: 'shockwave',       // Powerful shockwave eminating from CC that pushes any enemy ships back
            9: 'singularity'      // Create singularity at user selected point (lasting 10s) pulling all enemy ships towards it
        }
    },
    'speed': {
        'title': 'Mobility',
        'levels': {
            2: 'speed',         // +50% speed for 15s
            4: 'light-weight',  // -50% mass for 20s
            6: 'speed2',        // +50% speed for 30s
            8: 'feather-weight' // -50% mass, +12% speed for 40s
        }
    }
};

BSWG.playerStats = function(load) {

    load = load || {
        level:      0,
        xp:         0,
        attack:     0,
        mele:       0,
        defend:     0,
        speed:      0,
        levelUp:    false,
        money:      100,
        store:      null,
        pointBonus: 1
    };

    if (!load.store) {
        load.store = [];
    }

    for (var key in load) {
        this[key] = load[key];
    }

    if (!this.pointBonus) {
        this.pointBonus = 0;
    }

    this.serialize = function () {
        var ret = {};
        for (var key in load) {
            ret[key] = this[key];
        }
        return ret;
    };

    var sbt = BSWG.componentList.sbTypes;
    for (var i=0; i<sbt.length; i++) {
        for (var j=0; j<sbt[i].sbadd.length; j++) {
            sbt[i].sbadd[j].count = 0;
        }
    }

    var EQ = function(a,b) {
        return (a === b) || (typeof a === 'undefined') || (typeof b === 'undefined');
    };

    this.addStoreKey = function (key, inc) {
        var tok = key.split(',');
        var type = tok[0];
        var comp = {};
        for (var i=1; i<tok.length; i++) {
            var tok2 = tok[i].split('=');
            comp[tok2[0]] = eval(tok2[1]); // JSON.parse doesn't like strings?
        }
        comp.type = type;
        this.addStore(comp, inc);
    };

    this.addStore = function (comp, inc) {
        inc = inc || 1;
        var sbt = BSWG.componentList.sbTypes;
        for (var i=0; i<sbt.length; i++) {
            if (sbt[i].type !== comp.type) {
                continue;
            }
            for (var j=0; j<sbt[i].sbadd.length; j++) {
                var obj = sbt[i].sbadd[j];
                var nobj = {};
                var eq = true;
                for (var k=0; sbt[i].sbkey && k<sbt[i].sbkey.length; k++) {
                    var key = sbt[i].sbkey[k];
                    if (!EQ(obj[key], comp[key])) {
                        eq = false;
                    }
                    nobj[key] = comp[key];
                }
                if (eq) {
                    nobj.type = comp.type;
                    obj.count = (obj.count || 0) + inc;
                    if (obj.count < 0) {
                        obj.count = 0;
                    }
                    while (inc < 0) {
                        for (var k=0; k<this.store.length; k++) {
                            if (this.store[k].type === comp.type) {
                                var eq2 = true;
                                for (var k2=0; sbt[i].sbkey && k2<sbt[i].sbkey.length; k2++) {
                                    var key = sbt[i].sbkey[k2];
                                    if (!EQ(obj[key], this.store[k][key])) {
                                        eq2 = false;
                                    }
                                }
                                if (eq2) {
                                    this.store.splice(k, 1);
                                    break;
                                }
                            }
                        }
                        inc += 1;
                    }
                    while (inc > 0) {
                        this.store.push(nobj);
                        inc -= 1;
                    }
                    return true;
                }
            }
        }
        return false;
    };

    var ostore = this.store;
    this.store = [];
    for (var _i=0; _i<ostore.length; _i++) {
        this.addStore(ostore[_i], 1);
    }

    this.pointsUsed = function () {
        return this.attack + this.mele + this.defend + this.speed;
    };

    this.points = function () {
        var xpi = BSWG.xpInfo[this.level];
        return xpi.points + this.pointBonus || 0;
    };

    this.pointsLeft = function () {
        return Math.max(0, this.points() - this.pointsUsed());
    };

    this.buff = function() {
        var xpi = BSWG.xpInfo[this.level];
        return xpi.buff;
    };

    this.usePoint = function (on, ccblock) {
        if (on === 'attack' || on === 'mele' || on === 'defend' || on === 'speed') {
            if (this.pointsUsed() < this.points()) {
                this[on] += 1;
                if (BSWG.specialsUnlockInfo[on].levels[this[on]]) {
                    ccblock.giveSpecial(BSWG.specialsUnlockInfo[on].levels[this[on]]);
                }
                return true;
            }
            return false;
        }
        else {
            return false;
        }
    };

    this.giveMoney = function (money) {
        this.money += Math.min(Math.ceil(money), 1);
    };

    this.spendMoney = function (money) {
        var amt = Math.min(Math.ceil(money), 1);
        if (amt > this.money) {
            return false;
        }
        else {
            this.money -= amt;
            return true;
        }
    };

    this.giveXP = function (xp) {
        this.xp += ~~(xp);
        while (this.levelProgress().t >= 1.0) {
            this.level += 1;
            this.levelUp = true;
        }
    };

    this.levelProgress = function () {
        var xpi0 = BSWG.xpInfo[this.level];
        var xpi = BSWG.xpInfo[this.level+1];
        if (!xpi) {
            return {
                t: 0.0,
                next: 0,
                current: Math.max(0, (this.xp - xpi0.xp) || 0),
                total: this.xp
            };
        }
        else {
            var ret = {
                next: xpi.xp - xpi0.xp,
                current: Math.max(0, this.xp - xpi0.xp),
                total: this.xp
            };
            ret.t = ret.current / ret.next;
            return ret;
        }
    };

};