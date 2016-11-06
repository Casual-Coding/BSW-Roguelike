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

BSWG.specialEffect_torpedo = {

    init: function(args) {

        this._init(args);

        new BSWG.specProj(BSWG.specProj_TorpedoOrEMP, {
            type: 'torpedo',
            follow: false,
            startP: args.owner.obj.body.GetWorldCenter().clone(),
            endP: args.p.clone(),
            hitRadius: args.r,
            source: args.owner
        });

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};

BSWG.specialEffect_torpedoSpread = {

    init: function(args) {

        this._init(args);

        for (var i=0; i<3; i++) {
            new BSWG.specProj(BSWG.specProj_TorpedoOrEMP, {
                type: 'torpedo',
                follow: false,
                startP: args.owner.obj.body.GetWorldCenter().clone(),
                endP: new b2Vec2(args.p.x + Math.cos(i/3*Math.PI*2) * args.r * 0.75, args.p.y + Math.sin(i/3*Math.PI*2) * args.r * 0.75),
                hitRadius: args.r,
                source: args.owner
            });
        }

        return false;
    },

    destroy: function () {

        this._destroy();

    },

    updateRender: function(ctx, dt) {

    }

};