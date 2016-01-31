// BlockShip Wars Main

var BSWG = new function(){

    var scripts = [
        'game.js',
        'render.js',
        'input.js',
        'physics.js',
        'component.js',
        'ui.js',
    ];

    this.init = function ()
    {
        var scriptsLeft = scripts.length;

        var scriptsLoaded = function ()
        {
            scriptsLeft -= 1;
            if (scriptsLeft >= 1)
                return;

            BSWG.render.init(function(){
                BSWG.physics.init();
                BSWG.input.init();
                BSWG.game.createNew();
                BSWG.game.start();
            });
        };

        for (var i=0; i<scripts.length; i++)
        {
            var script = document.createElement('script');
            script.onload = scriptsLoaded;
            script.src = "scripts/" + scripts[i];
            document.head.appendChild(script);
        }
    };
}();