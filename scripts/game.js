BSWG.game = new function(){

    this.test = function ()
    {
        console.log('a');
    };

    this.createNew = function ()
    {
        // Init game state

        BSWG.physics.reset();
        BSWG.componentList.clear();
        this.cam = new BSWG.camera();
    };

    this.start = function ()
    {
        var self = this;

        window.ablock = new BSWG.component(BSWG.component_Block, {

            pos: new b2Vec2(0, 0),
            angle: Math.PI/4,
            width: 1,
            height: 3,
            armour: false

        });

        this.ccblock = new BSWG.component(BSWG.component_CommandCenter, {

            pos: new b2Vec2(3, 0),
            angle: -Math.PI/3.5

        });

        var wheelStart = BSWG.input.MOUSE_WHEEL_ABS();
        BSWG.input.wheelLimits(wheelStart-10, wheelStart+10);

        BSWG.render.startRenderer(function(dt, time){

            document.title = "BSWR - " + Math.floor(1/dt) + " fps";
            //document.title = BSWG.input.getKeyMap()[BSWG.KEY.LEFT];

            BSWG.physics.update(dt);
            BSWG.componentList.update(dt);

            self.ccblock.handleInput(BSWG.input.getKeyMap());

            var wheel = BSWG.input.MOUSE_WHEEL_ABS() - wheelStart;
            var toZ = Math.clamp(0.1 * Math.pow(1.25, wheel), 0.01, 0.25);
            self.cam.zoomTo(dt*5.0, toZ);
            //self.cam.panTo(dt, -2, 0);

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, viewport.w, viewport.h);
            BSWG.componentList.render(ctx, self.cam, dt);

        });
    };

}();