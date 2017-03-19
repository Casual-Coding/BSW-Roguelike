// BSWR - Command Center component

BSWG.uberFastCC = false;

BSWG.newAI = {};

BSWG.newCCSpecialsObj = function () {
    var ret = {
        all: {

        },
        equipped: [
            null,
            null,
            null,
            null
        ]
    };
    for (var key in BSWG.specialsInfo) {
        ret.all[key] = {
            t: 0.0,
            has: false
        }
    }
    return ret;
}

BSWG.component_CommandCenter = {

    type: 'cc',
    name: 'Command Center',

    maxHP: 100,
    calcMaxEnergy: function() {
        return Math.round(50 + 100 * this.level() / 5) * (this === BSWG.game.ccblock ? 1 : 10);
    },

    sortOrder: 2,

    hasConfig: true,

    noGrab: true,

    energyGain: 1.0,

    serialize: [
        'aiStr',
        'leftKey',
        'rightKey',
        'upKey',
        'downKey',
        'leftKeyAlt',
        'rightKeyAlt',
        'upKeyAlt',
        'downKeyAlt',
        'specials'
    ],

    allKeys: [
        'leftKey',
        'rightKey',
        'upKey',
        'downKey',
        'leftKeyAlt',
        'rightKeyAlt',
        'upKeyAlt',
        'downKeyAlt',
    ],

    frontOffset: -Math.PI/2,

    category: 'block',

    getIconPoly: function (args) {
        var width = 2, height = 3;
        return [
            Math.smoothPoly([
                new b2Vec2(-width * 0.5, -height * 0.5),
                new b2Vec2( width * 0.5, -height * 0.5),
                new b2Vec2( width * 0.5,  height * 0.5),
                new b2Vec2(-width * 0.5,  height * 0.5)
            ], 0.02),
            [
                new b2Vec2(-width * 0.5 * 0.75, -height * 0.5 * 0.0),
                new b2Vec2( width * 0.5 * 0.75, -height * 0.5 * 0.0),
                new b2Vec2( width * 0.3 * 0.75, -height * 0.5 * 0.75),
                new b2Vec2(-width * 0.3 * 0.75, -height * 0.5 * 0.75)
            ].reverse(),
            [
                new b2Vec2(-width * 0.5 * 0.7, height * 0.5 * 0.75),
                new b2Vec2( width * 0.5 * 0.7, height * 0.5 * 0.75),
                new b2Vec2( width * 0.5 * 0.7, height * 0.5 * 0.05),
                new b2Vec2(-width * 0.5 * 0.7, height * 0.5 * 0.05)
            ].reverse()
        ];
    },

    hasSpecial: function(key) {
        return this.specials && this.specials.all && this.specials.all[key] && this.specials.all[key].has;
    },

    specialReady: function(key) {
        if (!this.hasSpecial(key) || !this.specialEquipped(key)) {
            return 0.0;
        }
        return this.specials.all[key].t * this.empDamp;
    },

    canUseSpecial: function(key) {
        if (this.specialReady(key) < 1) {
            return false;
        }
        return this.energy >= BSWG.specialsInfo[key].energy;
    },

    specialEquipped: function(key) {
        if (!key || !this.specials || !this.specials.equipped) {
            return false;
        }
        for (var i=0; i<this.specials.equipped.length; i++) {
            if (this.specials.equipped[i] === key) {
                return true;
            }
        }
        return false;
    },

    setSpecialsAI: function(list) {
        if (!list) {
            return;
        }
        for (var i=0; i<4 && i<list.length; i++) {
            if (list[i]) {
                this.giveSpecial(list[i]);
                this.equipSpecial(list[i], i);
            }
        }
    },

    useSpecialAI: function(key, data) {
        BSWG.useSpecial(key, this, data || {});
    },

    equipSpecial: function(key, row) {
        if (this.hasSpecial(key)) {
            if (row >= 0 && row < this.specials.equipped.length) {
                this.specials.equipped[row] = key;
            }
        }
    },

    equippedSpecialNo: function(i) {
        if (!this.specials || !this.specials.equipped || (!i && i!==0) || !this.specials.equipped[i]) {
            return null;
        }
        return this.specials.equipped[i] || null;
    },

    updateSpecials: function(dt) {
        for (var i=0; i<4; i++) {
            var key = this.equippedSpecialNo(i);
            if (key) {
                var desc = BSWG.specialsInfo[key];
                if (desc && this.specials.all && this.specials.all[key]) {
                    this.specials.all[key].t += dt / 1.5;
                    if (this.specials.all[key].t > 1.0) {
                        this.specials.all[key].t = 1.0;
                    }
                }
            }
        }
    },

    giveSpecial: function(key) {
        if (this.specials && this.specials.all) {
            if (!this.specials.all[key]) {
                this.specials.all[key] = {
                    t: 0.0,
                    has: false                    
                };
            }
            this.specials.all[key].has = true;
            return true;
        }
        else {
            this.specials = BSWG.newCCSpecialsObj();
            return this.giveSpecial(key);
        }
    },

    init: function(args) {

        this.width  = 2;
        this.height = 3;

        this.moveT = 0.0;

        this.anchored = false;

        this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
            width:  this.width,
            height: this.height,
            smooth: 0.02
        });

        this.leftKey = args.leftKey || BSWG.KEY.A;
        this.rightKey = args.rightKey || BSWG.KEY.D;
        this.upKey = args.upKey || BSWG.KEY.W;
        this.downKey = args.downKey || BSWG.KEY.S;
        this.leftKeyAlt = args.leftKeyAlt || this.leftKey;
        this.rightKeyAlt = args.rightKeyAlt || this.rightKey;
        this.upKeyAlt = args.upKeyAlt || this.upKey;
        this.downKeyAlt = args.downKeyAlt || this.downKey;
        this.specials = args.specials || BSWG.newCCSpecialsObj();

        this.maxEnergy = this.calcMaxEnergy();
        this.energy = this.maxEnergy;
        this.lEnergy = this.energy;
        this.energyUse = 0;
        this.energyCritical = false;
        this.eUseArray = [];
        for (var i=0; i<15; i++) {
            this.eUseArray.push(0.0);
        }
        this.eUsePtr = 0;
        this.energyRegen = 0.0;

        // special effects
        for (var i=0; i<this._spkeys.length; i++) {
            var key = this._spkeys[i];
            this[key] = 0;
        }
        //

        this.totalMass = this.obj.body.GetMass();

        this.dispKeys = {
            'left': [ 'Left', new b2Vec2(0.3 * this.width, 0.0) ],
            'right': [ 'Right', new b2Vec2(-0.3 * this.width, 0.0) ],
            'forward': [ 'Up', new b2Vec2(0.0, -this.height * 0.4) ],
            'reverse': [ 'Down', new b2Vec2(0.0, this.height * 0.4) ]
        };

        this.jpoints = BSWG.createBoxJPoints(this.width, this.height);

        //BSWG.blockPolySmooth = 0.02;

        BSWG.bpmReflect = 0.6;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.8);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        BSWG.blockPolySmooth = 0.1;

        var poly = [
            new b2Vec2(-this.width * 0.5 * 0.75, -this.height * 0.5 * 0.0),
            new b2Vec2( this.width * 0.5 * 0.75, -this.height * 0.5 * 0.0),
            new b2Vec2( this.width * 0.3 * 0.75, -this.height * 0.5 * 0.75),
            new b2Vec2(-this.width * 0.3 * 0.75, -this.height * 0.5 * 0.75)
        ].reverse();
        BSWG.bpmReflect = 0.2;
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body, comp: this }, 0.8, new b2Vec2(0, -this.height * 0.5 * 0.75 * 0.5), 0.7);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);
        
        var poly = [
            new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
            new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
            new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.05),
            new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.05)
        ].reverse();

        BSWG.bpmReflect = 0.2;
        this.meshObj3 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body, comp: this }, 0.8, new b2Vec2(0, this.height * 0.5 * 0.8 * 0.5), 0.7);
        BSWG.componentList.makeQueryable(this, this.meshObj3.mesh);

        BSWG.blockPolySmooth = null;

        this.aiStr = args.aiStr || null;

        this.onCC = this;

        this.xpBase = 0.1;
    },

    openConfigMenu: function() {

        if (BSWG.compActiveConfMenu)
            BSWG.compActiveConfMenu.remove();

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var mps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var mp = BSWG.render.unproject3D(mps, 0.0);
        var dp = this.obj.body.GetLocalPoint(mp);

        var dir = null, dirName = null;
        var left = Math.abs(this.width*0.5 - dp.x);
        var right = Math.abs(-this.width*0.5 - dp.x)
        var up = Math.abs(-this.height*0.5 - dp.y);
        var down = Math.abs(this.height*0.5 - dp.y);

        var mv = Math.min(Math.min(Math.min(left, right), up), down);
        if (left <= mv) {
            dir = 'left';
            dirName = 'Rotate Left';
        }
        else if (right <= mv) {
            dir = 'right';
            dirName = 'Rotate Right';
        }
        else if (up <= mv) {
            dir = 'up';
            dirName = 'Forward';
        }
        else if (down <= mv) {
            dir = 'down';
            dirName = 'Reverse';
        }

        if (!dir) {
            return;
        }

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 450, h: 50+32,
            key: this[dir + 'Key'],
            altKey: this[dir + 'KeyAlt'],
            title: 'CC Impulse ' + dirName,
            close: function (key, alt) {
                if (key) {
                    if (alt) {
                        self[dir + 'KeyAlt'] = key;
                    }
                    else {
                        if (self[dir + 'Key'] === self[dir + 'KeyAlt']) {
                            self[dir + 'KeyAlt'] = key;
                        }
                        self[dir + 'Key'] = key;
                    }
                }
            }
        });

    },

    closeConfigMenu: function() {

    },

    destroy: function() {

        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }
        this.meshObj.destroy();
        this.selMeshObj.destroy();
        this.meshObj2.destroy();
        this.meshObj3.destroy();

    },

    render: function(ctx, cam, dt) {

        if (this.moveT >= 0) {
            this.moveT -= dt;
        }
        else {
            this.moveT = 0.0;
        }

        if (this.grabT >= 0) {
            this.grabT -= dt;
        }
        else {
            this.grabT = 0.0;
        }

        this.meshObj.update([0.85, 0.85, 0.85, 1], null, BSWG.compAnchored(this));
        var l = (this.grabT/0.3) * 0.25 + 0.5;
        this.meshObj3.update([l, l, 0.68, 1], 3.0, BSWG.compAnchored(this));
        var l = (this.moveT/0.3) * 0.25 + 0.35;
        this.meshObj2.update([l, 0.8, 0.9, 1], 3.0, BSWG.compAnchored(this));

        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

        if (this.usedSpecial && this.usedSpecialT > 0 && this.obj && this.obj.body) {
            var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());
            ctx.globalAlpha = Math.clamp(this.usedSpecialT*2.0, 0, 1);
            BSWG.renderSpecialIcon(ctx, this.usedSpecial, p.x, p.y, BSWG.render.viewport.h * 0.05, 0.0, null, true);
            ctx.globalAlpha = 1.0;
            this.usedSpecialT -= dt;
            p = null;
        }
        else {
            this.usedSpecial = this.usedSpecialT = this.usedSpecialClr = this.usedSpecialName = null;
        }
    },

    warpOut: function(slow) {

        /*if (slow && BSWG.game.ccblock && !(BSWG.game.ccblock.destroyed)) {
            if (!this.escapeFrom) {
                this.escapeFrom = BSWG.game.ccblock.obj.body.GetWorldCenter().clone();
                this.escapeT = 0.0;
            }
            return;
        }*/

        var len = BSWG.componentList.compList.length;
        for (var i=0; i<len; i++) {
            var C = BSWG.componentList.compList[i];
            if (C && ((C.onCC && C.onCC.id === this.id) || (C.id === this.id))) {
                C.takeDamage(1000000, null, true, true);
            }
        }
    },

    setVelAll: function(v) {
        var len = BSWG.componentList.compList.length;
        for (var i=0; i<len; i++) {
            var C = BSWG.componentList.compList[i];
            if (C && ((C.onCC && C.onCC.id === this.id) || (C.id === this.id))) {
                if (C.obj && C.obj.body) {
                    C.obj.body.SetLinearVelocity(v.clone());
                }
            }
        }        
    },

    _spkeys: [ 'fury', 'overpowered', 'defenseScreen', 'speed', 'lightweight', 'massive', 'massive2', 'spinUp', 'doublePunch' ],

    useEnergy: function(amt) {
        if (amt > 0) {
            if (this.energy >= amt) {
                this.energy -= amt;
                return true;
            }
            else {
                return false;
            }
        }
        else {
            this.energy -= amt;
            if (this.energy > this.maxEnergy) {
                this.energy = this.maxEnergy;
            }
            return true;
        }
    },

    update: function(dt) {

        if (BSWG.game.battleMode && BSWG.game.scene === BSWG.SCENE_GAME2 && self !== BSWG.game.ccblock) {
            this.enemyLevel = BSWG.ai.aiTestLevel;
        }

        this.maxEnergy = this.calcMaxEnergy();
        if (this.maxEnergy > this.lMaxEnergy) {
            this.energy = Math.clamp(this.energy + (this.maxEnergy - this.lMaxEnergy), 0, this.maxEnergy);
        }
        this.lMaxEnergy = this.maxEnergy;

        this.useEnergy(-this.energyRegen * dt);
        var energyUse = this.energy - this.lEnergy;
        this.lEnergy = this.energy;
        this.eUseArray[this.eUsePtr] = energyUse;
        this.eUsePtr = (this.eUsePtr + 1) % this.eUseArray.length;
        this.energyUse = 0.0;
        for (var i=0; i<this.eUseArray.length; i++) {
            this.energyUse += this.eUseArray[i];
        }
        this.energyUse /= this.eUseArray.length;
        this.energyUse /= dt;
        this.energyCritical = (this.energy / this.maxEnergy) < 0.2;

        for (var i=0; i<this._spkeys.length; i++) {
            var key = this._spkeys[i];
            if (this[key]) {
                this[key] = Math.max(0, this[key] - dt);
            }
            else {
                this[key] = 0;
            }
        }

        if (!this.sound) {
            this.sound = new BSWG.soundSample();
            this.sound.play('thruster', this.obj.body.GetWorldCenter().THREE(0.2), 0.2, 0.1, true);
        }

        this.dispKeys['left'][2] = BSWG.input.KEY_DOWN(this.leftKey) || BSWG.input.KEY_DOWN(this.leftKeyAlt);
        this.dispKeys['right'][2] = BSWG.input.KEY_DOWN(this.rightKey) || BSWG.input.KEY_DOWN(this.rightKeyAlt);
        this.dispKeys['forward'][2] = BSWG.input.KEY_DOWN(this.upKey) || BSWG.input.KEY_DOWN(this.upKeyAlt);
        this.dispKeys['reverse'][2] = BSWG.input.KEY_DOWN(this.downKey) || BSWG.input.KEY_DOWN(this.downKeyAlt);

        this.dispKeys['left'][0] = BSWG.KEY_NAMES[this.leftKey].toTitleCase();
        if (this.leftKeyAlt !== this.leftKey) {
            this.dispKeys['left'][0] += ' / ' + BSWG.KEY_NAMES[this.leftKeyAlt].toTitleCase();
        }
        this.dispKeys['right'][0] = BSWG.KEY_NAMES[this.rightKey].toTitleCase();
        if (this.rightKeyAlt !== this.rightKey) {
            this.dispKeys['right'][0] += ' / ' + BSWG.KEY_NAMES[this.rightKeyAlt].toTitleCase();
        }
        this.dispKeys['forward'][0] = BSWG.KEY_NAMES[this.upKey].toTitleCase();
        if (this.upKeyAlt !== this.upKey) {
            this.dispKeys['forward'][0] += ' / ' + BSWG.KEY_NAMES[this.upKeyAlt].toTitleCase();
        }
        this.dispKeys['reverse'][0] = BSWG.KEY_NAMES[this.downKey].toTitleCase();
        if (this.downKeyAlt !== this.downKey) {
            this.dispKeys['reverse'][0] += ' / ' + BSWG.KEY_NAMES[this.downKeyAlt].toTitleCase();
        }

        if (BSWG.game.saveHealAdded) {
            this.energy = Math.clamp(this.energy + (this.maxEnergy/10)*dt, 0, this.maxEnergy);
        }

        /*if (this.escapeFrom) {
            this.escapeT += dt;
            var v = this.obj.body.GetWorldCenter().clone();
            v.x -= this.escapeFrom.x;
            v.y -= this.escapeFrom.y;
            var vlen = Math.sqrt(v.x*v.x+v.y*v.y);
            v.x /= vlen;
            v.y /= vlen;
            v.x *= this.escapeT * 10.0;
            v.y *= this.escapeT * 10.0;

            var len = BSWG.componentList.compList.length;
            for (var i=0; i<len; i++) {
                var C = BSWG.componentList.compList[i];
                if (C && ((C.onCC && C.onCC.id === this.id) || (C.id === this.id))) {
                    C.obj.body.SetLinearVelocity(v.clone());
                }
            }
        }*/

        this.sound.position(this.obj.body.GetWorldCenter().THREE(0.2));

        this.updateSpecials(dt);

    },

    updateAI: function(dt) {

        if (this.aiLoadNetwork) {
            this.aiNN = new BSWG.neuralAI(this.aiLoadNetwork.shipBlocks, this.aiLoadNetwork.networkJSON);
            this.aiLoadNetwork = null;
        }

        var patrolOnly = BSWG.game.scene !== BSWG.SCENE_TITLE && (!BSWG.game.ccblock || !BSWG.game.ccblock.obj || !BSWG.game.ccblock.obj.body || BSWG.game.ccblock.destroyed);

        if (this === BSWG.game.ccblock && BSWG.game.battleMode && BSWG.game.bossFight) {
            if (!this.bossDialogFired) {
                if (BSWG.game.inZone.boss.dialog) {
                    BSWG.game.linearDialog(BSWG.game.inZone.boss.dialog, true);
                }
            }
            this.bossDialogFired = true;
        }
        else {
            this.bossDialogFired = false;
        }

        if (BSWG.game.dialogPause) {
            return {};
        }

        if (this.aiNN && !this.aiPaused) {

            this.aiNN.update(dt, 0.0, 0.0); // dt, pain, pleasure

            var keys = new Object();
            this.aiNN.getKeys(keys);
            return keys;

        }

        return null;

    },

    handleInput: function(keys) {

        var rot = 0;
        var accel = 0;

        if (keys[this.leftKey] || keys[this.leftKeyAlt]) rot -= 1;
        if (keys[this.rightKey] || keys[this.rightKeyAlt]) rot += 1;

        if (keys[this.upKey] || keys[this.upKeyAlt]) accel -= 1;
        if (keys[this.downKey] || keys[this.downKeyAlt]) accel += 1;

        if (BSWG.uberFastCC) {
            rot *= 2.0;
            accel *= 10.0;
        }
        else {
            accel *= 2.5;
            rot *= 1.5;
        }

        accel *= this.empDamp;
        rot *= this.empDamp;

        if (this.sound) {
            this.sound.volume(0.2 * (Math.abs(rot) + Math.abs(accel)) * (this.speed ? 1.5 : 1));
            this.sound.rate(0.1 + Math.clamp(this.speed, 0, 1) * 0.5);
        }

        if (rot) {
            this.obj.body.SetAwake(true);
            this.obj.body.ApplyTorque(-rot*7.0*(this.speed ? 1.5 : 1));
            this.moveT = 0.21;
        }
        
        if (accel) {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= 5.0 * (this.speed ? 1.5 : 1);
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);
            this.moveT = 0.21;
        }

    },

    removeAI: function () {

        this.aiLoadNetwork = null;
        if (this.aiNN) {
            this.aiNN.destroy();
            this.aiNN = null;
        }
        this.aiPaused = true;

    },

    reloadAI: function (aiLoadNetwork, paused) {

        this.removeAI();
        this.aiLoadNetwork = aiLoadNetwork;
        if (!aiLoadNetwork) {
            this.aiLoadNetwork = {
                shipBlocks: BSWG.componentList.shipBlocks(this),
                networkJSON: null
            }
        }
        else {
            this.aiLoadNetwork.shipBlocks = BSWG.componentList.shipBlocks(this);
        }
        this.aiPaused = !!paused;
        return true;

    }

};