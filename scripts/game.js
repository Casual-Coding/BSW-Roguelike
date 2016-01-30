BSWG.game = new function(){

    this.test = function ()
    {
        console.log('a');
    };

    this.createNew = function ()
    {
        // Init game state

        BSWG.physics.reset();
    };

    this.start = function ()
    {
        var self = this;

        BSWG.render.startRenderer(function(dt){

            BSWG.physics.update();

            

        });
    };

}();