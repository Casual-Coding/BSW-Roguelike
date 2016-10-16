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

        BSWG.specialsInfo = {
            'heal': {
                controller: BSWG.specialCont_circleRange,
                color: new THREE.Vector4(0, 1, 0, 0.75),
                minRadius: 5,
                maxRadius: 5,
                cooldown: 20.0, // seconds
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

    this.init(args);

    BSWG.specialList.effectList.push(this);

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

    if (btn) {
        btn.selected = true;
    }

    return new BSWG.specialControl(
        key,
        function(data){
            if (btn) {
                btn.selected = false;
            }
            if (!who || who.destroyed) {
                return;
            }
            if (data) {
                if (who.hasSpecial(key)) {
                    who.specials.all[key].t = 0.0;
                }
            }
        }
    );
}

BSWG.renderSpecialIcon = function(ctx, key, x, y, scale, angle, who) {

    var desc = BSWG.specialsInfo[key];
    var poly = desc.polys;
    var baseR = desc.color.x;
    var baseG = desc.color.y;
    var baseB = desc.color.z;
    var avg = (baseR + baseG + baseB) / 3.0;
    var saturation = 1.0;
    var lightness = 0.0;

    var T = 0.0;

    if (who) {
        if (!who.hasSpecial(key)) {
            saturation = 0.0;
        }
        if (!who.specialEquipped(key)) {
            lightness -= 0.35;
        }
        T = who.specialReady(key);
        if (T < 1.0) {
            saturation *= 0.5;
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

    if (T) {
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
};