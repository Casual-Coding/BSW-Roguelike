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
        xpi: 400,
        pointsi: 1
    },
    3: {
        xpi: 900,
        pointsi: 1
    },
    4: {
        xpi: 2000,
        pointsi: 2
    },
    5: {
        xpi: 4000,
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
    },
    'mele': {
    },
    'defend': {
    },
    'speed': {
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
                current: Math.max(0, this.xp - xpi0.xp),
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