// BSWR - Command Center component

BSWG.uberFastCC = false;

BSWG.newAI = {};

BSWG.component_CommandCenter = {

    type: 'cc',
    name: 'Command Center',

    maxHP: 100,

    sortOrder: 2,

    hasConfig: false,

    serialize: [
        'aiStr'
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

        this.dispKeys = {
            'left': [ 'Left', new b2Vec2(-0.3 * this.width, 0.0) ],
            'right': [ 'Right', new b2Vec2(0.3 * this.width, 0.0) ],
            'forward': [ 'Up', new b2Vec2(0.0, -this.height * 0.4) ],
            'reverse': [ 'Down', new b2Vec2(0.0, this.height * 0.4) ]
        };

        this.jpoints = BSWG.createBoxJPoints(this.width, this.height);

        //BSWG.blockPolySmooth = 0.02;

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
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body, comp: this }, 0.8, new b2Vec2(0, -this.height * 0.5 * 0.75 * 0.5), 0.7);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);
        
        var poly = [
            new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
            new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
            new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.05),
            new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.05)
        ].reverse();

        this.meshObj3 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body, comp: this }, 0.8, new b2Vec2(0, this.height * 0.5 * 0.8 * 0.5), 0.7);
        BSWG.componentList.makeQueryable(this, this.meshObj3.mesh);

        BSWG.blockPolySmooth = null;

        this.aiStr = args.aiStr || null;
    },

    destroy: function() {

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

        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
    },

    warpOut: function() {
        var len = BSWG.componentList.compList.length;
        for (var i=0; i<len; i++) {
            var C = BSWG.componentList.compList[i];
            if (C && ((C.onCC && C.onCC.id === this.id) || (C.id === this.id))) {
                C.onCC = null;
                C.hp = 0;
                C.destroyed = true;
                C.removeSafe();
            }
        }
    },

    update: function(dt) {

        this.dispKeys['left'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.LEFT);
        this.dispKeys['right'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.RIGHT);
        this.dispKeys['forward'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.UP);
        this.dispKeys['reverse'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.DOWN);

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
                    // <- define helper functions here
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

        return null;

    },

    handleInput: function(keys) {

        var rot = 0;
        var accel = 0;

        if (keys[BSWG.KEY.LEFT]) rot -= 1;
        if (keys[BSWG.KEY.RIGHT]) rot += 1;

        if (keys[BSWG.KEY.UP]) accel -= 1;
        if (keys[BSWG.KEY.DOWN]) accel += 1;

        if (BSWG.uberFastCC) {
            rot *= 2.0;
            accel *= 10.0;
        }
        else {
            accel *= 2.5;
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