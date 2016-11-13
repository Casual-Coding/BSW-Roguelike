// BlockShip Wars Component

BSWG.compActiveConfMenu = null;

BSWG.component_minJMatch        = Math.pow(0.15, 2.0);
BSWG.component_jMatchClickRange = Math.pow(0.15, 2.0);

BSWG.friendlyFactor = 1/16;
// attack/defense bias to level difference
BSWG.adBiasArr = [1, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
BSWG.adBias = function(p, e) { // (p)layer (e)nemy
    var diff = Math.clamp(e-p, -7, 7);
    var bias1 = BSWG.adBiasArr[Math.floor(Math.abs(diff))];
    var bias2 = BSWG.adBiasArr[Math.floor(Math.abs(diff)) + 1];
    var t = Math.abs(diff) - Math.floor(Math.abs(diff));
    var bias = bias1 * (1-t) + bias2 * t;
    if (diff < 0) {
        return 1/bias;
    }
    else {
        return bias;
    }
};
BSWG.defenseBias = 0.5;

BSWG.archiveRange = 200.0;
BSWG.arch_hashSize = 25.0;

BSWG.orphanDefense = 8.0;
BSWG.orphanTimeLive = 3 * 60;
BSWG.compExpireTime = BSWG.orphanTimeLive;

BSWG.generateTag = function () {
    var chars1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var chars2 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var k = 1000;
    while (k--) {
        var ret = chars1.charAt(Math.floor(Math.random() * chars1.length)) +
                  chars2.charAt(Math.floor(Math.random() * chars2.length));
                  //chars2.charAt(Math.floor(Math.random() * chars2.length)) +
                  //chars2.charAt(Math.floor(Math.random() * chars2.length));
        var found = false;
        for (var i=0; !found && i<BSWG.componentList.compList.length; i++) {
            if (BSWG.componentList.compList[i].tag === ret) {
                found = true;
            }
        }
        if (!found) {
            return ret;
        }
    }

    return null;
};

BSWG.componentHoverFn = function(self) {
    if (!BSWG.game.editMode && BSWG.game.storeMode && BSWG.game.scene === BSWG.SCENE_GAME1 && !self.onCC && BSWG.componentList.mouseOver === self) {
        return true;
    }
    if (BSWG.componentList.mouseOver !== self || (!BSWG.game.editMode && !BSWG.game.showControls) || (self.onCC && self.onCC !== BSWG.game.ccblock)) {
        return false;
    }
    if (self.onCC && !self.hasConfig && !self.canMoveAttached) {
        return false;
    }
    return true;
};

BSWG.componentHoverFnAlpha = function(self) {
    if (BSWG.game.attractorOn === self || BSWG.game.grabbedBlock === self) {
        return 0.6;
    }
    if (BSWG.game.attractorHover === self) {
        return 1.0;
    }
    if (!BSWG.game.editMode && BSWG.game.storeMode && BSWG.game.scene === BSWG.SCENE_GAME1 && !self.onCC) {
        return BSWG.componentList.mouseOver === self ? 0.4 : (Math.sin(BSWG.render.time*12+self.id*0.3) * 0.5 + 0.5);
    }
    if ((!BSWG.game.editMode || (self.onCC && self.onCC !== BSWG.game.ccblock)) && self.onCC) {
        return 0.0;
    }
    if (self.onCC && !self.hasConfig && !self.canMoveAttached) {
        return 0.0;
    }
    return BSWG.componentList.mouseOver === self ? 0.4 : (Math.sin(BSWG.render.time*7+self.id*0.3) * 0.5 + 0.5) * (self.onCC ? 0 : 1);
};

BSWG.compAnchored = function(self) {
    return ((self.onCC && self.onCC.anchored) || self.anchored || BSWG.game.dialogPause) ? true : false;
};

BSWG.updateOnCC = function () {

    var len = BSWG.componentList.compList.length;
    var ccs = [];
    for (var i=0; i<len; i++) {
        BSWG.componentList.compList[i].onCC = null;
        if (BSWG.componentList.compList[i].type == 'cc') {
            ccs.push(BSWG.componentList.compList[i])
        }
    }

    var mark = function(n, cc, u) {

        if (!n)
            return false;

        if (!u) u = {};
        if (u[n.id])
            return false;
        u[n.id] = true;

        n.onCC = cc;

        if (n.welds) {
            var keys = Object.keys(n.welds);
            for (var i=0; i<keys.length; i++) {
                var key = keys[i];
                if (n.welds[key]) {
                    mark(n.welds[key].other, cc, u);
                }
            }
        }

        return false;

    };

    for (var i=0; i<ccs.length; i++) {
        mark(ccs[i], ccs[i]);
    }

};

BSWG._updateOnCC = function (a, b) {

    var cc = a.onCC || (b && b.onCC ? b.onCC : null);
    if (!cc && a.type == 'cc') {
        cc = a;
    }
    else if (!cc && b.type == 'cc') {
        cc = a;
    }

    var scan = function(n, u) {

        if (!n)
            return false;

        if (!u) u = {};
        if (u[n.id])
            return false;
        u[n.id] = true;

        if (cc === n) {
            return true;
        }

        if (n.welds) {
            for (var key in n.welds) {
                if (n.welds[key]) {
                    if (scan(n.welds[key].other, u)) {
                        return true;
                    }
                }
            }
        }

        return false;

    };

    var mark = function(n, flag, u) {

        if (!n)
            return false;

        if (!u) u = {};
        if (u[n.id])
            return false;
        u[n.id] = true;

        var before = n.onCC;
        n.onCC = flag ? cc : null;
        if (before && !n.onCC) {
            n.orphanTime = Date.timeStamp();
        }

        if (n.welds) {
            for (var key in n.welds) {
                if (n.welds[key]) {
                    mark(n.welds[key].other, flag, u);
                }
            }
        }

        return false;

    };

    mark(a, scan(a));
    if (b) {
        mark(b, scan(b));
    }

};

BSWG.compImplied = function (a, b) {

    var parse = function(str) {
        var tok = str.split(',');
        var ret = new Object();
        ret.type = tok[0];
        for (var i=1; i<tok.length; i++) {
            var kvtok = tok[i].split('=');
            if (kvtok[1] === 'true') {
                ret[kvtok[0]] = true;
            }
            else if (kvtok[1] === 'false') {
                ret[kvtok[0]] = false;
            }
            else {
                ret[kvtok[0]] = parseInt(kvtok[1]);
            }
        }
        return ret;
    };

    if (typeof a === 'string') {
        a = parse(a);
    }
    if (typeof b === 'string') {
        b = parse(b);
    }

    if (a.type != b.type) {
        if (!((a.type === 'sawmotor' && b.type === 'sawblade') ||
              (b.type === 'sawmotor' && a.type === 'sawblade'))) {
            return false;
        }
    }

    switch (a.type) {
        case 'blaster':
            return a.size <= b.size;
            break;
        case 'railgun':
            return true;
            break;
        case 'block':
            return Math.max(a.width, a.height) <= Math.max(b.width, b.height);
            break;
        case 'chainlink':
            return true;
            break;
        case 'detacherlauncher':
            return a.size <= b.size;
            break;
        case 'hingehalf':
            return a.size <= b.size;
            break;
        case 'laser':
            return true;
            break;
        case 'missile-launcher':
            return true;
            break;
        case 'sawblade':
            return a.size <= b.size;
            break;
        case 'sawmotor':
            return a.size <= b.size;
            break;
        case 'spikes':
            return a.size <= b.size && a.pike === b.pike;
            break;
        case 'shield':
            return a.size <= b.size;
            break;
        case 'thruster':
            return a.size <= b.size;
            break;
        case 'razor':
            return a.size <= b.size;
            break;
        default:
            return false;
    }

    return false;

};

BSWG.comp_hashSize = 2.0;
BSWG.comp_staticHashSize = 32.0;

BSWG.nextCompID = 1;
BSWG.component = function (desc, args) {

    this.isMele = false;
    this.isSpinner = false;
    this.initTime = Date.timeStamp();
    this.handleInput = function(key) {};
    this.frontOffset = 0.0;
    this.empEffect = 0.0;
    this.empDamp = 1.0;

    for (var key in desc) {
        this[key] = desc[key];
    }
    this.iconPoly = null;

    this.id = BSWG.nextCompID++;
    this.jpoints = [];
    this.jmatch = [];
    this.jmatch = -1;
    this.welds = {};
    this.onCC = null;
    this.tag = BSWG.generateTag();
    this.__if = new Map();
    if (this.type === 'cc') {
        this.onCC = this;
    }

    this.massFactor = 1.0;

    BSWG.blockPolySmooth = null;
    this.init(args);

    if (!this.maxHP) {
        this.maxHP = 100;
    }

    this.hp = this.maxHP;
    this.healHP = 0;
    this.destroyed = false;

    if (this.obj) {
        this.obj.comp = this;
        if (this.obj.body) {
            this.obj.body.__comp = this;
        }
    }

    if (this.obj.body && args.vel) {
        this.obj.body.SetLinearVelocity(args.vel.clone());
    }

    if (this.obj.body && args.angVel) {
        this.obj.body.SetAngularVelocity(args.angVel);
    }

    if (this.jpoints && this.jpoints.length && this.obj) {

        for (var i=0; i<this.jpoints.length; i++) {
            this.jpoints[i].x *= 1.0005;
            this.jpoints[i].y *= 1.0005;
        }

        this.jpointsNormals = [];
        for (var i=0; i<this.jpoints.length; i++) {
            this.jpointsNormals[i] = BSWG.physics.getNormalAt(this.obj, this.jpoints[i]);
        }

    }

    BSWG.componentList.add(this);

    this.cacheJPW();
    this.updateJCache();
    this.baseUpdate(1/60);
    this.update(1/60);

};

BSWG.component.prototype.directlyConnectedTo = function(b) {
    if (this.welds) {
        for (var key in this.welds) {
            if (this.welds[key]) {
                if (this.welds[key].other === b) {
                    return true;
                }
            }
        }
    }
    return false;
};

BSWG.component.prototype.getKey = function () {
    
    var key = this.type;
    var desc = BSWG.componentList.typeMap[this.type];
    if (desc.sbkey) {
        for (var j=0; j<desc.sbkey.length; j++) {
            var k2 = desc.sbkey[j];
            if (this[k2] || this[k2] == false) {
                key += ',' + k2 + '=' + this[k2];
            }
        }
    }

    return key;

};

BSWG.component.prototype.takeDamage = function (amt, fromC, noMin, disolve) {

    if (BSWG.game.scene === BSWG.SCENE_TITLE || this.type === 'missile') {
        return amt;
    }

    if (!fromC || !fromC.onCC || fromC.destroyed || !fromC.obj || !fromC.obj.body) {
        fromC = null;
    }

    if (amt > 0) {
        var isFriendly = false;
        if (fromC && fromC.onCC && this.onCC) {
            if (fromC.onCC.id === this.onCC.id) {
                amt *= BSWG.friendlyFactor;
                isFriendly = true;
            }
            else if (BSWG.game.ccblock && this.onCC.id !== BSWG.game.ccblock.id && fromC.onCC.id !== BSWG.game.ccblock.id) {
                amt *= BSWG.friendlyFactor;
                isFriendly = true;
            }
        }

        if (BSWG.game.scene !== BSWG.SCENE_GAME2 || this.onCC) {
            if (fromC && !fromC.onCC && fromC.type != 'missile' && !BSWG.game.battleMode) {
                amt /= BSWG.orphanDefense;
            }
            if (!this.onCC && this.type != 'missile' && !BSWG.game.battleMode) {
                amt /= BSWG.orphanDefense;
            }
        }

        if (this.onCC && !isFriendly) {
            // Level bias
            var enemyCC = fromC ? fromC.onCC : null;
            var enemyBuff = enemyCC ? enemyCC.buff() : this.onCC.buff();
            var myBuff = this.onCC.buff();
            amt *= BSWG.adBias(myBuff, enemyBuff);

            // Weight bias
            amt /= 1.0 + Math.sqrt(this.onCC.totalMass || 0.0) / 5;

            // Human bias
            if (this.onCC === BSWG.game.ccblock) {
                amt /= BSWG.defenseBias;
            }

            // Overpowered bias
            if (fromC && fromC.onCC && fromC.onCC.overpowered > 0 && !fromC.isMele) {
                amt *= 1.5;
            }

            // Defense screen
            if (this.onCC.defenseScreen > 0) {
                amt *= 0.5;
            }

            // Massive
            if (this.onCC.massive > 0) {
                amt *= 0.6;
            }
            if (this.onCC.massive2 > 0) {
                amt *= 0.3;
            }

            // Double punch
            if (fromC && fromC.onCC && fromC.onCC.doublePunch > 0 && fromC.isMele) {
                amt *= 2.0;
            }
        }

        if (amt < 1 && !noMin) {
            return 0;
        }
    }

    if (disolve) {
        amt = this.hp * 1000 + 1000;
    }

    var damageExtra = 0;

    if (this.type === 'shield' && this.shieldOn && !disolve) {
        if (amt > 0) {
            this.__shHitSound = new BSWG.soundSample().play('shield-hit', this.p().THREE(0.2), Math.clamp(this.size/2*amt, 0, 5), 2.0 / this.size);
            this.shieldHit += amt * 10;
        }
        this.shieldEnergy -= amt * 0.5;
        if (this.shieldEnergy < 0) {
            damageExtra += -this.shieldEnergy / 0.5;
        }
        this.shieldEnergy = Math.clamp(this.shieldEnergy, 0, this.maxShieldEnergy);
        
        amt /= 8;
        if (amt < 1 && !noMin) {
            return damageExtra;
        }
    }

    this.hp -= amt;
    if (this.hp > this.maxHP) {
        this.hp = this.maxHP;
    }
    if (this.hp < 0) {
        damageExtra += -this.hp;
    }
    if (amt > 0 && this.hp <= 0 && !this.destroyed) {


        if (this.obj && this.obj.body) {

            var p = this.obj.body.GetWorldCenter();

            if (BSWG.xpDisplay && BSWG.game.xpInfo && this.onCC !== BSWG.game.ccblock && this.lastOnCC !== BSWG.game.ccblock && !isFriendly && !disolve && this.lastOnCC) {

                var bias = BSWG.adBias(BSWG.game.ccblock.level(), this.lastOnCC.level());
                var level = BSWG.game.xpInfo.level;
                var xpi = BSWG.xpInfo[level + 1];

                if (xpi && BSWG.game.ccblock && !BSWG.game.ccblock.destroyed) {
                    var xpBase = (BSWG.levelXpPer[level] || 0.2) * bias;
                    var totalXP = xpi.xpi * xpBase;

                    totalXP *= this.xpBase ? this.xpBase : 0.01;
                    totalXP = Math.floor(totalXP);

                    if (totalXP >= 1) {
                        BSWG.xpDisplay.giveXP(totalXP, p.clone());
                    }
                }
            }

            var v = this.obj.body.GetLinearVelocity();
            var r = this.obj.radius;
            if (this.type === 'cc') {
                r *= 1.5;
            }
            for (var i=0; i<(disolve ? 1 : 40); i++) {
                var a = Math._random() * Math.PI * 2.0;
                var r2 = Math._random() * r * 0.5;
                var p2 = new b2Vec2(p.x + Math.cos(a) * r2,
                                    p.y + Math.sin(a) * r2);
                BSWG.render.boom.palette = disolve ? chadaboom3D.green : chadaboom3D.fire_bright;
                BSWG.render.boom.add(
                    p2.particleWrap(0.025+Math.random()+0.1),
                    r*(3.5 + 2.5*Math._random()),
                    512,
                    1 + Math.pow(r, 1/3) * Math._random(),
                    2.0,
                    v.THREE(Math._random()*2.0),
                    null,
                    i < (disolve ? 1 : 4)
                );
            }
            if (!this.disolve) {
                if (this.welds) {
                    for (var key in this.welds) {
                        if (this.welds[key]) {
                            var b = this.welds[key].other;
                            if (b && b.obj && b.obj.body && this.obj && this.obj.body) {
                                var p = b.obj.body.GetWorldCenter().clone();
                                var p2 = this.obj.body.GetWorldCenter();
                                p.x -= p2.x;
                                p.y -= p2.y;
                                var len = Math.lenVec2(p);
                                p.x = (p.x / len) * r * 5;
                                p.y = (p.y / len) * r * 5;
                                b.obj.body.ApplyForceToCenter(p);
                                p = p2 = null;
                            }
                        }
                    }
                }
            }
        }

        this.hp = 0;
        this.destroyed = true;
        this.onCC = null;
        this.removeSafe();
    }

    return damageExtra;

};

BSWG.component.prototype.combinedHP = function() {
    if (this.destroyed) {
        return 0.0;
    }
    var hp = this.hp;
    if (this.type === 'shield' && this.obj && this.shieldR > this.obj.radius) {
        hp = this.shieldEnergy;
    }
    return Math.max(0, hp);
};

BSWG.component.prototype.p = function (v) {
    if (this.obj && this.obj.body) {
        if (!v) {
            return this.obj.body.GetWorldCenter();
        }
        else {
            return this.obj.body.GetWorldPoint(v);
        }
    }
    else {
        return null;
    }
};

BSWG.component.prototype.remove = function() {

    if (this._lightning) {
        this._lightning.destroy();
        this._lightning = null;
    }

    if (BSWG.game.attractorOn === this) {
        BSWG.game.attractorOn = null;
    }
    if (BSWG.game.attractorHover === this) {
        BSWG.game.attractorHover = null;
    }
    if (BSWG.game.grabbedBlock === this) {
        BSWG.game.grabbedBlock = null;
    }

    BSWG.componentList.remove(this);

};

BSWG.component.prototype.removeSafe = function() {

    this.removing = true;
    BSWG.componentList.compRemove.push(this);

};

BSWG.component.prototype.baseRenderOver = function(ctx, cam, dt) {

    if (this.renderOver) {
        this.renderOver(ctx, cam, dt);
    }

    if (!this.jpointsw) {
        return;
    }

    if (!this.onCC && this.type !== 'missile' && BSWG.game.editMode && !this.canEquip && ('minLevelEquip' in this)) {
        ctx.font = '15px Orbitron';
        ctx.fillStyle = '#f00';
        ctx.strokeStyle = '#000';
        ctx.textAlign = 'center';
        var p = BSWG.render.project3D(this.obj.body.GetWorldCenter(), 0.0);
        ctx.fillTextB("Lvl. " + this.minLevelEquip, p.x, p.y+7);
        ctx.textAlign = 'left';
        p = null;
    }

    if (this.dispKeys && BSWG.game.showControls && this.onCC === BSWG.game.ccblock) {
        for (var key in this.dispKeys) {
            var info = this.dispKeys[key];
            if (info) {
                var text = info[0];
                var rot = 0.0;

                ctx.font = '11px Orbitron';

                var p = BSWG.render.project3D(BSWG.physics.localToWorld(info[1], this.obj.body), 0.0);
                var w = Math.floor(6 + ctx.textWidth(text));
                ctx.globalAlpha = 0.75;
                ctx.fillStyle = info[2] ? '#777' : '#444';
                ctx.fillRect(p.x - w * 0.5, p.y - 10, w, 20);

                ctx.save();

                ctx.translate(Math.floor(p.x), Math.floor(p.y));
                ctx.rotate(rot);
                ctx.translate(0, 3);

                ctx.globalAlpha = 1.0;
                ctx.fillStyle = info[2] ? '#6f6' : '#fff';
                ctx.textAlign = 'center';
                ctx.fillText(text, 0, 0);
                ctx.textAlign = 'left';

                ctx.restore();
            }
        }
    }

    if (this.tag && BSWG.ai.editor && !BSWG.game.showControls && this.onCC === BSWG.game.ccblock && BSWG.componentList.compHover2 === this) {
        var text = this.tag;
        var rot = 0.0;

        ctx.font = '14px Courier, monospace';
        var p = BSWG.render.project3D(this.obj.body.GetWorldCenter(), 0.0);
        var w = Math.floor(8 * 2 + ctx.textWidthB(text)+1.0);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#fff';
        ctx.fillRect(p.x - w * 0.5, p.y - 10 - 15, w, 20);

        ctx.save();

        ctx.translate(Math.floor(p.x), Math.floor(p.y) - 15);
        ctx.rotate(rot);
        ctx.translate(0, 3);

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(text, 0, 0);
        ctx.textAlign = 'left';

        ctx.restore();
    }

    if (this.orphanTimeLeft && this.orphanTimeLeft < 30.0) {
        var p = BSWG.render.project3D(this.obj.body.GetWorldCenter(), 0.0);
        var sz = Math.max(BSWG.render.viewport.w, BSWG.render.viewport.h) / 150;
        ctx.globalAlpha = Math.clamp(this.orphanTimeLeft, 0, 1) * (1 - Math.clamp((this.orphanTimeLeft-30), 0, 1));
        var t = this.orphanTimeLeft / BSWG.orphanTimeLive;
        ctx.fillStyle = 'rgba(' + Math.floor((1-t)*255) + ',' + Math.floor(Math.pow(t, 0.25)*255) + ',92,1)';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.font = sz + 'px Orbitron';
        ctx.textAlign = 'center';
        ctx.strokeText(Math.floor(this.orphanTimeLeft) + '', p.x, p.y + (sz*0.5));
        ctx.fillText(Math.floor(this.orphanTimeLeft) + '', p.x, p.y + (sz*0.5));
        ctx.globalAlpha = 1.0;
    }

    ctx.globalAlpha = 1.0;

    if (this.traceClr) {
        ctx.globalAlpha = 0.85;
        var p = BSWG.render.project3D(this.obj.body.GetWorldCenter(), 0.0);
        ctx.fillStyle = this.traceClr;
        ctx.fillRect(p.x-5, p.y-5, 10, 10);
        ctx.globalAlpha = 1.0;
    }

};

BSWG.component.prototype.cacheJPW = function() {
    if (this.jpointsw) {
        for (var i=0; i<this.jpointsw.length; i++) {
            this.jpointsw[i] = null;
        }
        this.jpointsw.length = 0;
        this.jpointsw = null;
    }
    this.jpointsw = BSWG.physics.localToWorld(this.jpoints, this.obj.body);
    for (var i=0; i<this.jpoints.length; i++) {
        this.jpointsw[i].motorType = this.jpoints[i].motorType || 0;
    }
    this.jmhover = -1;
};

BSWG.component.prototype.updateJCache = function() {

    if (!BSWG.game.editMode && !BSWG.componentList.autoWelds) {
        return;
    }

    var autos = null;
    if (BSWG.componentList.autoWelds) {
        autos = BSWG.componentList.autoWelds;
    }

    if (!this.jpointsw || (this.onCC !== BSWG.game.ccblock && this.onCC !== null && !BSWG.componentList.autoWelds)) {
        return;
    }

    if (this.jmatch) {
        for (var i=0; i<this.jmatch.length; i++) {
            this.jmatch[i].length = 0;
            this.jmatch[i] = null;
        }
        this.jmatch.length = 0;
        this.jmatch = null;
    }

    this.jmatch = [];
    this.jmhover = -1;

    var _p = this.obj.body.GetWorldCenter();
    var p = new b2Vec2(_p.x, _p.y);
    var cl = BSWG.componentList.withinRadius(p, this.obj.radius+0.5);

    var jpw = this.jpointsw;

    var mps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
    var mp = BSWG.render.unproject3D(mps, 0.0);

    var mind = 10.0;
    for (var i=0; i<jpw.length; i++) {
        var tp = jpw[i];
        var d = Math.pow(tp.x - mp.x, 2.0) +
                Math.pow(tp.y - mp.y, 2.0);
        if (d < mind)
        {
            this.jmhover = i;
            mind = d;
        }
    }
    if (mind > BSWG.component_jMatchClickRange || BSWG.compActiveConfMenu) {
        this.jmhover = -1;
    }

    for (var i=0; i<cl.length; i++) {
        if (cl[i] !== this && BSWG.physics.bodyDistance(this.obj.body, cl[i].obj.body) < 1.0) {
            var jpw2 = cl[i].jpointsw;

            for (var k1=0; jpw && k1<jpw.length; k1++)
                for (var k2=0; jpw2 && k2<jpw2.length; k2++)
                {
                    var p1 = jpw[k1];
                    var p2 = jpw2[k2];
                    var d2 = Math.pow(p1.x - p2.x, 2.0) +
                             Math.pow(p1.y - p2.y, 2.0);
                    if (((p1.motorType && !p2.motorType) || (p2.motorType && !p1.motorType) ||
                        (p1.motorType && p1.motorType === p2.motorType) ||
                        (p1.motorType && (p1.motorType%10) != (p2.motorType%10))) &&
                        !(p1.motorType === 61 && p2.motorType === 61)) {
                        p1 = p2 = null;
                        continue;
                    }
                    if (d2 < BSWG.component_minJMatch) {
                        var auto = false;
                        if (autos) {
                            var _c = new b2Vec2((p1.x+p2.x)*0.5, (p1.y+p2.y)*0.5);
                            for (var f=0; f<autos.length; f++) {
                                if (Math.distSqVec2(_c, autos[f]) < BSWG.component_minJMatch) {
                                    auto = true;
                                    break;
                                }
                            }
                        }
                        this.jmatch.push([
                            k1, cl[i], k2, p1.motorType || 0, p2.motorType || 0, auto
                        ]);
                        if (cl[i].jmhover === k2) {
                            if (BSWG.game.editMode) {
                                this.jmhover = k1;
                            }
                        }
                        else if (this.jmhover === k1) {
                            if (BSWG.game.editMode) {
                                cl[i].jmhover = k2;
                            }
                        }
                        p1 = p2 = null;
                        break;
                    }
                    p1 = p2 = null;
                }
        }
    }   

    cl.length = 0;
    _p = p = cl = jpw = t = mps = mp = null;
};   

BSWG.component.prototype.baseUpdate = function(dt) {

    this.empEffect -= dt;
    if (this.empEffect <= 0) {
        this.empEffect = 0;
    }
    this.empDamp = 1.0 - Math.clamp(this.empEffect, 0, 1);

    if (this.empEffect > 0 && !this.destroyed) {
        var just = false;
        if (!this._lightning) {
            this._lightning = new BSWG.lightning(this.p(), new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, 1));
            this._lightning.lp = new b2Vec2(0, 0);
            this._lightning.lep = new b2Vec2(0, 0);
            just = true;
        }

        if (just || (Math._random() < 1/20)) {
            for (var k=0; k<32; k++) {
                var a = Math._random() * Math.PI * 2.0;
                var r = Math._random() * (this.obj.radius || 1.0);
                var lp = new b2Vec2(Math.cos(a)*r, Math.sin(a)*r);
                var p = this.p(lp);
                if (BSWG.componentList.atPoint(p, this)) {
                    this._lightning.lp = lp;
                    break;
                }
            }
        }
        if (just || (Math._random() < 1/20)) {
            for (var k=0; k<32; k++) {
                var a = Math._random() * Math.PI * 2.0;
                var r = Math._random() * (this.obj.radius || 1.0);
                var lp = new b2Vec2(Math.cos(a)*r, Math.sin(a)*r);
                var p = this.p(lp);
                if (BSWG.componentList.atPoint(p, this)) {
                    this._lightning.lep = lp;
                    break;
                }
            }
        }

        this._lightning.p = this.p(this._lightning.lp).THREE(0.2);
        this._lightning.ep = this.p(this._lightning.lep).THREE(0.2);
        this._lightning.n = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, 1);
        this._lightning.alpha = 1.0 - this.empDamp;
        this._lightning.update(dt);
    }
    else {
        if (this._lightning) {
            this._lightning.destroy();
            this._lightning = null;
        }
    }

    this.canEquip = true;
    if (this.onCC) {
        this.lastOnCC = this.onCC;
    }

    var newMassF = 1.0;
    if (this.onCC && this.onCC.massive) {
        newMassF *= 2.0;
    }
    if (this.onCC && this.onCC.massive2) {
        newMassF *= 4.0;
    }
    if (this.onCC && this.onCC.lightweight) {
        newMassF *= 0.75;
    }
    if (Math.abs(newMassF - this.massFactor) > 0.0001) {
        this.massFactor = newMassF;
        if (this.obj && this.obj.body) {
            var fixture = this.obj.body.GetFixtureList();
            while (fixture) {
                if (!fixture.__oden) {
                    fixture.__oden = fixture.GetDensity();
                }
                fixture.SetDensity(fixture.__oden * this.massFactor);
                fixture = fixture.GetNext();
            }
            this.obj.body.ResetMassData();
        }
    }

    if (BSWG.game.map && !('minLevelEquip' in this)) {
        this.minLevelEquip = BSWG.game.map.minLevelComp(this);
    }

    if (BSWG.game.xpInfo && ('minLevelEquip' in this)) {
        if (this.minLevelEquip > BSWG.game.xpInfo.level && !this.onCC) {
            this.canEquip = false;
        }
    }

    this.orphanTimeLeft = 0.0;
    if (BSWG.game.scene === BSWG.SCENE_GAME1 && !this.onCC && this.obj && this.obj.body && this.type !== 'missile') {
        var zone = BSWG.game.map ? BSWG.game.map.getZone(this.obj.body.GetWorldCenter()) : null;
        if (zone && !zone.safe) {
            if (this.orphanTime && !BSWG.game.battleMode) {
                this.orphanTimeLeft = BSWG.orphanTimeLive - (Date.timeStamp() - this.orphanTime);
                if (this.orphanTimeLeft <= 0.0) {
                    this.orphanTimeLeft = 0.0;
                    this.takeDamage(1000000000, null, true, true);
                }
            }
            else if (!this.orphanTime) {
                this.orphanTime = Date.timeStamp();
            }
            else {
                this.orphanTime += dt;
                this.orphanTimeLeft = 0.0;
            }
        }
    }
    else if (this.onCC) {
        this.orphanTime = null;
    }

    this.repairing = false;
    if (this.healHP > 0) {
        var amt = Math.clamp(dt*5.0, 0, this.healHP);
        this.healHP -= amt;
        this.repairing = true;
        this.takeDamage(-amt, null, true);
        if (this.healHP <= 0) {
            this.healHP = 0.0;
        }
    }
    if (!BSWG.game.battleMode && BSWG.game.ccblock && (!BSWG.game.scene === BSWG.SCENE_GAME1 || BSWG.game.saveHealAdded) && this.hp < this.maxHP) {
        if (BSWG.game.scene !== BSWG.SCENE_GAME2 || this.onCC) {
            this.repairing = true;
            this.takeDamage(-dt*5.0, null, true);
        }
    }

    if (BSWG.compAnchored(this)) {
        if (this.obj && this.obj.body) {
            this.obj.body.SetAngularDamping(5.0);
            this.obj.body.SetLinearDamping(5.0);
        }
    }
    else {
        if (this.obj && this.obj.body) {
            this.obj.body.SetAngularDamping(BSWG.physics.baseDamping);
            this.obj.body.SetLinearDamping(BSWG.physics.baseDamping);
        }
    }

    if (!this.jpointsw || !this.jmatch) {
        return;
    }

    var doWelds = false;

    if (BSWG.game.editMode) {
        if (this.jmhover >= 0 && !BSWG.ui.mouseBlock && BSWG.input.MOUSE_PRESSED('left') && !BSWG.input.MOUSE('shift') && !BSWG.game.grabbedBlock) {
            doWelds = true;
        }
    }

    var autos = null;

    if (BSWG.componentList.autoWelds) {
        autos = BSWG.componentList.autoWelds;
        doWelds = true;
    }

    if (doWelds) {
        for (var i=0; i<this.jmatch.length; i++) {
            if (((this.jmatch[i][0] === this.jmhover || this.jmatch[i][5]) && this.jmatch[i][1].id > this.id)) {
                if (!this.welds[this.jmatch[i][0]]) {

                    var makeWeld = function(self, args, args2) {
                        return function() {
                            if (!self || !self.obj || !self.obj.body) {
                                args.length = args2.length = 0;
                                args = args2 = self = null;
                                return;
                            }
                            if (!args2[0] || !args2[0][1] || !args2[0][1].obj || !args2[0][1].obj.body) {
                                args.length = args2.length = 0;
                                args = args2 = self = null;
                                return;
                            }

                            var obj = BSWG.physics.createWeld(args[0], args[1], args[2], args[3], args[4],
                                                              args[5], args[6], args[7], args[8], args[9], args[10]);

                            if (self.onCC && !args2[0][1].onCC) {
                                args2[0][1].onCC = this.onCC;
                            }
                            if (!self.onCC && args2[0][1].onCC) {
                                self.onCC = args2[0][1].onCC;
                            }

                            self.welds[args2[0][0]] = { obj: obj, other: args2[0][1] };
                            args2[0][1].welds[args2[0][2]] = { obj: obj, other: self };

                            BSWG.updateOnCC(self, args2[0][1]);

                            var p2 = args2[0][1].jpointsw[args2[0][2]];
                            var p1 = self.jpointsw[args2[0][0]];

                            if (!autos && p2 && p1) {
                                var p = new b2Vec2((p1.x+p2.x)*0.5, (p1.y+p2.y)*0.5).particleWrap(0.2);
                                new BSWG.soundSample().play('store', p, 0.31, 2.0);
                                BSWG.render.boom.palette = chadaboom3D.blue;
                                BSWG.render.boom.add(
                                    p,
                                    0.75,
                                    32,
                                    0.4,
                                    1.0,
                                    null,
                                    null,
                                    false
                                );
                                var ma = self.obj.body.GetMass(),
                                    mb = args2[0][1].obj.body.GetMass();
                                new BSWG.soundSample().play('bump', p, 0.5, 0.35 / (ma / 2.5));
                                new BSWG.soundSample().play('bump', p, 0.5, 0.35 / (mb / 2.5));
                                p = null;
                                BSWG.physics.endMouseDrag();
                                BSWG.game.grabbedBlock = null;
                            }                            

                            args.length = args2.length = 0;
                            args = args2 = self = null;
                        }
                    }
                    (
                        this,
                        [
                            this.obj.body, this.jmatch[i][1].obj.body,
                            this.jpoints[this.jmatch[i][0]],
                            this.jmatch[i][1].jpoints[this.jmatch[i][2]],
                            true,
                            this.jpointsNormals[this.jmatch[i][0]],
                            this.jmatch[i][1].jpointsNormals[this.jmatch[i][2]],
                            this.jmatch[i][3],
                            this.jmatch[i][4],
                            [13,14,15,23,24,25,61].indexOf(this.jmatch[i][3]) >= 0
                        ],
                        [
                            [ this.jmatch[i][0], this.jmatch[i][1], this.jmatch[i][2] ]
                        ]
                    );

                    if (!autos) { // player action
                        if (this.canEquip && this.jmatch[i][1].canEquip) {
                            BSWG.physics.playerWeld(
                                makeWeld, // weldCbk
                                this, // objA
                                this.jmatch[i][1], // objB
                                this.jpoints[this.jmatch[i][0]], // anchorA
                                this.jmatch[i][1].jpoints[this.jmatch[i][2]], // anchorB
                                i, // jpA
                                this.jmatch[i][2] // jpB
                            );
                        }
                        else {
                            new BSWG.soundSample().play('error', this.obj.body.GetWorldCenter().THREE(0.2), 1.0, 1.5);
                            BSWG.game.berrorMsg('Insufficient level');
                        }
                        BSWG.input.EAT_MOUSE('left');
                    }
                    else {
                        makeWeld();
                    }
                }
                else if (!autos) {
                    BSWG.physics.removeWeld(this.welds[this.jmatch[i][0]].obj);
                    var p = this.jpointsw[this.jmatch[i][0]].particleWrap(0.2);
                    this.welds[this.jmatch[i][0]].other = null;
                    this.welds[this.jmatch[i][0]] = null;
                    this.jmatch[i][1].welds[this.jmatch[i][2]].other = null;
                    this.jmatch[i][1].welds[this.jmatch[i][2]] = null;  

                    BSWG.updateOnCC(this, this.jmatch[i][1]);
                    new BSWG.soundSample().play('store-2', p, 0.31, 2.0);
                    BSWG.render.boom.palette = chadaboom3D.fire;
                    BSWG.render.boom.add(
                        p,
                        1.25,
                        32,
                        0.4,
                        1.0,
                        null,
                        null,
                        false
                    );
                    p = null;

                    BSWG.input.EAT_MOUSE('left');
                }
            }
        }
    }

    if (this.welds) {
        for (var k in this.welds) {
            if (this.welds[k] && this.welds[k].obj.broken) {
                var other = this.welds[k].other;
                var k2;
                for (k2 in other.welds) {
                    if (other.welds[k2] && other.welds[k2].obj === this.welds[k].obj) {
                        BSWG.physics.removeWeld(this.welds[k].obj);
                        this.welds[k].other = null;
                        this.welds[k] = null;
                        other.welds[k2].other = null;
                        other.welds[k2] = null; 
                        BSWG.updateOnCC(this, other);
                        break;
                    }
                }
            }
        }
    }

};

