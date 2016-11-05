BSWG.specialList = new (function(){

    this.contList = [];
    this.effectList = [];

    this.updateRender = function(ctx, dt) {

        for (var i=0; i<this.contList.length; i++) {
            if (this.contList[i])
            this.contList[i].updateRender(ctx, dt);
        }
        for (var i=0; i<this.effectList.length; i++) {
            this.effectList[i].updateRender(ctx, dt);
        }

    };

    this.curCont = function () {
        if (this.contList && this.contList[0]) {
            return this.contList[0].key;
        }
        return null;
    };

    this.typeMapC = {};
    this.typeMapE = {};

    this.init = function () {

        while (this.contList.length) {
            this.contList[0].destroy();
        }
        while (this.effectList.length) {
            this.effectList[0].destroy();
        }

        this.typeMapC = {};
        this.typeMapE = {};

        //this.typeMapC['key'] = BSWG.specialControl_Desc1
        //this.typeMapC['key'] = BSWG.specialControl_Desc2
        // ...

        //this.typeMapE['key'] = BSWG.specialEffect_Desc1
        //this.typeMapE['key'] = BSWG.specialEffect_Desc2
        // ...

        BSWG.specialsDefaultPoly = [
            [
                new b2Vec2(-.3, .3),
                new b2Vec2(-.3, -.3),
                new b2Vec2(.3, -.3),
                new b2Vec2(.3, .3)
            ]
        ];

        var makeTorpedoIcon = function(x,y,sz,a2,ripple,np,tail,a3,tail2) {
            np = np || 24;
            ripple = ripple || false;
            tail = tail || 1.5;
            tail2 = tail2 || 1.5;
            var poly = [];
            for (var i=0; i<np; i++) {
                var a = i/np * Math.PI * 2.0;
                var tr = 0.65;
                if (ripple && (i%2)) {
                    tr *= 0.75;
                }
                var p = new b2Vec2(Math.cos(a)*sz*tr, Math.sin(a)*sz*tr);
                if (a2 !== undefined) {
                    var t = Math.clamp(Math.abs(Math.angleDist(a, a2)) / (Math.PI/4), 0, 1);
                    t = Math.pow(t, 0.9);
                    if (t < 1) {
                        p.x = p.x * t + Math.cos(a2) * sz * tail * (1-t);
                        p.y = p.y * t + Math.sin(a2) * sz * tail * (1-t);
                    }
                }
                if (a3 !== undefined) {
                    var t = Math.clamp(Math.abs(Math.angleDist(a, a3)) / (Math.PI/4), 0, 1);
                    t = Math.pow(t, 0.9);
                    if (t < 1) {
                        p.x = p.x * t + Math.cos(a3) * sz * tail2 * (1-t);
                        p.y = p.y * t + Math.sin(a3) * sz * tail2 * (1-t);
                    }   
                }
                p.x += x;
                p.y += y;
                poly.push(p);
            }
            return poly;
        }

        var scalePolys = function(poly, sc) {
            for (var i=0; i<poly.length; i++) {
                if (poly[i] instanceof b2Vec2) {
                    poly[i].x *= sc;
                    poly[i].y *= sc;
                }
                else {
                    scalePolys(poly[i], sc);
                }
            }
            return poly;
        };

        BSWG.specialsInfo = {

            // defend
            'heal': {
                name: 'Repair',
                controller: BSWG.specialCont_circleRange,
                effect: BSWG.specialEffect_heal,
                color: new THREE.Vector4(0, 1, 0, 0.75),
                minRadius: 5,
                maxRadius: 5,
                cooldown: 20.0, // seconds
                energy: 20,
                polys: [
                    [
                        new b2Vec2(-.3, .15/2),
                        new b2Vec2(-.3, -.15/2),
                        new b2Vec2(-.15/2, -.15/2),
                        new b2Vec2(-.15/2, -.3),
                        new b2Vec2(.15/2, -.3),
                        new b2Vec2(.15/2, -.15/2),
                        new b2Vec2(.3, -.15/2),
                        new b2Vec2(.3, .15/2),
                        new b2Vec2(.15/2, .15/2),
                        new b2Vec2(.15/2, .3),
                        new b2Vec2(-.15/2, .3),
                        new b2Vec2(-.15/2, .15/2)
                    ]
                ],
                iconScale: 0.75
            },
            'defense-screen': {
                name: 'Defense Screen',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_defenseScreen,
                color: new THREE.Vector4(0, .3, 1, 0.75),
                cooldown: 25.0, // seconds
                polys: [
                    Math.smoothPoly(Math.rotPoly(makeTorpedoIcon(.095, 0, .4, Math.PI, false, 6, 1.25), -Math.PI/2), 0.1)
                ],
                iconScale: 0.75,
                energy: 25
            },
            'emp-defend': {
                name: 'EMP Pulse',
                controller: BSWG.specialCont_targetShip,
                color: new THREE.Vector4(.3, 0, 1, 0.75),
                cooldown: 30.0, // seconds
                polys: [
                    makeTorpedoIcon(0, 0, .5, undefined, true, 40)
                ],
                iconScale: 0.75,
                energy: 50,
            },
            'shockwave': {
                name: 'Shockwave',
                controller: BSWG.specialCont_targetShip,
                color: new THREE.Vector4(1, 1, 0, 0.75),
                cooldown: 30.0, // seconds
                polys: (function(){
                    var polys = [];
                    for (var i=0; i<5; i++) {
                        var a1 = (i+0.25)/5 * Math.PI*2;
                        var a2 = (i+1-0.25)/5 * Math.PI*2;
                        var ac = (a1+a2)*0.5;
                        var poly = [
                            new b2Vec2(Math.cos(ac)*.4, Math.sin(ac)*.4),
                            new b2Vec2(Math.cos(a1)*.3, Math.sin(a1)*.3),
                            new b2Vec2(Math.cos(a2)*.3, Math.sin(a2)*.3)
                        ];
                        polys.push(poly);
                    }
                    polys.push(makeTorpedoIcon(0, 0, .15, undefined, false, 12));
                    return polys;
                })(),
                iconScale: 0.75,
                energy: 50,
            },
            'singularity': {
                name: 'Singularity',
                controller: BSWG.specialCont_circleRange,
                minRadius: 6.5,
                maxRadius: 6.5,
                color: new THREE.Vector4(.0, .0, .0, 0.75),
                cooldown: 30.0, // seconds
                polys: [
                    makeTorpedoIcon(0, 0, .5, undefined, false, 40)
                ],
                iconScale: 0.75,
                energy: 80,
            },

            // attack
            'fury': {
                name: 'Fury',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_fury,
                color: new THREE.Vector4(1, 0, 0, 0.75),
                cooldown: 25.0, // seconds
                polys: (function(){
                    var polys = [];
                    for (var i=0; i<2; i++) {
                        var poly = [
                            new b2Vec2(0, -.15 - i*.3 + .125),
                            new b2Vec2(-.3, .1 - i*.3 + .125),
                            new b2Vec2(0, 0 - i*.3 + .125),
                            new b2Vec2(.3, .1 - i*.3 + .125)
                        ];
                        polys.push(poly)
                    }
                    return polys;
                })(),
                iconScale: 0.75,
                energy: 15,
            },
            'torpedo': {
                name: 'Torpedo',
                controller: BSWG.specialCont_circleRange,
                minRadius: 3,
                maxRadius: 3,
                color: new THREE.Vector4(1, .5, 0, 0.75),
                cooldown: 30.0, // seconds
                polys: [
                    makeTorpedoIcon(0, 0, .35, Math.PI/2.5)
                ],
                iconScale: 0.75,
                energy: 35,
            },
            'emp-attack': {
                name: 'EMP Torpedo',
                controller: BSWG.specialCont_circleRange,
                minRadius: 3,
                maxRadius: 3,
                color: new THREE.Vector4(.5, .25, 1, 0.75),
                cooldown: 30.0, // seconds
                polys: [
                    makeTorpedoIcon(0, 0, .35, Math.PI/2.5, true, 32)
                ],
                iconScale: 0.75,
                energy: 35,
            },
            'over-power': {
                name: 'Over Powered',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_overpowered,
                color: new THREE.Vector4(1, 0, 0, 0.75),
                cooldown: 25.0, // seconds
                polys: (function(){
                    var polys = [];
                    for (var i=0; i<3; i++) {
                        var poly = [
                            new b2Vec2(0, -.15 - i*.3 + .3),
                            new b2Vec2(-.3, .1 - i*.3 + .3),
                            new b2Vec2(0, 0 - i*.3 + .3),
                            new b2Vec2(.3, .1 - i*.3 + .3)
                        ];
                        polys.push(poly)
                    }
                    return scalePolys(polys, 0.8);
                })(),
                iconScale: 0.75,
                energy: 40,
            },
            'torpedo-spread': {
                name: 'Torpedo Spread',
                controller: BSWG.specialCont_circleRange,
                minRadius: 6,
                maxRadius: 6,
                color: new THREE.Vector4(1, .5, 0, 0.75),
                cooldown: 40.0, // seconds
                polys: [
                    makeTorpedoIcon(0, -.25, .25, Math.PI/2.5, false, 16),
                    makeTorpedoIcon(-.25, 0, .25, Math.PI/2.5, false, 16),
                    makeTorpedoIcon(.25, 0, .25, Math.PI/2.5, false, 16)
                ],
                iconScale: 0.75,
                energy: 60,
            },

            // mele
            'massive': {
                name: 'Massive',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_massive,
                color: new THREE.Vector4(.5, .5, .5, 0.75),
                cooldown: 12.0, // seconds
                polys: (function(){
                    var polys = [];
                    polys.push([
                        new b2Vec2(-.175, -.2),
                        new b2Vec2(-.25, .2),
                        new b2Vec2(.25, .2),
                        new b2Vec2(.175, -.2)
                    ]);
                    polys.push(makeTorpedoIcon(0, -.25, .1, undefined, false, 8));
                    return scalePolys(polys, 0.85);
                })(),
                iconScale: 0.75,
                energy: 15,
            },
            'spin-up': {
                name: 'Spin Up',
                controller: BSWG.specialCont_targetShip,
                color: new THREE.Vector4(.75, .75, .75, 0.75),
                cooldown: 18.0, // seconds
                polys: (function(){
                    var polys = [];
                    for (var i=0; i<8; i++) {
                        var a1 = (i+0.25)/8 * Math.PI*2;
                        var a2 = (i+1-0.25)/8 * Math.PI*2;
                        var ac = (a1+a2)*0.5;
                        var poly = [
                            new b2Vec2(Math.cos(ac)*.35, Math.sin(ac)*.35),
                            new b2Vec2(Math.cos(a1)*.3, Math.sin(a1)*.3),
                            new b2Vec2(Math.cos(a2)*.3, Math.sin(a2)*.3)
                        ];
                        polys.push(poly);
                    }
                    polys.push(makeTorpedoIcon(0, 0, .35, undefined, false, 12));
                    return polys;
                })(),
                iconScale: 0.7,
                energy: 20,
            },
            'double-mele': {
                name: 'Double Punch',
                controller: BSWG.specialCont_targetShip,
                color: new THREE.Vector4(1, .25, .125, 0.75),
                cooldown: 22.0, // seconds
                polys: (function(){
                    var polys = [];
                    for (var i=0; i<2; i++) {
                        var poly = [
                            new b2Vec2(-.1, -.30),
                            new b2Vec2(-.1, -.25),
                            new b2Vec2(-.05,-.25),
                            new b2Vec2(-.05, .25),
                            new b2Vec2(-.1,  .25),
                            new b2Vec2(-.1,  .30),
                            new b2Vec2( .1,  .30),
                            new b2Vec2( .1,  .25),
                            new b2Vec2( .05, .25),
                            new b2Vec2( .05,-.25),
                            new b2Vec2( .1, -.25),
                            new b2Vec2( .1, -.30)
                        ];
                        polys.push(Math.translatePoly(poly, -.225/2 + i*.25, 0));
                    }
                    return polys;
                })(),
                iconScale: 0.75,
                energy: 40,
            },
            'massive2': {
                name: 'Massive II',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_massive2,
                color: new THREE.Vector4(.5, .5, .5, 0.75),
                cooldown: 12.0, // seconds
                polys: (function(){
                    var polys = [];
                    polys.push([
                        new b2Vec2(-.175, -.2),
                        new b2Vec2(-.25, .2),
                        new b2Vec2(.25, .2),
                        new b2Vec2(.175, -.2)
                    ]);
                    polys.push(makeTorpedoIcon(0, -.25, .1, undefined, false, 12));
                    return scalePolys(polys, 1.25);
                })(),
                iconScale: 0.75,
                energy: 25,
            },

            // speed
            'speed': {
                name: 'Boost',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_speed,
                color: new THREE.Vector4(0, 1, .1, 0.75),
                cooldown: 20.0, // seconds
                polys: (function(){
                    var polys = [];
                    for (var i=0; i<2; i++) {
                        var poly = [
                            new b2Vec2(0, -.15 - i*.3 + .125),
                            new b2Vec2(-.3, .1 - i*.3 + .125),
                            new b2Vec2(0, 0 - i*.3 + .125),
                            new b2Vec2(.3, .1 - i*.3 + .125)
                        ];
                        polys.push(poly)
                    }
                    return polys;
                })(),
                iconScale: 0.75,
                energy: 15,
            },
            'light-weight': {
                name: 'Light Weight',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_lightweight,
                color: new THREE.Vector4(.2, .75, .75, 0.75),
                cooldown: 30.0, // seconds
                polys: [
                    Math.rotPoly(Math.scalePoly(makeTorpedoIcon(0, 0, .25, Math.PI, false, 16, 1.25, 0, 0.85), 1.25, 0.75), -Math.PI/3.5)
                ],
                iconScale: 0.75,
                energy: 10,
            },
            'speed2': {
                name: 'Boost II',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_speed2,
                color: new THREE.Vector4(0, 1, .1, 0.75),
                cooldown: 30.0, // seconds
                polys: (function(){
                    var polys = [];
                    for (var i=0; i<3; i++) {
                        var poly = [
                            new b2Vec2(0, -.15 - i*.3 + .3),
                            new b2Vec2(-.3, .1 - i*.3 + .3),
                            new b2Vec2(0, 0 - i*.3 + .3),
                            new b2Vec2(.3, .1 - i*.3 + .3)
                        ];
                        polys.push(poly)
                    }
                    return scalePolys(polys, 0.8);
                })(),
                iconScale: 0.75,
                energy: 25,
            },
            'feather-weight': {
                name: 'Feather Weight',
                controller: BSWG.specialCont_targetShip,
                effect: BSWG.specialEffect_lightweight2,
                color: new THREE.Vector4(.2, .75, .75, 0.75),
                cooldown: 40.0, // seconds
                polys: [
                    Math.translatePoly(Math.rotPoly(Math.scalePoly(makeTorpedoIcon(0, 0, .25, Math.PI, false, 16, 1.25, 0, 0.85), 1.25, 0.75), -Math.PI/3.5), -.1, -.05),
                    Math.translatePoly(Math.rotPoly(Math.scalePoly(makeTorpedoIcon(0, 0, .25, Math.PI, false, 16, 1.25, 0, 0.85), 1.25, 0.75), -Math.PI/3.5), .1, .05)
                ],
                iconScale: 0.75,
                energy: 15,
            }
        };

    };

    this.getCDesc = function(key) {
        return this.typeMapC[key] || null;
    };

    this.getEDesc = function(key) {
        return this.typeMapE[key] || null;
    };

    this.getControl = function(key, args) {
        if (!args) {
            var ret = [];
            for (var i=0; i<this.contList.length; i++) {
                if (this.contList[i].type === key) {
                    ret.push(this.contList[i]);
                }
            }
            return ret;
        }
        else {
            for (var i=0; i<this.contList.length; i++) {
                if (this.contList[i].type === key) {
                    var valid = true;
                    for (var key in args) {
                        if (this.contList[i][key] !== args[key]) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        return this.contList[i];
                    }
                }
            }
            return null;
        }
    };

    this.serialize = function() {

        var ret = {
            list: []
        };

        //for (var i=0; i<this.contList.length; i++) {
        //    ret.list.push(this.contList[i].serialize());
        //}

        return ret;

    };

    this.load = function(obj) {

        this.init();
        //if (obj) {
        //    for (var i=0; i<obj.list.length; i++) {
        //        var it = obj.list[i];
        //        new BSWG.specialControl(this.getCDesc(it.type), it.args);
        //    }
        //}
    };

});

