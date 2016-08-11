BSWG.enemyLevelInfo = {
    0: {
        buffi: -2
    },
    1: {
        buffi: -1.25
    },
    2: {
        buffi: -0.5
    },
    3: {
        buffi: 0
    },
    4: {
        buffi: 0
    },
    5: {
        buffi: 0
    },
    6: {
        buffi: 0
    },
    7: {
        buffi: 0
    },
    8: {
        buffi: 0.5
    },
    9: {
        buffi: 0.5
    },
    10: {
        buffi: 0.5
    },
    11: {
        buffi: 0.5
    },
    12: {
        buffi: 0.5
    },
    13: {
        buffi: 0.5
    }
};

BSWG.levelXpPer = [
    0.75, // 0
    0.70, // 1
    0.65, // 2
    0.60, // 3
    0.55, // 4
    0.45, // 5
    0.40, // 6
    0.35, // 7
    0.30, // 8
    0.25, // 9
    0.20, // 10
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
        xpi: 375,
        pointsi: 1,
        buff: 2
    },
    3: {
        xpi: 800,
        pointsi: 1,
        buff: 3
    },
    4: {
        xpi: 1900,
        pointsi: 2,
        buff: 5
    },
    5: {
        xpi: 3950,
        pointsi: 1,
        buff: 6
    },
    6: {
        xpi: 8000,
        pointsi: 1,
        buff: 7
    },
    7: {
        xpi: 16000,
        pointsi: 1,
        buff: 9
    },
    8: {
        xpi: 32000,
        pointsi: 2,
        buff: 10
    },
    9: {
        xpi: 64000,
        pointsi: 1,
        buff: 11
    },
    10: {
        xpi: 128000,
        pointsi: 2,
        buff: 12
    },
    11: {
        xpi: 230000,
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

BSWG.xpUnlockInfo = {
    'attack': {
        'title': 'Weapons',
        'levels': [

            [ // Level 0
                {
                    'type': 'unlock',
                    'comp': [ { type: 'blaster' } ],
                    'text': 'Unlock blasters'
                },
                {
                    'type': 'unlock',
                    'comp': [ { type: 'hingehalf', size: 1, motor: true }, { type: 'hingehalf', size: 1, motor: false } ],
                    'text': 'Unlock powered hinges size 1'
                }
            ],

            [ // Level 1
                {
                    'type': 'buff',
                    'comp': [ { type: 'blaster' } ],
                    'value': { type: 'damage', value: 1.2 },
                    'text': '+20% damage from blasters'
                }
            ],

            [ // Level 2
                {
                    'type': 'unlock',
                    'comp': [ { type: 'missile-launcher' } ],
                    'text': 'Unlock missile launchers'
                }
            ],

            [ // Level 3
                {
                    'type': 'buff',
                    'comp': [ { type: 'blaster' } ],
                    'value': { type: 'rate', value: 1.2 },
                    'text': '+20% firing rate from blasters'
                }
            ],

            [ // Level 4
                {
                    'type': 'buff',
                    'comp': [ { type: 'missile-laucher' } ],
                    'value': { type: 'damage', value: 1.15 },
                    'text': '+15% damage from missiles'
                },
                {
                    'type': 'unlock',
                    'comp': [ { type: 'hingehalf', size: 2, motor: true }, { type: 'hingehalf', size: 2, motor: false } ],
                    'text': 'Unlock powered hinges size 2'
                }
            ],

            [ // Level 5
                {
                    'type': 'unlock',
                    'comp': [ { type: 'laser' } ],
                    'text': 'Unlock lasers'
                }
            ],

            [ // Level 6
                {
                    'type': 'buff',
                    'comp': [ { type: 'missile-laucher' } ],
                    'value': { type: 'damage', value: 1.15 },
                    'text': '+15% damage from missiles'
                }
            ],

            [ // Level 7
                {
                    'type': 'buff',
                    'comp': [ { type: 'missile-laucher' } ],
                    'value': { type: 'damage', value: 1.2 },
                    'text': '+20% fire rate from missile launchers'
                }
            ],

            [ // Level 8
                {
                    'type': 'buff',
                    'comp': [ { type: 'laser' } ],
                    'value': { type: 'damage', value: 1.1 },
                    'text': '+10% damage from lasers'
                }
            ],

            [ // Level 9
                {
                    'type': 'buff',
                    'comp': [ { type: 'blaster' } ],
                    'value': { type: 'damage', value: 1.35 },
                    'text': '+35% damage from blasters'
                }
            ],

            [ // Level 10
                {
                    'type': 'buff',
                    'comp': [ { type: 'laser' } ],
                    'value': { type: 'damage', value: 1.20 },
                    'text': '+20% damage from lasers'
                }
            ],

        ]
    },
    'mele': {
        'title': 'Mele Weapons',
        'levels': [
         
            [ // Level 0
                {
                    'type': 'unlock',
                    'comp': [ { type: 'spikes', size: 1, pike: false }, { type: 'spikes', size: 1, pike: true } ],
                    'text': 'Unlock spikes & pikes size 1'
                },
                {
                    'type': 'unlock',
                    'comp': [ { type: 'chainlink' } ],
                    'text': 'Unlock chains'
                },
            ],
        ]
    },
    'defend': {
        'title': 'Defense'
    },
    'speed': {
        'title': 'Mobility',
        'levels': [
            
            [ // Level 0
                {
                    'type': 'unlock',
                    'comp': [ { type: 'thruster', size: 1 } ],
                    'text': 'Unlock small thrusters'
                }
            ],

            [ // Level 1
                {
                    'type': 'buff',
                    'comp': [ { type: 'thruster', size: 1 } ],
                    'value': { type: 'speed', value: 1.1 },
                    'text': '+10% speed to small thrusters'
                }
            ],

            [ // Level 2
                {
                    'type': 'buff',
                    'comp': [ { type: 'thruster', size: 1 } ],
                    'value': { type: 'speed', value: 1.1 },
                    'text': '+10% speed to small thrusters'
                }
            ],

            [ // Level 3
                {
                    'type': 'buff',
                    'comp': [ { type: 'cc', size: 1 } ],
                    'value': { type: 'speed', value: 1.25 },
                    'text': '+25% command centre speed'
                }
            ],

            [ // Level 4
                {
                    'type': 'unlock',
                    'comp': [ { type: 'thruster', size: 2 } ],
                    'text': 'Unlock large thrusters'
                }
            ],

            [ // Level 5
                {
                    'type': 'buff',
                    'comp': [ { type: 'thruster', size: 2 } ],
                    'value': { type: 'speed', value: 1.1 },
                    'text': '+10% speed to large thrusters'
                }
            ],

            [ // Level 6
                {
                    'type': 'buff',
                    'comp': [ { type: 'thruster', size: 2 } ],
                    'value': { type: 'speed', value: 1.1 },
                    'text': '+10% speed to large thrusters'
                }
            ],

            [ // Level 7
                {
                    'type': 'buff',
                    'comp': [ { type: 'cc', size: 1 } ],
                    'value': { type: 'speed', value: 1.25 },
                    'text': '+25% command centre speed'
                }
            ],

            [ // Level 8
                {
                    'type': 'buff',
                    'comp': [ { type: 'thruster', size: 1 } ],
                    'value': { type: 'speed', value: 1.1 },
                    'text': '+10% speed to small thrusters'
                }
            ],

            [ // Level 9
                {
                    'type': 'buff',
                    'comp': [ { type: 'thruster', size: 1 } ],
                    'value': { type: 'speed', value: 1.1 },
                    'text': '+10% speed to small thrusters'
                }
            ],

            [ // Level 10
                {
                    'type': 'buff',
                    'comp': [ { type: 'thruster', size: 2 } ],
                    'value': { type: 'speed', value: 1.2 },
                    'text': '+20% speed to large thrusters'
                }
            ]

        ]
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
        store:      null
    };

    if (!load.store) {
        load.store = [];
    }

    for (var key in load) {
        this[key] = load[key];
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
        return xpi.points;
    };

    this.pointsLeft = function () {
        return Math.max(0, this.points() - this.pointsUsed());
    };

    this.buff = function() {
        var xpi = BSWG.xpInfo[this.level];
        return xpi.buff;
    };

    this.usePoint = function (on) {
        if (on == 'attack' || on == 'mele' || on == 'defend' || on == 'speed') {
            if (this.pointsUsed() < this.points()) {
                this[on] += 1;
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