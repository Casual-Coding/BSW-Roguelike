BSWG.specialEffect_heal = {

    init: function(args) {

        this._init(args);

        var list = BSWG.componentList.withinRadius(args.p, args.r);
        for (var i=0; i<list.length; i++) {
            list[i].healHP += Math.clamp(list[i].maxHP - list[i].hp, 0, list[i].maxHP);
            list[i] = null;
        }

        list = null;

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};