BSWG.component.prototype.pointIn = function(p) {

    if (this.obj.type === 'multipoly') {

        for (var i=0; i<this.obj.fixture.length; i++) {
            if (!!this.obj.fixture[i].TestPoint(p)) {
                return true;
            }
        }
        return false;
    }
    else {
        return !!this.obj.fixture.TestPoint(p);
    }

};

BSWG.component.prototype.getLocalPoint = function(p) {

    var p2 = this.obj.body.GetLocalPoint(p);
    return new b2Vec2(p2.x, p2.y);

};

BSWG.component.prototype.getWorldPoint = function(p) {

    var p2 = this.obj.body.GetWorldPoint(p);
    return new b2Vec2(p2.x, p2.y);

};

BSWG.component.prototype.addForce = function (f, p) {

    if (!p)
        this.obj.body.ApplyForceToCenter(f);
    else
        this.obj.body.ApplyForce(f, p);

};

BSWG.component.prototype.distanceTo = function (comp2) {
    if (!this.obj || !this.obj.body || !comp2.obj || !comp2.obj.body) {
        return 1000000.0;
    }
    return Math.distVec2(this.obj.body.GetWorldCenter(), comp2.obj.body.GetWorldCenter());
};

BSWG.componentList = new function () {

    this.compList = [];
    this.compRemove = [];
    this.staticList = [];

    this.clearStatic = function () {

        while (this.staticList.length) {
            this.removeStatic(this.staticList[0]);
        }

        for (var key in this.staticHash) {
            if (this.staticHash[key] &&  this.staticHash[key].length) {
                var lst = this.staticHash[key];
                for (var i=0; i<lst.length; i++) {
                    lst[i] = null;
                }
                lst.length = 0;
            }
            this.staticHash[key] = null;
            delete this.staticHash[key];
        }

        this.staticHash = {};

    };

    this.compCached = false;

    this.clear = function () {

        for (var key in this.archHash) {
            if (this.archHash[key] &&  this.archHash[key].length) {
                var lst = this.archHash[key];
                for (var i=0; i<lst.length; i++) {
                    lst[i] = null;
                }
                lst.length = 0;
            }
            this.archHash[key] = null;
            delete this.archHash[key];
        }

        this.archHash = {};
        this.hash = {};

        this.typeMap = {
            'blaster':          BSWG.component_Blaster,
            'block':            BSWG.component_Block,
            'chainlink':        BSWG.component_ChainLink,
            'cc':               BSWG.component_CommandCenter,
            'detacherlauncher': BSWG.component_DetacherLauncher,
            'hingehalf':        BSWG.component_HingeHalf,
            'laser':            BSWG.component_Laser,
            'missile-launcher': BSWG.component_MissileLauncher,
            'missile':          BSWG.component_Missile,
            'sawblade':         BSWG.component_SawBlade,
            'sawmotor':         BSWG.component_SawMotor,
            'spikes':           BSWG.component_Spikes,
            'thruster':         BSWG.component_Thruster,
            'minigun':          BSWG.component_Minigun,
            'shield':           BSWG.component_Shield,
            'railgun':          BSWG.component_Railgun,
            'razor':            BSWG.component_Razor,
        };

        this.sbTypes = [];
        for (var key in this.typeMap) {
            if (this.typeMap[key].sbadd) {
                this.sbTypes.push(this.typeMap[key]);
            }
        }
        this.sbTypes.sort(function(a, b){
            var c = a.category.localeCompare(b.category);
            if (!c) {
                return a.name.localeCompare(b.name);
            }
            else {
                return c;
            }
        });

        if (!this.compCached) {
            for (var i=0; i<this.sbTypes.length; i++) {
                var sbadd = this.sbTypes[i].sbadd;
                for (var j=0; j<sbadd.length; j++) {
                    var args = {};
                    for (var key in sbadd[j]) {
                        if (key !== 'title' && key !== 'count') {
                            args[key] = sbadd[j][key];
                        }
                    }
                    args.pos = new b2Vec2(0, 0);
                    args.angle = 0;
                    comp = new BSWG.component(this.sbTypes[i], args);
                    comp.remove();
                }
            }
            this.compCached = true;
        }

        while (this.compList.length) {
            this.compList[0].remove();
        }

        this.compRemove.length = 0;

    };

    this.allCCs = function () {
        var len = this.compList.length;
        var ret = [];
        for (var i=0; i<len; i++) {
            if (this.compList[i].type === 'cc') {
                ret.push(this.compList[i]);
            }
        }
        return ret;
    };

    this.add = function (comp) {

        this.compList.push(comp);
        /*this.compList.sort(function(a,b){

            return a.sortOrder - b.sortOrder;

        });*/
        return true;

    };

    this.remove = function (comp) {

        if (comp.removed) {
            return false;
        }
        comp.removed = true;

        comp.destroy();

        if (comp.obj) {
            BSWG.physics.removeObject(comp.obj);
            comp.obj = null;
        };

        var oldCC = comp.onCC;
        comp.onCC = null;
        if (comp.welds) {
            for (var k in comp.welds) {
                if (comp.welds[k]) {
                    var other = comp.welds[k].other;
                    var k2;
                    for (k2 in other.welds) {
                        if (other.welds[k2] && other.welds[k2].obj === comp.welds[k].obj) {
                            BSWG.physics.removeWeld(comp.welds[k].obj);
                            comp.welds[k].other = null;
                            comp.welds[k] = null;
                            other.welds[k2].other = null;
                            other.welds[k2] = null; 
                            BSWG.updateOnCC(comp, other);
                            break;
                        }
                    }
                }
            }
        }
        comp.welds = null;

        for (var i=0; i<this.compList.length; i++)
            if (this.compList[i] === comp) {
                this.compList.splice(i, 1);
                return true;
            }

        return false;

    };

    this.handleInput = function (cc, keys) {

        var len = this.compList.length;
        for (var i=0; i<len; i++) {
            if (!cc || this.compList[i].onCC === cc) {
                this.compList[i].handleInput(keys);
            }
        }

        if (this.mouseOver && this.mouseOver.openConfigMenu && this.mouseOver.onCC && (BSWG.game.editMode || BSWG.game.showControls) && !BSWG.game.grabbedBlock) {
            if (BSWG.input.MOUSE_PRESSED('left') && BSWG.input.MOUSE('shift') && !BSWG.ui.mouseBlock) {
                BSWG.input.EAT_MOUSE('left');
                this.mouseOver.openConfigMenu();
            }
            else if (BSWG.input.MOUSE_PRESSED('right') && !BSWG.ui.mouseBlock) {
                BSWG.input.EAT_MOUSE('right');
                this.mouseOver.openConfigMenu();
            }
        }

    };

    this.hash = {};
    this.hashXY = function ( v ) {
        return Math.floor(v/BSWG.comp_hashSize);
    };
    this.hashKey = function ( x, y ) {
        return Math.floor(x/BSWG.comp_hashSize) + Math.floor(y/BSWG.comp_hashSize) * 10000000;
    };
    this.hashKey2 = function ( x, y ) {
        return x + y * 10000000;
    };

    this.staticHash = {};
    this.sHashXY = function ( v ) {
        return Math.floor(v/BSWG.comp_staticHashSize);
    };
    this.sHashKey = function ( x, y ) {
        return Math.floor(x/BSWG.comp_staticHashSize) + Math.floor(y/BSWG.comp_staticHashSize) * 10000000;
    };
    this.sHashKey2 = function ( x, y ) {
        return x + y * 10000000;
    };

    this.aHashXY = function ( v ) {
        return Math.floor(v/BSWG.arch_hashSize);
    };
    this.aHashKey = function ( x, y ) {
        return Math.floor(x/BSWG.arch_hashSize) + Math.floor(y/BSWG.arch_hashSize) * 10000000;
    };
    this.aHashKey2 = function ( x, y ) {
        return x + y * 10000000;
    };

    this.updateStaticHash = function ( ) {

        for (var key in this.staticHash) {
            var list = this.staticHash[key];
            for (var i=0; i<list.length; i++) {
                list[i] = null;
            }
            list.length = 0;
            list = null;
            this.staticHash[key] = null;
            delete this.staticHash[key];
        }

        var len = this.staticList.length;
        for (var i=0; i<len; i++) {
            var C = this.staticList[i];
            var p = C.center;
            var r = C.radius * 1.25;
            var x1 = this.sHashXY(p.x - r), y1 = this.sHashXY(p.y - r),
                x2 = this.sHashXY(p.x + r), y2 = this.sHashXY(p.y + r);

            for (var x=x1; x<=x2; x++) {
                for (var y=y1; y<=y2; y++) {
                    var key = this.sHashKey2(x,y);
                    if (!this.staticHash[key]) {
                        this.staticHash[key] = [];
                    }
                    this.staticHash[key].push(C);
                }
            }            
        }

    };

    this.archHash = {};
    this.archObjNextID = 1;
    this.playerComps = [];

    this.update = function (dt) {

        this.hash = {};

        this.playerComps.length = 0;

        var len = this.compList.length;
        for (var i=0; i<len; i++) {

            var C = this.compList[i];
            var p = C.obj.body.GetWorldCenter();
            var r = Math.max(C.obj.radius, C.shieldR||0) * 1.25;
            var x1 = this.hashXY(p.x - r), y1 = this.hashXY(p.y - r),
                x2 = this.hashXY(p.x + r), y2 = this.hashXY(p.y + r);

            if (C.onCC === BSWG.game.ccblock && BSWG.game.ccblock) {
                this.playerComps.push(C.onCC);
            }

            for (var x=x1; x<=x2; x++) {
                for (var y=y1; y<=y2; y++) {
                    var key = this.hashKey2(x,y);
                    if (!this.hash[key]) {
                        this.hash[key] = [];
                    }
                    this.hash[key].push(C);
                }
            }

            if (this.compList[i].updateAI) {
                var keys = this.compList[i].updateAI(dt);
                if (keys) {
                    this.handleInput(this.compList[i], keys);
                }
            }
        }
        for (var i=0; i<len; i++) {
            this.compList[i].cacheJPW();
        }
        for (var i=0; i<len; i++) {
            this.compList[i].updateJCache();
        }
        for (var i=0; i<len; i++) {
            this.compList[i].baseUpdate(dt);
            this.compList[i].update(dt);
        }

        len = this.compRemove.length;
        for (var i=0; i<len; i++) {
            this.remove(this.compRemove[i]);
        }
        this.compRemove.length = 0;
        this.autoWelds = null;

        len = this.compList.length;
        var CL = this.compList;
        for (var i=0; i<len; i++) {
            if (CL[i].onCC && CL[i].type == 'cc') {
                CL[i].totalMass = (CL[i].obj && CL[i].obj.body) ? CL[i].obj.body.GetMass() : 0.0;
            }
        }
        for (var i=0; i<len; i++) {
            if (CL[i].onCC && CL[i].type != 'cc') {
                CL[i].onCC.totalMass += (CL[i].obj && CL[i].obj.body) ? CL[i].obj.body.GetMass() : 0.0;
            }
        }

        for (var i=0; i<len; i++) {
            var C = this.compList[i];
            if (C.onCC === null && C.type != 'cc') {
                var list = this.shouldArc(C);
                if (list === true) {
                    C.removeSafe();
                }
                else if (list && list.length) {
                    var arch = this.serialize(null, null, list);
                    arch.archived = true;
                    arch.id = this.archObjNextID++;
                    //console.log('Archiving ' + list.length + ' objects');
                    //console.log('compList len before: ' + this.compList.length);
                    for (var j=0; j<list.length; j++) {
                        if (list[j].obj && list[j].obj.body) {
                            var p = list[j].obj.body.GetWorldCenter();
                            var key = this.aHashKey(p.x, p.y);
                            if (!this.archHash[key]) {
                                this.archHash[key] = [];
                            }
                            this.archHash[key].push(arch);
                        }
                        this.remove(list[j]);
                    }
                    //console.log('compList len after: ' + this.compList.length);
                    len = this.compList.length;
                    i = -1;
                    break;
                }
            }
        }

        var _x1 = this.aHashXY(BSWG.game.cam.x - BSWG.archiveRange);
        var _y1 = this.aHashXY(BSWG.game.cam.y - BSWG.archiveRange);
        var _x2 = this.aHashXY(BSWG.game.cam.x + BSWG.archiveRange);
        var _y2 = this.aHashXY(BSWG.game.cam.y + BSWG.archiveRange);

        var x1 = Math.min(_x1, _x2);
        var x2 = Math.max(_x1, _x2);
        var y1 = Math.min(_y1, _y2);
        var y2 = Math.max(_y1, _y2);

        for (var x=x1; x<=x2; x++) {
            for (var y=y1; y<=y2; y++) {
                var key = this.aHashKey2(x, y);
                if (this.archHash[key] && this.archHash[key].length) {
                    var list = this.archHash[key];
                    for (var i=0; i<list.length; i++) {
                        if (!list[i].archived) {
                            list.splice(i, 1);
                            i -= 1;
                            continue;
                        }
                        //console.log(x1, y1, x2, y2);
                        //console.log('Unarchiving ' + list[i].list.length + ' objects');
                        //console.log('compList len before: ' + this.compList.length);
                        if (this.load(list[i], null, true, true, true) === -1) {
                            console.log('Unarchive failed (collision)');
                        }
                        else {
                            list[i].archived = false;
                            list.splice(i, 1);
                            i -= 1;
                            //console.log('compList len after: ' + this.compList.length);
                            break;
                        }
                    }
                }
            }
        }

    };

    this.shouldArc = function (C, u, o) {

        if (C.type === 'missile' || C.onCC) {
            return false;
        }

        if (!u) u = {};
        if (!o) o = [];
        if (u[C.id]) {
            return o;
        }
        u[C.id] = true;

        if ((Date.timeStamp() - C.initTime) < 2.5) {
            return false;
        }

        if (C.obj && C.obj.body) {
            /*var zone = BSWG.game.map ? BSWG.game.map.getZone(C.obj.body.GetWorldCenter()) : null;
            if (zone && !zone.safe && C.type !== 'cc' && Math.distVec2(C.obj.body.GetWorldCenter(), new b2Vec2(BSWG.game.cam.x, BSWG.game.cam.y)) > BSWG.archiveRange) {
                return true;
            }*/

            if (C.type !== 'cc' && Math.distVec2(C.obj.body.GetWorldCenter(), new b2Vec2(BSWG.game.cam.x, BSWG.game.cam.y)) > BSWG.archiveRange) {
                o.push(C);
                if (C.welds) {
                    for (var key in C.welds) {
                        if (C.welds[key]) {
                            if (!this.shouldArc(C.welds[key].other, u, o)) {
                                return false;
                            }
                        }
                    }
                }
            }
            else {
                return false;
            }
        }

        return o;
    };

    this.render = function (ctx, cam, dt) {

        ctx.save();

        var p = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var pw = BSWG.render.unproject3D(p, 0.0);
        var len = this.compList.length;

        this.compHover2 = this.atPoint(pw);

        this.mouseOver = null;
        for (var i=0; i<len; i++) {
            if (this.compList[i].confm && this.compList[i].confm === BSWG.compActiveConfMenu) {
                this.mouseOver = this.compList[i];
                break;
            }
            if (BSWG.game.grabbedBlock === this.compList[i]) {
                this.mouseOver = this.compList[i];
                break;
            }
        }
        if (!this.mouseOver) {
            this.mouseOver = this.compHover2;
        }
        if (this.mouseOver && BSWG.componentHoverFn(this.mouseOver) && (!BSWG.ui.mouseBlock || BSWG.game.grabbedBlock)) {
            if (BSWG.game.storeMode && !BSWG.game.editMode && BSWG.game.scene === BSWG.SCENE_GAME1) {
                BSWG.render.setCustomCursor(true, 4);
            }
            else if (this.mouseOver.hasConfig && this.mouseOver.onCC && (BSWG.game.editMode || BSWG.game.showControls) && !BSWG.ui.mouseBlock) {
                BSWG.render.setCustomCursor(true, BSWG.input.KEY_DOWN(BSWG.KEY.SHIFT) ? 6 : 3);
            }
            else if (BSWG.game.editMode) {
                BSWG.render.setCustomCursor(true, 2);
            }
        }
        else if (BSWG.game.attractorShowing) {
            BSWG.render.setCustomCursor(true, 4);
        }
        else if (BSWG.game.editCam && BSWG.input.MOUSE('middle')) {
            BSWG.render.setCustomCursor(true, 2);
        }
        else {
            BSWG.render.setCustomCursor(true);
        }

        for (var i=0; i<len; i++) {
            this.compList[i].render(ctx, cam, dt);
        }
        for (var i=0; i<len; i++) {
            this.compList[i].baseRenderOver(ctx, cam, dt);
        }

        BSWG.jpointRenderer.render();

        for (var i=0; i<len; i++) {
            if (this.compList[i].ai && this.compList[i].ai.__update_sensors) {
                this.compList[i].ai.__update_sensors(BSWG.ai.consoleDiv && BSWG.ai.showDebug ? ctx : null, dt);
            }
        }

        ctx.restore();
    };

    this.atPoint = function (p, only) {

        var CL = only ? [ only ] : this.hash[this.hashKey(p.x, p.y)];
        if (!CL) {
            return;
        }

        var raycaster = BSWG.render.raycaster;

        raycaster.set(new THREE.Vector3(p.x, p.y, 0.4), new THREE.Vector3(0.0, 0.0, -1.0));

        var len = CL.length;
        for (var i=0; i<len; i++) {
            if (!CL[i] || !CL[i].queryMeshes) {
                continue;
            }
            if (!CL[i].removed && raycaster.intersectObjects(CL[i].queryMeshes.constructor === Array ? CL[i].queryMeshes : [ CL[i].queryMeshes ]).length > 0) {
                return CL[i];
            }
        }
        return null;

    };

    this.inLine = function(_x1, _y1, _x2, _y2, fn) {
        var x1 = this.hashXY(_x1), y1 = this.hashXY(_y1),
            x2 = this.hashXY(_x2), y2 = this.hashXY(_y2);

        var dx = x2 - x1;
        var dy = y2 - y1;
        var len = Math.sqrt(dx*dx+dy*dy);
        dx /= len;
        dy /= len;

        var found = {};
        var ku = {};

        for (var t=0; t<=len; t+=1.0) {
            var ox = Math.floor(x1 + dx * t),
                oy = Math.floor(y1 + dy * t);
            for (var _x=-1; _x<=1; _x++) {
                for (var _y=-1; _y<=1; _y++) {
                    if (_x && _y) {
                        continue;
                    }
                    var key = this.hashKey2(ox + _x, oy + _y);
                    if (ku[key]) {
                        continue;
                    }
                    ku[key] = true;
                    var list = this.hash[key];
                    if (list) {
                        for (var i=0; i<list.length; i++) {
                            if (!found[list[i].id] && !list[i].removed) {
                                found[list[i].id] = true;
                                fn(list[i]);
                            }
                        }
                    }
                }
            }
        }

        var x1 = this.sHashXY(_x1), y1 = this.sHashXY(_y1),
            x2 = this.sHashXY(_x2), y2 = this.sHashXY(_y2);

        var dx = x2 - x1;
        var dy = y2 - y1;
        var len = Math.sqrt(dx*dx+dy*dy);
        dx /= len;
        dy /= len;

        ku = {};

        for (var t=0; t<=len; t+=1.0) {
            var ox = Math.floor(x1 + dx * t),
                oy = Math.floor(y1 + dy * t);
            for (var _x=-1; _x<=1; _x++) {
                for (var _y=-1; _y<=1; _y++) {
                    if (_x && _y) {
                        continue;
                    }
                    var key = this.sHashKey2(ox + _x, oy + _y);
                    if (ku[key]) {
                        continue;
                    }
                    ku[key] = true;
                    var list = this.staticHash[key];
                    if (list) {
                        for (var i=0; i<list.length; i++) {
                            if (!found[list[i].id] && !list[i].removed) {
                                found[list[i].id] = true;
                                fn(list[i]);
                            }
                        }
                    }
                }
            }
        }

        found = null;
    };

    this.withRay = function (p, p2, shieldFilterSource) {

        var raycaster = BSWG.render.raycaster;

        var dx = p2.x - p.x, dy = p2.y - p.y, dz = p2.z - p.z;
        var vlen = Math.sqrt(dx*dx+dy*dy+dz*dz);

        raycaster.set(p, new THREE.Vector3(dx/vlen, dy/vlen, dz/vlen));

        var dist = vlen+0.001;
        var best = null, bestP = null;
        this.inLine(p.x, p.y, p2.x, p2.y, function(C){
            if (!C || !C.queryMeshes) {
                return;
            }
            if (C && shieldFilterSource && C.type === 'shield' && C.onCC === shieldFilterSource.onCC) {
                return;
            }
            if (C && C.combinedHP && C.combinedHP() <= 0) {
                return;
            }
            var inter = raycaster.intersectObjects(C.queryMeshes.constructor === Array ? C.queryMeshes : [ C.queryMeshes ]);
            for (var j=0; j<inter.length; j++)
            {
                if (inter[j].distance < dist) {
                    dist = inter[j].distance;
                    best = C;
                    bestP = inter[j].point;
                }
            }
        });

        if (best) {
            return {
                comp: best,
                p: bestP,
                d: dist
            };
        }
        return null;

    };

    this.addStatic = function (comp) {

        this.removeStatic(comp);
        
        comp.obj = BSWG.physics.createObject('box', comp.center, 0, {
            width:    comp.radius*2.48,
            height:   comp.radius*2.48,
            smooth:   0.01,
            static:   true
        });

        this.staticList.push(comp);

    };

    this.removeStatic = function (comp) {

        if (comp.obj) {
            BSWG.physics.removeObject(comp.obj);
            comp.obj = null;
        };

        var len = this.staticList.length;
        for (var i=0; i<len; i++) {
            if (this.staticList[i].id === comp.id) {
                this.staticList.splice(i, 1);
                return true;
            }
        }
        return false;

    };

    this.makeQueryable = function (comp, mesh) {

        mesh.__compid = comp.id;
        comp.queryMeshes = comp.queryMeshes || [];
        comp.queryMeshes.push(mesh);
        return true;

    };

    this.removeQueryable = function (comp, mesh, meshOnly) {

        if (!comp.queryMeshes) {
            return false;
        }
        for (var i=0; i<comp.queryMeshes.length; i++) {
            if (comp.queryMeshes[i].__compid === comp.id && (!meshOnly || mesh === comp.queryMeshes[i])) {
                comp.queryMeshes.splice(i, 1);
                return true;
            }
        }
        return false;

    };

    this.withinBox = function (_x1, _y1, _x2, _y2, fn, static) {
        var x1 = this.hashXY(_x1), y1 = this.hashXY(_y1),
            x2 = this.hashXY(_x2), y2 = this.hashXY(_y2);

        var found = {};

        for (var x=x1; x<=x2; x++) {
            for (var y=y1; y<=y2; y++) {
                var key = this.hashKey2(x,y);
                var list = this.hash[key];
                if (list) {
                    for (var i=0; i<list.length; i++) {
                        if (!found[list[i].id] && !list[i].removed) {
                            found[list[i].id] = true;
                            fn(list[i]);
                        }
                    }
                }
            }
        }

        if (static && BSWG.game.map && BSWG.game.map.colInBox(_x1, _y1, _x2, _y2)) {
            fn({
                id: 10000000,
                isStatic: true,
                takeDamage: function() {return 0;},
                combinedHP: function() {return 1000000;}
            });
        }

        found = null;
    };

    this.withinRadius = function (p, r, static) {
        var ret = [];
        this.withinBox(p.x-r, p.y-r, p.x+r, p.y+r, function(C){
            if (C.isStatic) {
                if (static) {
                    ret.push(C);
                }
                return;
            }
            var p2 = C.obj.body.GetWorldCenter();
            var dist = Math.pow(p2.x - p.x, 2.0) +
                       Math.pow(p2.y - p.y, 2.0);
            if (dist < Math.pow(r+C.obj.radius, 2.0)) {
                ret.push(C);
            }
        }, static);
        return ret;
    };

    this.withinRadiusShielded = function (p, r, static) {
        var list = this.withinRadius(p, r, static);
        var shields = [];
        for (var i=0; i<list.length; i++) {
            if (list[i].type === 'shield') {
                shields.push(list[i]);
            }
        }
        shields.sort(function(a, b){
            return b.shieldR - a.shieldR;
        });
        for (var i=0; i<list.length; i++) {
            var obR = Math.max(list[i].shieldR||0, list[i].obj.radius);
            var obArea = Math.PI * obR * obR;
            list[i].__shieldedPercent = Math.clamp(Math.circleIntersectionArea(p, list[i].p(), r, obR) / obArea, 0, 1);
            for (var j=0; j<shields.length; j++) {
                if (list[i] !== shields[j]) {
                    if (list[i].type !== 'shield' || obR < shields[j].shieldR) {
                        var shR = shields[j].shieldR;
                        var percent = Math.clamp(Math.circleIntersectionArea(shields[j].p(), list[i].p(), shR, obR) / obArea, 0, 1);
                        list[i].__shieldedPercent = Math.max(list[i].__shieldedPercent, percent);
                    }
                }
            }
        }
        shields = null;
        return list;
    };

    this.withinRadiusPlayerOnly = function (p, r) {
        if (!BSWG.game.ccblock || !BSWG.game.ccblock.obj || !BSWG.game.ccblock.obj.body) {
            return [];
        }
        /*var ret = [];
        var len = this.playerComps.length;
        for (var i=0; i<len; i++) {
            var C = this.playerComps[i];
            if (C) {
                var p2 = C.obj.body.GetWorldCenter();
                var dist = Math.pow(p2.x - p.x, 2.0) +
                           Math.pow(p2.y - p.y, 2.0);
                if (dist < Math.pow(r+C.obj.radius, 2.0)) {
                    ret.push(C);
                }
            }
        }
        
        return ret;*/
        var C = BSWG.game.ccblock;
        var p2 = C.obj.body.GetWorldCenter();
        var dist = Math.pow(p2.x - p.x, 2.0) +
                   Math.pow(p2.y - p.y, 2.0);
        if (dist < Math.pow(r+C.obj.radius*4.0, 2.0)) {
            return [C];
        }
        return [];
    };

    this.compStrValue = function(str) {
        var tok = str.split(',');
        var type = tok[0];
        var desc = {};
        for (var i=1; i<tok.length; i++) {
            var tok2 = tok[i].split('=');
            desc[tok2[0]] = eval(tok2[1]); // JSON.parse doesn't like strings?
        }
        var value = 0;
        var tdesc = this.typeMap[type];
        var found = false;
        for (var k=0; k<tdesc.sbadd.length && !found; k++) {
            var any = false;
            for (var i=0; tdesc.sbkey && i<tdesc.sbkey.length && !any; i++) {
                var key = tdesc.sbkey[i];
                if (tdesc.sbadd[k][key] !== desc[key]) {
                    any = true;
                }
            }
            if (!any) {
                found = true;
                value = tdesc.sbadd[k].value || 0;
            }
        }
        return value;
    };

    this.compStrTypeArgs = function(str) {
        var tok = str.split(',');
        var type = tok[0];
        var desc = {};
        for (var i=1; i<tok.length; i++) {
            var tok2 = tok[i].split('=');
            desc[tok2[0]] = eval(tok2[1]); // JSON.parse doesn't like strings?
        }
        return [type, desc, this.typeMap[type]];
    };

    this.compStrCount = function(str) {
        var tok = str.split(',');
        var type = tok[0];
        var desc = {};
        for (var i=1; i<tok.length; i++) {
            var tok2 = tok[i].split('=');
            desc[tok2[0]] = eval(tok2[1]); // JSON.parse doesn't like strings?
        }
        var value = 0;
        var tdesc = this.typeMap[type];
        var found = false;
        for (var k=0; k<tdesc.sbadd.length && !found; k++) {
            var any = false;
            for (var i=0; tdesc.sbkey && i<tdesc.sbkey.length && !any; i++) {
                var key = tdesc.sbkey[i];
                if (tdesc.sbadd[k][key] !== desc[key]) {
                    any = true;
                }
            }
            if (!any) {
                found = true;
                value = tdesc.sbadd[k].count || 0;
            }
        }
        return value;
    };

    this.compStrName = function(str) {
        var tok = str.split(',');
        var type = tok[0];
        var desc = {};
        for (var i=1; i<tok.length; i++) {
            var tok2 = tok[i].split('=');
            desc[tok2[0]] = eval(tok2[1]); // JSON.parse doesn't like strings?
        }
        var name = 'Add';
        var tdesc = this.typeMap[type];
        var found = false;
        for (var k=0; k<tdesc.sbadd.length && !found; k++) {
            var any = false;
            for (var i=0; tdesc.sbkey && i<tdesc.sbkey.length && !any; i++) {
                var key = tdesc.sbkey[i];
                if (tdesc.sbadd[k][key] !== desc[key]) {
                    any = true;
                }
            }
            if (!any) {
                found = true;
                name = tdesc.sbadd[k].title || 'Add';
            }
        }
        if (name === 'Add') {
            return tdesc.name;
        }
        else {
            return tdesc.name + ', ' + name;
        }
    };

    this.loadScan = function(obj) {

        var ret = {};

        var comps = obj.list;
        for (var i=0; i<comps.length; i++) {
            var C = comps[i];
            if (C.onCC === null) {
                continue;
            }

            var key = C.type;

            var desc = this.typeMap[C.type];
            if (desc.sbkey) {
                for (var j=0; j<desc.sbkey.length; j++) {
                    var k2 = desc.sbkey[j];
                    if (C.args[k2] || C.args[k2] == false) {
                        key += ',' + k2 + '=' + C.args[k2];
                    }
                }
            }

            ret[key] = (ret[key] || 0) + 1;
        }

        return ret;

    };

    this.autoWelds = null;
    this.load = function(obj, spawn, noArch, archRadCheck, timeCheck, noCheck) {

        var comps = obj.list;
        var cc = null;

        var shipOnly = !!spawn;
        spawn = spawn || {};
        var offset = (spawn.p || new b2Vec2(0, 0)).clone();
        var angle  = spawn.a || 0.0;

        this.autoWelds = this.autoWelds || [];

        if (shipOnly) {
            for (var i=0; i<comps.length; i++) {
                var C = comps[i];
                if (C.type === 'cc') {
                    offset.x -= C.pos.x;
                    offset.y -= C.pos.y;
                    break;
                }
            }
        }

        for (var i=0; i<comps.length; i++) {
            var C = comps[i];
            if (shipOnly && C.onCC === null) {
                continue;
            }
            var pos = new b2Vec2(C.pos.x + offset.x, C.pos.y + offset.y);
            if (archRadCheck) {
                var lst = this.withinRadius(pos, 4, true);
                if (lst && lst.length) {
                    for (var j=0; j<lst.length; j++) {
                        if (lst[j].onCC) {
                            return -1;
                        }
                    }
                }
            }
            else if (!noCheck) {
                if (this.withinRadius(pos, 6, true).length) {
                    return null;
                }               
            }
        }

        for (var i=0; i<comps.length; i++) {
            var C = comps[i];
            if (shipOnly && C.onCC === null) {
                continue;
            }

            var pos = new b2Vec2(C.pos.x + offset.x, C.pos.y + offset.y);

            if (BSWG.game && BSWG.game.map && timeCheck && (BSWG.game.map.mapTime - C.mapTime) > BSWG.orphanTimeLive) {
                var zone = BSWG.game.map.getZone(pos);
                if (!zone || !zone.safe) {
                    continue;
                }
            }

            var args = new Object();
            if (C.args) {
                for (var key in C.args) {
                    args[key] = C.args[key];
                }
            }
            args.pos = pos;
            args.angle = C.angle;
            if (C.type === 'cc') {
                args.leftKey = args.leftKey || BSWG.KEY.LEFT;
                args.rightKey = args.rightKey || BSWG.KEY.RIGHT;
                args.upKey = args.upKey || BSWG.KEY.UP;
                args.downKey = args.downKey || BSWG.KEY.DOWN;
            }
            var OC = new BSWG.component(this.typeMap[C.type], args);
            if (OC.type === 'cc') {
                cc = OC;
            }
            if (C.tag) {
                OC.tag = C.tag;
            }

            var WL = C.welds;
            for (var j=0; j<WL.length; j++) {
                var pos = new b2Vec2(WL[j].pos.x, WL[j].pos.y);
                this.autoWelds.push(BSWG.physics.localToWorld(pos, OC.obj.body));
            }
        }

        for (var i=0; i<this.autoWelds.length; i++) {
            for (var j=i+1; j<this.autoWelds.length; j++) {
                var dist = Math.distVec2(this.autoWelds[i], this.autoWelds[j]);
                if (dist <= Math.sqrt(BSWG.component_jMatchClickRange)) {
                    this.autoWelds.splice(j, 1);
                    j -= 1;
                    continue;
                }
            }
        }

        if (obj.arch && !shipOnly && !noArch) {
            this.archHash = deepcopy(obj.arch);
            this.archObjNextID = obj.archObjNextID || 1;
            if (BSWG.archiveRange !== obj.archiveRange || BSWG.arch_hashSize !== obj.arch_hashSize) {
                console.log('Warning: Archive range and/or archive hash size don\'t match.');
            }

            // Turn duplicate stored objects into references to single object
            var idMap = {};
            for (var key in this.archHash) {
                var L = this.archHash[key];
                if (L && L.length) {
                    for (var i=0; i<L.length; i++) {
                        if (L[i] && L[i].id) {
                            if (!idMap[L[i].id]) {
                                idMap[L[i].id] = L[i];
                            }
                            else {
                                L[i] = idMap[L[i].id];
                            }
                        }
                    }
                }
            }
        }

        return cc;

    };

    // returns JSON
    this.serialize = function(onCC, everything, fromList) {

        var comps = fromList || [];

        if (!fromList) {

            // Filter list
            for (var i=0; i<this.compList.length; i++) {
                var C = this.compList[i];

                if (C.serialize && (everything || C.onCC === onCC)) {
                    comps.push(C);
                }
            }

        }

        var out = [];

        for (var i=0; i<comps.length; i++) {
            var C  = comps[i];
            var OC = new Object();

            var body = C.obj.body;
            var pos = body.GetPosition();
            var angle = body.GetAngle();

            OC.type = C.type;
            OC.id = C.id;
            OC.onCC = C.onCC ? C.onCC.id : null;
            OC.pos = { x: pos.x, y: pos.y };
            OC.angle = angle;
            OC.tag = C.tag ? C.tag : BSWG.generateTag();
            OC.mapTime = (BSWG.game && BSWG.game.map) ? BSWG.game.map.mapTime : 0.0;

            OC.args = new Object();
            for (var j=0; j<C.serialize.length; j++) {
                var key = C.serialize[j];
                OC.args[key] = C[key];
            }

            OC.welds = [];
            if (C.welds) {
                for (var key in C.welds) {
                    var W = C.welds[key];
                    if (W && W.other) {
                        var OW = new Object();
                        OW.other = W.other.id;
                        OW.index = parseInt(key);
                        var jp = C.jpoints[OW.index];
                        OW.pos = { x: jp.x, y: jp.y }; // Local to current component
                        OC.welds.push(OW);
                    }
                }
            }

            out[i] = OC;
        }

        var ret = new Object();
        ret.list = out;

        if (everything) {
            ret.arch = deepcopy(this.archHash);
            ret.archiveRange = BSWG.archiveRange;
            ret.arch_hashSize = BSWG.arch_hashSize;
            ret.archObjNextID = this.archObjNextID;
        }

        return ret;

    };

}();