BSWG.specialList = new (function(){

    this.contList = [];
    this.effectList = [];

    this.updateRender = function(ctx, dt) {

        for (var i=0; i<this.contList.length; i++) {
            this.contList[i].updateRender(ctx, dt);
        }
        for (var i=0; i<this.effectList.length; i++) {
            this.effectList[i].updateRender(ctx, dt);
        }

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

        for (var i=0; i<this.contList.length; i++) {
            ret.list.push(this.contList[i].serialize());
        }

        return ret;

    };

    this.load = function(obj) {

        this.init();
        if (obj) {
            for (var i=0; i<obj.list.length; i++) {
                var it = obj.list[i];
                new BSWG.specialControl(this.getCDesc(it.type), it.args);
            }
        }
    };

});

// For player use of specials (player input)
BSWG.specialControl = function(desc, args) {

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

    if (args.active) {
        this.makeActive(true);
    }

    BSWG.specialList.contList.push(this);

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

BSWG.specialControl.prototype.makeActive = function(flag) {

    this.active = flag;

};

BSWG.specialControl.prototype.updateRender = function(ctx, dt) {

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