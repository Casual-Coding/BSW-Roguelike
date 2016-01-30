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

        BSWG.render.startRenderer(function(dt){

            BSWG.physics.update(dt);
            BSWG.componentList.update(dt);

            //self.cam.zoomTo(dt*0.1, 0.2);
            //self.cam.panTo(dt, -2, 0);

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, viewport.w, viewport.h);
            BSWG.componentList.render(ctx, self.cam, dt);

        });
    };

}();