// For player use of specials (player input)
BSWG.specialControl = function(args, callback) {

    var desc = null

    if (typeof args === 'string') {
        this.key = args;
        args = BSWG.specialsInfo[args];
    }

    desc = args.controller;

    if (!desc) {
        return;
    }

    if (!args) {
        args = {};
    }

    for (var key in desc) {
        this["_" + key] = this[key] || null;
        this[key] = desc[key];
    }

    this.output = null;
    this.userAction = false;
    this.callback = callback || null;

    var ret = this.init(args);

    BSWG.specialList.contList.push(this);

    if (!ret) {
        this.destroy();
    }

};

BSWG.specialControl.prototype.serialize = function () {

    var type = this.type;
    var args = {};
    if (this.serialKey) {
        for (var i=0; i<this.serialKey.length; i++) {
            var key = this.serialKey[i];
            args[key] = this[key];
        }
    }
    return {
        type: type,
        args: args
    };

};

BSWG.specialControl.prototype.init = function(args) {

    return true;

};

BSWG.specialControl.prototype.destroy = function() {

    for (var i=0; i<BSWG.specialList.contList.length; i++) {
        if (BSWG.specialList.contList[i] === this) {
            BSWG.specialList.contList.splice(i, 1);
            return true;
        }
    }

    return false;

};

