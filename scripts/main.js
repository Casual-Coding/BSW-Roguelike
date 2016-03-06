// BlockShip Wars Main

var BSWG = new function(){

    var scripts = [
        'game.js',
        'render.js',
        'input.js',
        'physics.js',
        'component.js',
        'ui.js',
        'blaster.js',
        'background.js',
        'planets.js',
        'mapgen.js',
        'fg-nebulas.js',
        'random-name.js',
        'components/blaster.js',
        'components/block.js',
        'components/chain-link.js',
        'components/command-center.js',
        'components/hinge-half.js',
        'components/saw-blade.js',
        'components/saw-motor.js',
        'components/spikes.js',
        'components/thruster.js',
        'components/detacher-launcher.js',
        'components/util-jpoints.js',
        'components/util-render.js'
    ];
    var images = {
        'nebula_0': 'nebula-512-0.png',
        'nebula_1': 'nebula-512-1.png',
        'nebula_2': 'nebula-512-2.png',
        'nebula_3': 'nebula-512-3.png',
        'nebula_4': 'nebula-512-4.png',
        'nebula_5': 'nebula-512-5.png',
        'nebula_6': 'nebula-512-6.png',
        'nebula_7': 'nebula-512-7.png',
        'nebula_8': 'nebula-512-8.png',
        'nebula_9': 'nebula-512-9.png',
        'nebula_10': 'nebula-512-10.png',
        'nebula_11': 'nebula-512-11.png',
        'nebula_12': 'nebula-512-12.png',
        'nebula_13': 'nebula-512-13.png',
        'nebula_14': 'nebula-512-14.png',
        'stars_0': 'stars-512-0.png',
        'stars_1': 'stars-512-1.png',
        'stars_2': 'stars-512-2.png',
        'stars_3': 'stars-512-3.png',
        'stars_4': 'stars-512-4.png',
        'stars_5': 'stars-512-5.png',
        'stars_6': 'stars-512-6.png',
        'stars_7': 'stars-512-7.png',
        'stars_8': 'stars-512-8.png',
        'stars_9': 'stars-512-9.png',
        'stars_10': 'stars-512-10.png',
        'stars_11': 'stars-512-11.png',
        'stars_12': 'stars-512-12.png',
        'stars_13': 'stars-512-13.png',
        'stars_14': 'stars-512-14.png',
        'test_nm': 'test-normalmap.png',
        'grass_nm': 'grass-nm.png',
        'water_nm': 'water-nm.png',
        'cursor-normal': 'cursor-normal.png',
        'cursor-pressed': 'cursor-pressed.png',
        'cursor-pressed-right': 'cursor-pressed-right.png',
        'cursor-custom-1': 'cursor-welder.png',
        'cursor-custom-2': 'cursor-mover.png',
        'cursor-custom-3': 'cursor-settings.png'
    };
    var shaders = {
        'vertex': [
            'basicVertex',
            'bgVertex',
            'jpointsVertex',
            'expVertex',
            'planetVertex',
            'pRangeVertex'
        ],
        'fragment': [
            'basicFragment',
            'bgFragment',
            'bgFragment2',
            'fgFragment',
            'basicFragmentOptimized',
            'bgFragmentOptimized',
            'selectionFragment',
            'jpointsFragment',
            'expFragment',
            'planetFragment',
            'planetRingFragment',
            'pRangeFragment',
            'textFragment'
        ]
    };

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
                BSWG.game.changeScene(BSWG.SCENE_TITLE, {}, '#000', 1.0);
                BSWG.game.start();
            }, images, shaders);
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

// http://stackoverflow.com/questions/4878756/javascript-how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
String.prototype.toTitleCase = function()
{
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};