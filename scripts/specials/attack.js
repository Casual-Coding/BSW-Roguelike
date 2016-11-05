BSWG.specialEffect_fury = {

    init: function(args) {

        this._init(args);

        if (args.cc) {
            args.cc.fury += 20.0;
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};

BSWG.specialEffect_overpowered = {

    init: function(args) {

        this._init(args);

        if (args.cc) {
            args.cc.overpowered += 25.0;
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};