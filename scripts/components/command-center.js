// BSWR - Command Center component

BSWG.uberFastCC = false;

BSWG.newAI = {};

BSWG.component_CommandCenter = {

    type: 'cc',
    name: 'Command Center',

    maxHP: 100,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'aiStr',
        'leftKey',
        'rightKey',
        'upKey',
        'downKey',
        'leftKeyAlt',
        'rightKeyAlt',
        'upKeyAlt',
        'downKeyAlt'
    ],

    frontOffset: -Math.PI/2,

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

    level: function() {
        if (BSWG.game.ccblock && this.id === BSWG.game.ccblock.id) {
            if (BSWG.game.xpInfo) {
                return BSWG.game.xpInfo.level;
            }
            else {
                return 0;
            }
        }
        else {
            return this.enemyLevel || 0;
        }
    },

    buff: function() {
        if (BSWG.game.ccblock && this.id === BSWG.game.ccblock.id) {
            if (BSWG.game.xpInfo) {
                return BSWG.game.xpInfo.buff();
            }
            else {
                return 0;
            }
        }
        else {
            var eli = BSWG.enemyLevelInfo[this.enemyLevel || 0];
            if (eli) {
                return eli.buff || 0;
            }
            else {
                return 0;
            }
        }
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

    update: function(dt) {

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

    },

    aiPause: function(time) {

        if (this.ai) {
            if (!this.aiCmdBfr) {
                this.aiCmdBfr = new Array();
            }
            this.aiCmdBfr.push({
                type: 'pause',
                t: time
            });
        }

    },

    aiHold: function(time) {

        if (this.ai) {
            if (!this.aiCmdBfr) {
                this.aiCmdBfr = new Array();
            }
            this.aiCmdBfr.push({
                type: 'hold',
                t: time
            });
        }

    },

    aiSub: function(time, fn) {

        if (this.ai) {
            if (!this.aiCmdBfr) {
                this.aiCmdBfr = new Array();
            }
            this.aiCmdBfr.push({
                type: 'sub',
                fn: fn,
                t: time,
                t0: 0.0
            });
        }

    },

    updateAI: function(dt) {

        if (this.aiLoadID) {

            try {
                this.ai = BSWG.newAI[this.aiLoadID];
                if (this.ai) {
                    try {
                        BSWG.newAI[this.aiLoadID] = null;
                        delete BSWG.newAI[this.aiLoadID];
                        this.aiLoadID = null;
                        var head = document.getElementsByTagName("head")[0];
                        head.removeChild(this.aiScriptTag);
                        this.aiScriptTag = null;
                    } catch (e) { }
                    BSWG.applyAIHelperFunctions(this.ai, this);
                    this.ai.init(this);
                }
            } catch (e) {
                BSWG.ai.logError("Error initializing AI script:");
                BSWG.ai.logError(e.stack);
                this.ai = null;
                this.aiPaused = true;
                try {
                    BSWG.newAI[this.aiLoadID] = null;
                    delete BSWG.newAI[this.aiLoadID];
                    this.aiLoadID = null;
                    var head = document.getElementsByTagName("head")[0];
                    head.removeChild(this.aiScriptTag);
                    this.aiScriptTag = null;
                } catch (e) { }
                return null;
            }

        }

        if (BSWG.game.scene !== BSWG.SCENE_TITLE && (!BSWG.game.ccblock || !BSWG.game.ccblock.obj || !BSWG.game.ccblock.obj.body)) {
            return {};
        }

        if (this.ai && !this.aiPaused) {

            var cmd = this.aiCmdBfr ? this.aiCmdBfr[0] : null;
            if (cmd && cmd.t) {
                cmd.t -= dt;
                if (typeof cmd.t0 === 'number') {
                    cmd.t0 += dt;
                }
                if (!(cmd.t > 0)) {
                    this.aiCmdBfr.splice(0, 1);
                    cmd = this.aiCmdBfr ? this.aiCmdBfr[0] : null;
                }
            }

            var keys = new Object();
            if (BSWG.game.scene === BSWG.SCENE_GAME2) {
                try {
                    if (cmd && cmd.type === 'hold') {
                        for (var k in this.aiLastKeys) {
                            keys[k] = this.aiLastKeys[k];
                        }
                    }
                    else if (cmd && cmd.type === 'pause') {
                        // keys should be empty
                    }
                    else if (cmd && cmd.type === 'sub') {
                        if (cmd.fn(dt, keys, cmd.t0)) {
                            cmd.t = 0;
                        }
                    }
                    else {
                        this.ai.update(dt, keys);
                        this.aiLastKeys = keys;
                    }
                    return keys;
                } catch (e) {
                    BSWG.ai.logError("Error in AI script frame update:");
                    BSWG.ai.logError(e.stack);
                    this.aiPaused = true;
                    return null;
                }
            }
            else {
                if (cmd && cmd.type === 'hold') {
                    for (var k in this.aiLastKeys) {
                        keys[k] = this.aiLastKeys[k];
                    }
                }
                else if (cmd && cmd.type === 'pause') {
                    // keys should be empty
                }
                else if (cmd && cmd.type === 'sub') {
                    if (cmd.fn(dt, keys, cmd.t0)) {
                        cmd.t = 0;
                    }
                }
                else {
                    this.ai.update(dt, keys);
                    this.aiLastKeys = keys;
                }
                return keys;                
            }

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

        if (this.sound) {
            this.sound.volume(0.2 * (Math.abs(rot) + Math.abs(accel)));
        }

        if (rot) {
            this.obj.body.SetAwake(true);
            this.obj.body.ApplyTorque(-rot*7.0);
            this.moveT = 0.21;
        }
        
        if (accel) {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= 5.0;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);
            this.moveT = 0.21;
        }

    },

    removeAI: function () {

        if (this.aiScriptTag) {
            var head = document.getElementsByTagName("head")[0];
            head.removeChild(this.aiScriptTag);
            this.aiScriptTag = null;
        }

        this.aiLoadID = null;
        this.ai = null;
        this.aiPaused = true;
        this.aiCmdBfr = null;

    },

    reloadAI: function (paused) {

        if (this.aiScriptTag) {
            var head = document.getElementsByTagName("head")[0];
            head.removeChild(this.aiScriptTag);
            this.aiScriptTag = null;
        }

        this.aiLoadID = null;
        this.aiCmdBfr = null;

        if (!this.aiStr) {
            BSWG.ai.logError("No AI code set for this ship.");
            this.ai = null;
            return false;
        }

        this.ai = null;

        var ai = null;

        var head = document.getElementsByTagName("head")[0],
            script = document.createElement("script");

        head.insertBefore(script, head.lastChild);
        this.aiScriptTag = script;

        // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        this.aiLoadID = guid();

        BSWG.newAI[this.aiLoadID] = null;

        script.src = "data:text/javascript;base64," + btoa(
            "try { BSWG.newAI[\"" + this.aiLoadID + "\"] = " + this.aiStr + "; } catch (e) { BSWG.ai.logError('Error parsing AI script:'); BSWG.ai.logError(e.stack); }"
        );

        this.aiPaused = !!paused;

        return true;

    }

};