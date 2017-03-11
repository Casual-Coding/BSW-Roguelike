BSWG.enemyLevelInfo = {
    0: {
        buffi: -3
    },
    1: {
        buffi: -2.5
    },
    2: {
        buffi: -2
    },
    3: {
        buffi: -1.5
    },
    4: {
        buffi: -1
    },
    5: {
        buffi: -0.5
    },
    6: {
        buffi: 0.0
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

BSWG.xpiLastLevel = 0;

(function() {
    for (var i=0; i<100; i++) {
        if (BSWG.xpInfo[i]) {
            BSWG.xpInfo[i].xp = (BSWG.xpInfo[i-1] ? BSWG.xpInfo[i-1].xp : 0) + BSWG.xpInfo[i].xpi;
            BSWG.xpInfo[i].points = (BSWG.xpInfo[i-1] ? BSWG.xpInfo[i-1].points : 0) + BSWG.xpInfo[i].pointsi;
            BSWG.enemyLevelInfo[i].buff = BSWG.xpInfo[i].buff + (BSWG.enemyLevelInfo[i].buffi || 0);
            BSWG.xpiLastLevel = Math.max(BSWG.xpiLastLevel, i);
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
            2: 'massive',        // +30% mass for all blocks on ship 5s for more ramming damage
            4: 'spin-up',        // Double saw speed for 6s
            6: 'double-mele',    // +50% damage for all mele weapons for 6s
            8: 'massive2',       // +50% mass for all blocks on ship 5s for more ramming damage
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
            4: 'light-weight',  // -25% mass for 20s
            6: 'speed2',        // +50% speed for 30s
            8: 'feather-weight' // -25% mass for 40s
        }
    }
};

BSWG.invWidth = 10;
BSWG.invHeight = 15;

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
        inventory:  null,
        invMap:     null,
        invNextID:  1,
        pointBonus: 2,
        invWidth:   BSWG.invWidth,
        invHeight:  BSWG.invHeight
    };

    if (!load.store) {
        load.store = [];
    }
    if (!load.inventory) {
        var newPage = function() {
            var ret = [];
            for (var x=0; x<load.invWidth; x++) {
                var row = [];
                for (var y=0; y<load.invHeight; y++) {
                    row.push(null);
                }
                ret.push(row);
            }
            return ret;
        };
        load.inventory = [ newPage(), newPage(), newPage(), newPage() ];
    }
    if (!load.invMap) {
        load.invMap = {};
    }

    for (var key in load) {
        this[key] = deepcopy(load[key]);
    }
    for (var key in this.invMap) {
        this.invMap[key].level = this.invMap[key].level || 0;
    }

    if (!this.pointBonus) {
        this.pointBonus = 0;
    }

    this.serialize = function () {
        var ret = {};
        for (var key in load) {
            ret[key] = this[key];
        }
        return deepcopy(ret);
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

    this.addStoreKey = function (key, inc, page, damage) {
        var tok = key.split(',');
        var type = tok[0];
        var comp = {};
        for (var i=1; i<tok.length; i++) {
            var tok2 = tok[i].split('=');
            comp[tok2[0]] = eval(tok2[1]); // JSON.parse doesn't like strings?
        }
        comp.type = type;
        comp.getInvSize = function () {
            return BSWG.componentList.inventorySize[key];
        };
        comp.getKey = function () {
            return key;
        };
        comp.hp = comp.maxHP = 100;
        return this.addStore(comp, inc, page, damage||0);
    };

    this.inventoryBoxEmpty = function (page, x, y, w, h, r90) {
        if (r90) {
            var t = w;
            w = h;
            h = t;
        }
        var inv = this.inventory[page];
        for (var X=0; X<w; X++) {
            for (var Y=0; Y<h; Y++) {
                var x1 = x + X, y1 = y + Y;
                if (x1 < 0 || y1 < 0 || x1 >= this.invWidth || y1 >= this.invHeight) {
                    return false;
                }
                if (inv[x1][y1]) {
                    return false;
                }
            }
        }
        return true;
    };

    this.canAddInventoryAt = function (comp, page, x, y, rot90) {
        rot90 = rot90 || false;
        page = page || 0;
        x = x || 0;
        y = y || 0;
        if (!comp) {
            return false;
        }
        if (comp && comp.hp <= 0) {
            return false;
        }
        var dim = comp.getInvSize();
        var w = rot90 ? dim.h : dim.w;
        var h = rot90 ? dim.w : dim.h;
        return this.inventoryBoxEmpty(page, x, y, w, h);
    };

    this.addInventoryItAt = function (it, page, x, y, rot90) {
        var comp = {
            getKey: function() {
                return it.key;
            },
            getInvSize: function() {
                return {
                    w: it.w,
                    h: it.h
                };
            },
            level: function() {
                return it.level || 0;
            }
        };
        return this.addInventoryAt (comp, page||0, x||0, y||0, rot90||false, it.damage||0);
    };

    this.addInventoryAt = function (comp, page, x, y, rot90, damage) {
        rot90 = rot90 || false;
        page = page || 0;
        x = x || 0;
        y = y || 0;
        if (!(damage || damage === 0)) {
            if (comp && (comp.hp || comp.hp === 0) && comp.maxHP) {
                damage = 1 - comp.hp / comp.maxHP;
            }
            else {
                damage = 0;
            }
        }

        var dim = comp.getInvSize();
        var inv = this.inventory[page];
        var w = rot90 ? dim.h : dim.w;
        var h = rot90 ? dim.w : dim.h;

        if (!this.canAddInventoryAt(comp, page, x, y, rot90)) {
            return false;
        }

        var wrap = {
            id: this.invNextID++,
            x: x,
            y: y,
            w: dim.w,
            h: dim.h,
            page: page,
            r90: rot90 || false,
            key: comp.getKey(),
            damage: damage,
            level: comp.level() || 0
        };

        this.invMap[wrap.id] = wrap;
        
        for (var X=0; X<w; X++) {
            for (var Y=0; Y<h; Y++) {
                var x1 = x + X, y1 = y + Y;
                inv[x1][y1] = wrap.id;
            }
        }

        return true;
    };

    this.inventoryRemove = function (id) {
        if (!id || !this.invMap[id]) {
            return false;
        }
        var it = this.invMap[id];
        var page = it.page;
        var inv = this.inventory[page];
        var x = it.x;
        var y = it.y;
        var w = it.w;
        var h = it.h;
        if (it.r90) {
            var t = w;
            w = h;
            h = t;
        }
        if (page >= 0 && page < this.inventory.length) {
            for (var X=0; X<w; X++) {
                for (var Y=0; Y<h; Y++) {
                    var x1 = x + X, y1 = y + Y;
                    if (x1 >= 0 && y1 >= 0 && x1 < this.invWidth && y1 < this.invHeight) {
                        inv[x1][y1] = null;
                    }
                }
            }
        }
        this.invMap[id] = null;
        delete this.invMap[id];
        return it;
    };

    this.inventoryRemoveAt = function (x, y, page) {
        page = page || 0;
        x = x || 0;
        y = y || 0;
        if (page < 0 || x < 0 || y < 0 || page >= this.inventory.length || x >= this.invWidth || y >= this.invHeight) {
            return false;
        }
        if (!this.inventory[page][x][y]) {
            return false;
        }
        return this.inventoryRemove(this.inventory[page][x][y]);
    };

    this.inventoryPage = function (page) {
        page = page || 0;
        var ret = [];
        for (var key in this.invMap) {
            var it = this.invMap[key];
            if (it.page === page) {
                ret.push(it);
            }
        }
        return ret;
    };

    this.inventoryCount = function (key) {
        var count = 0;
        for (var k in this.invMap) {
            if (this.invMap[k].key === key) {
                count += 1;
            }
        }
        return count;
    };

    this.inventoryRemoveKey = function (key, count) {
        if (!(count > 0)) {
            count = 1;
        }
        while (count > 0) {
            var found = false;
            for (var k in this.invMap) {
                if (this.invMap[k].key === key) {
                    if (this.inventoryRemove(this.invMap[k].id)) {
                        count --;
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                return count;
            }
        }
        return 0;
    }

    this.inventoryAt = function (x, y, page) {
        page = page || 0;
        x = x || 0;
        y = y || 0;
        if (page < 0 || x < 0 || y < 0 || page >= this.inventory.length || x >= this.invWidth || y >= this.invHeight) {
            return null;
        }
        var id = this.inventory[page][x][y];
        if (!id) {
            return null;
        }
        return this.invMap[id] || null;
    };

    this.debugPage = function (page) {
        page = page || 0;

        var idMap = {};
        var nextId = 48;
        for (var x=0; x<this.invWidth; x++) {
            for (var y=0; y<this.invHeight; y++) {
                var it = this.inventory[page][x][y];
                if (it) {
                    if (!idMap[it]) {
                        idMap[it] = nextId++;
                    }
                }
            }
        }
        
        for (var y=0; y<this.invHeight; y++) {
            var str = '';
            for (var x=0; x<this.invWidth; x++) {
                var it = this.inventory[page][x][y];
                if (it) {
                    str += String.fromCharCode(idMap[it]);
                }
                else {
                    str += '#';
                }
            }
            console.log(str);
        }
    };

    this.addStore = function (comp, inc, page, damage) {

        inc = inc || 1;
        page = page || 0;

        for (var i=0; i<inc; i++) {
            var valid = false;
            for (var y=0; y<this.invHeight && !valid; y++) {
                for (var x=0; x<this.invWidth && !valid; x++) {
                    valid = this.addInventoryAt(comp, page, x, y, false, damage);
                    if (!valid) {
                        valid = this.addInventoryAt(comp, page, x, y, true, damage);
                    }
                }
            }
            if (!valid) {
                return (page+1) < this.inventory.length ? this.addStore(comp, inc-i, page+1, damage) : false;

            }
        }

        return true;

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

    this.buff = function(compLevel) {
        var level = Math.clamp((compLevel || compLevel === 0) ? compLevel : this.level, 0, BSWG.xpiLastLevel);
        var l0 = Math.floor(level), l1 = Math.floor(level) + 1;
        var xp0 = BSWG.xpInfo[l0];
        var xp1 = BSWG.xpInfo[l1];
        if (!xp0) {
            return 0;
        }
        else if (!xp1) {
            return xp0.buff;
        }
        else {
            var t = level - l0;
            return xp0.buff * (1-t) + xp1.buff * t;
        }
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