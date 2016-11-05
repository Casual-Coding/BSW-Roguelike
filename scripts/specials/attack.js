BSWG.specialEffect_fury = {

    init: function(args) {

        this._init(args);

        if (args.cc) {
            args.cc.fury += 16.0;
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};