BSWG.specialControl.prototype.updateRender = function(ctx, dt) {

    if ((this.output || BSWG.input.KEY_DOWN(BSWG.KEY.ESC)) && !this.userAction) {
        BSWG.input.EAT_KEY(BSWG.KEY.ESC);
        this.userAction = true;
        if (this.callback) {
            this.callback(this.output);
        }
        return false;
    }

    return true;

};

// Created at the instant of special usage (player or ai)
BSWG.specialEffect = function(desc, args) {

    if (!desc) {
        desc = {};
    }
    if (!args) {
        args = {};
    }

    for (var key in desc) {
        this["_" + key] = this[key] || null;
        this[key] = desc[key];
    }

    if (this.init(args)) {
        BSWG.specialList.effectList.push(this);
    }
    else {
        this.destroy();
    }

};

BSWG.specialEffect.prototype.init = function(args) {

};

BSWG.specialEffect.prototype.destroy = function() {

    for (var i=0; i<BSWG.specialList.effectList.length; i++) {
        if (BSWG.specialList.effectList[i] === this) {
            BSWG.specialList.effectList.splice(i, 1);
            return true;
        }
    }

    return false;

};

BSWG.specialEffect.prototype.updateRender = function(ctx, dt) {

};

BSWG.startSpecial = function(key, who, btn) {

    if (!who) {
        who = BSWG.game.ccblock;
        if (!who || who.destroyed) {
            return;
        }
    }

    if (!who.hasSpecial(key) || who.specialReady(key) < 1.0 || !who.specialEquipped(key)) {
        return;
    }

    if (who.energy < BSWG.specialsInfo[key].energy) {
        return;
    }

    if (btn) {
        btn.selected = true;
    }

    return new BSWG.specialControl(
        key,
        function(data){
            if (btn) {
                btn.selected = false;
            }
            if (!who || who.destroyed || !who.obj || !who.obj.body) {
                return;
            }
            if (data) {
                if (who.hasSpecial(key) && who.energy >= BSWG.specialsInfo[key].energy) {
                    if (BSWG.specialsInfo[key].effect) {
                        new BSWG.soundSample().play('use-special', who.obj.body.GetWorldCenter().THREE(0.4), 4.0, 1.0/(((BSWG.specialsInfo[key].energy||0)+Math._random())/50));
                        new BSWG.specialEffect(BSWG.specialsInfo[key].effect, data);
                    }
                    who.energy = Math.max(who.energy - BSWG.specialsInfo[key].energy || 0, 0);
                    who.specials.all[key].t = 0.0;
                    who.usedSpecial = BSWG.specialsInfo[key].name || '';
                    who.usedSpecialT = 3.0;
                    var clr = BSWG.specialsInfo[key].color;
                    var r = Math.clamp(Math.floor(clr.x*255), 0, 255);
                    var g = Math.clamp(Math.floor(clr.y*255), 0, 255);
                    var b = Math.clamp(Math.floor(clr.z*255), 0, 255);
                    who.usedSpecialClr = 'rgb(' + r + ',' + g + ',' + b + ')';;
                }
            }
        }
    );
}

