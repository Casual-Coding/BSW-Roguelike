BSWG.specialEffect_massive = {

    init: function(args) {

        this._init(args);

        if (args.cc) {
            args.cc.massive += 5.0;
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};

BSWG.specialEffect_massive2 = {

    init: function(args) {

        this._init(args);

        if (args.cc) {
            args.cc.massive += 5.0;
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};
