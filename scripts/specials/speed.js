BSWG.specialEffect_speed = {

    init: function(args) {

        this._init(args);

        if (args.cc) {
            args.cc.speed += 15.0;
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};

BSWG.specialEffect_speed2 = {

    init: function(args) {

        this._init(args);

        if (args.cc) {
            args.cc.speed += 30.0;
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};