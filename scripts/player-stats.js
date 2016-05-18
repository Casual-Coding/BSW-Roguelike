BSWG.xpInfo = {
    0: {
        xpi: 0,
        pointsi: 0
    },
    1: {
        xpi: 150,
        pointsi: 1
    },
    2: {
        xpi: 375,
        pointsi: 1
    },
    3: {
        xpi: 800,
        pointsi: 1
    },
    4: {
        xpi: 1900,
        pointsi: 2
    },
    5: {
        xpi: 3950,
        pointsi: 1
    },
    6: {
        xpi: 8000,
        pointsi: 1
    },
    7: {
        xpi: 16000,
        pointsi: 1
    },
    8: {
        xpi: 32000,
        pointsi: 2
    },
    9: {
        xpi: 64000,
        pointsi: 1
    },
    10: {
        xpi: 128000,
        pointsi: 2
    }
};

(function() {
    for (var i=0; i<100; i++) {
        if (BSWG.xpInfo[i]) {
            BSWG.xpInfo[i].xp = (BSWG.xpInfo[i-1] ? BSWG.xpInfo[i-1].xp : 0) + BSWG.xpInfo[i].xpi;
            BSWG.xpInfo[i].points = (BSWG.xpInfo[i-1] ? BSWG.xpInfo[i-1].points : 0) + BSWG.xpInfo[i].pointsi;
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
        levelUp:    false
    };

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

    this.pointsUsed = function () {
        return this.attack + this.mele + this.defend + this.speed;
    };

    this.points = function () {
        var xpi = BSWG.xpInfo[this.level];
        return xpi.points;
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