BSWG.renderSpecialIcon = function(ctx, key, x, y, scale, angle, who, nobg) {

    var desc = BSWG.specialsInfo[key];
    var poly = desc.polys;
    var baseR = desc.color.x;
    var baseG = desc.color.y;
    var baseB = desc.color.z;
    var avg = (baseR + baseG + baseB) / 3.0;
    var saturation = 1.0;
    var lightness = 0.0;

    var T = 0.0;

    var oAlpha = ctx.globalAlpha;

    if (who && !nobg) {
        if (!who.hasSpecial(key)) {
            saturation = 0.0;
        }
        if (!who.specialEquipped(key)) {
            lightness -= 0.35;
        }
        T = who.specialReady(key);
        if (T < 1.0 || who.canUseSpecial(key) === false) {
            saturation *= 0.5;
            ctx.globalAlpha *= 0.75;
        }
    }
    else if (who && nobg) {
        if (!who.hasSpecial(key)) {
            saturation = 0.5;
        }
        if (!who.specialEquipped(key)) {
            lightness -= 0.15;
        }
    }

    baseR = saturation * baseR + (1 - saturation) * avg + lightness - .3;
    baseG = saturation * baseG + (1 - saturation) * avg + lightness - .3;
    baseB = saturation * baseB + (1 - saturation) * avg + lightness - .3;

    if (!scale && scale !== 0) {
        scale = 1.0;
    }

    var iscale = scale;

    var bnd = [-0.5, -0.5, 0.5, 0.5];

    scale *= desc.iconScale || 1.0;
    var invscale = desc.iconScale || 1.0;

    angle = angle || 0.0;

    var r = Math.floor(Math.clamp((baseR||0.3) * 0.6, 0, 1)*255);
    var g = Math.floor(Math.clamp((baseG||0.3) * 0.6, 0, 1)*255);
    var b = Math.floor(Math.clamp((baseB||0.3) * 0.6, 0, 1)*255);

    var r2 = Math.floor(Math.clamp((baseR||0.3) * 2, 0, 1)*255);
    var g2 = Math.floor(Math.clamp((baseG||0.3) * 2, 0, 1)*255);
    var b2 = Math.floor(Math.clamp((baseB||0.3) * 2, 0, 1)*255);

    var r4 = Math.floor(Math.clamp((baseR||0.3) * 3.5, 0, 1)*255);
    var g4 = Math.floor(Math.clamp((baseG||0.35) * 3.5, 0, 1)*255);
    var b4 = Math.floor(Math.clamp((baseB||0.3) * 3.5, 0, 1)*255);

    var r3 = Math.floor(Math.clamp((baseR||0.3) * 0.1, 0, 1)*255);
    var g3 = Math.floor(Math.clamp((baseG||0.3) * 0.1, 0, 1)*255);
    var b3 = Math.floor(Math.clamp((baseB||0.3) * 0.1, 0, 1)*255);

    var c1 = 'rgb(' + r + ',' + g + ',' + b + ')';
    var c2 = 'rgb(' + r2 + ',' + g2 + ',' + b2 + ')';
    var c3 = 'rgb(' + r3 + ',' + g3 + ',' + b3 + ')';
    var c4 = 'rgb(' + r4 + ',' + g4 + ',' + b4 + ')';

    if (T && !nobg) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(iscale, iscale);

        var a = Math.rotVec2(new b2Vec2((bnd[0]+bnd[2])*0.5, bnd[3]), 0);
        var b = Math.rotVec2(new b2Vec2((bnd[0]+bnd[2])*0.5, bnd[1]), 0);
        var grd = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        a = b = null;
        if (T === 1.0) {
            grd.addColorStop(0, 'rgba(18, 24, 18, 0.75)');
            grd.addColorStop(1, 'rgba(72, 96, 72, 0.75)');
        }
        else {
            grd.addColorStop(0, 'rgba(24, 24, 24, 0.65)');
            grd.addColorStop(1, 'rgba(96, 96, 96, 0.65)');
        }
        ctx.fillStyle = grd;
        ctx.lineWidth = 1 / iscale;
        ctx.strokeStyle = c3;
        ctx.beginPath();
        ctx.rect(bnd[0], bnd[1], bnd[2]-bnd[0], bnd[3]-bnd[1]);
        ctx.stroke();
        ctx.clip();
        var R = Math.min(bnd[2]-bnd[0], bnd[3]-bnd[1])*2.0;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (var i=0; i<=256*T; i++) {
            var A = i/256*Math.PI*2.0;
            var X = Math.cos(A) * R, Y = Math.sin(A) * R;
            ctx.lineTo(X, Y);
        }
        ctx.lineTo(0, 0);
        ctx.closePath();

        ctx.fill();
        if (T < 1) {
            ctx.stroke();   
        }
        ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(angle);
    
    for (var j=0; j<poly.length; j++) {
        ctx.lineWidth = 3 / scale;
        ctx.strokeStyle = c3;
        ctx.beginPath();
        ctx.moveTo(poly[j][0].x, poly[j][0].y);
        for (var i=1; i<poly[j].length; i++) {
            ctx.lineTo(poly[j][i].x, poly[j][i].y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    for (var j=0; j<poly.length; j++) {
        ctx.fillStyle = j === 0 ? c1 : c2;
        var a = Math.rotVec2(new b2Vec2(bnd[0]*invscale, (bnd[1]+bnd[3])*0.5*invscale), -angle);
        var b = Math.rotVec2(new b2Vec2(bnd[2]*invscale, (bnd[1]+bnd[3])*0.5*invscale), -angle);
        var grd = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        a = b = null;
        if (j === 0) {
            grd.addColorStop(0, c1);
            grd.addColorStop(1, c2);
        }
        else {
            grd.addColorStop(0, c2);
            grd.addColorStop(1, c4);
        }
        ctx.fillStyle = grd;
        grd = null;
        ctx.beginPath();
        ctx.moveTo(poly[j][0].x, poly[j][0].y);
        for (var i=1; i<poly[j].length; i++) {
            ctx.lineTo(poly[j][i].x, poly[j][i].y);
        }
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    ctx.globalAlpha = oAlpha;
};