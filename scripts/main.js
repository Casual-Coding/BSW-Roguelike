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
        'laser.js',
        'background.js',
        'planets.js',
        'mapgen.js',
        'fg-nebulas.js',
        'random-name.js',
        'character.js',
        'tile.js',
        'ai.js',
        'player-stats.js',
        'sounds.js',
        'xpdisplay.js',
        'weather.js',
        'exaust.js',
        'orb.js',
       ['ai/ai_template.js', 'ai_Template'],
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
        'components/missile-launcher.js',
        'components/missile.js',
        'components/laser.js',
        'components/util-jpoints.js',
        'components/util-render.js'
    ];
    var images = {
        /*'nebula_0': 'nebula-512-0.png',
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
        'stars_14': 'stars-512-14.png',*/
        'test_nm': 'test-normalmap.png',
        'grass_nm': 'grass-nm.png',
        'water_nm': 'water-nm.png',
        'damage_nm': 'damage-nm.png',
        'env-map-1': 'env-map-1.png',
        'env-map-2': 'env-map-2.png',
        'cursor-normal': 'cursor-normal.png',
        'cursor-pressed': 'cursor-pressed.png',
        'cursor-pressed-right': 'cursor-pressed-right.png',
        'cursor-custom-1': 'cursor-welder.png',
        'cursor-custom-2': 'cursor-mover.png',
        'cursor-custom-3': 'cursor-settings.png',
        'cursor-custom-4': 'cursor-store.png',
        'cursor-custom-5': 'cursor-attractor.png',
        'anchor': 'anchor.png',
        'build-mode': 'build-mode.png',
        'store-mode': 'store-mode.png',
        'store-mode-safe': 'store-mode-safe.png',
        'save': 'save.png',
        'show-controls': 'show-controls.png',
        'repair': 'repair.png',
        'menu': 'menu.png',
        'char-beard': 'char-beard.png',
        'char-beret': 'char-beret.png',
        'char-burns-devil': 'char-burns-devil.png',
        'char-burns-down': 'char-burns-down.png',
        'char-demon-eyes': 'char-demon-eyes.png',
        'char-enemy-bg': 'char-enemy-bg.png',
        'char-face': 'char-face.png',
        'char-fangs': 'char-fangs.png',
        'char-friend-bg': 'char-friend-bg.png',
        'char-hair-anime': 'char-hair-anime.png',
        'char-hair-long': 'char-hair-long.png',
        'char-hair-short': 'char-hair-short.png',
        'char-hair-swoop': 'char-hair-swoop.png',
        'char-mom': 'char-mom.png',
        'char-outline': 'char-outline.png',
        'char-pads': 'char-pads.png',
        'char-shirt': 'char-shirt.png',
        'char-spikes': 'char-spikes.png',
        'char-tattoo': 'char-tattoo.png',
        'tileset-mountain': 'tileset-mountain-512.png',
        'tileset-land': 'tileset-land-512.png',
        'tileset-below': 'tileset-below-512.png',
        'tileset-sand': 'tileset-sand-512.png',
        'tileset-snow': 'tileset-snow-512.png',
        'tileset-rockland': 'tileset-rockland-512.png'
    };
    var makeTexture = [
        'test_nm',
        'grass_nm',
        'water_nm',
        'damage_nm',
        'env-map-1',
        'env-map-2'
    ];
    var shaders = {
        'vertex': [
            'basicVertex',
            'basicVertex2',            
            'bgVertex',
            'jpointsVertex',
            'expVertex',
            'planetVertex',
            'pRangeVertex',
            'hudVertex',
            'weatherVertex',
        ],
        'fragment': [
            'basicFragment',
            'basicFragment2',
            'exaustFragment',
            'exaustFragmentShadow',
            'bgFragment',
            'bgFragment2',
            'fgFragment',
            'basicFragmentOptimized',
            'bgFragmentOptimized',
            'selectionFragment',
            'jpointsFragment',
            'expFragment',
            'expFragmentShadow',
            'planetFragment',
            'planetRingFragment',
            'pRangeFragment',
            'textFragment',
            'laserFragment',
            'hudFragment',
            'tileFragment',
            'tileWaterFragment',
            'shadowFragment',
            'weatherFragment',
            'weatherFragmentShadow',
        ]
    };
    var ai = [
        'big-flail',
        'big-spinner',
        'brute',
        'crippler',
        'cruncher-boss',
        'fighter',
        'four-blaster',
        'heavy-fighter',
        'laser-fighter',
        'little-brute',
        'little-charger-2',
        'little-charger',
        'little-cruncher',
        'mele-boss',
        'missile-boss',
        'missile-spinner',
        'msl-fighter',
        'scorpion',
        'spinner',
        'uni-dir-fighter',
        'uni-fight-msl',
        'uni-laser',
        'little-tough-guy',
        'tough-guy',
        'stinger',
        'brutenie',
        'marauder',
        'striker',
        'four-blaster-x2',
        'freighter',
        'tracker'
    ];
    for (var i=0; i<ai.length; i++) {
        scripts.push([
            'ai/' + ai[i] + '.json',
            'ais_' + ai[i]
        ]);
    }

    this.init = function ()
    {
        var scriptsLeft = scripts.length;

        var scriptsLoaded = function ()
        {
            scriptsLeft -= 1;
            if (scriptsLeft >= 1)
                return;

            BSWG.music.init(function(){
                BSWG.soundLoad(function(){
                    BSWG.render.init(function(){
                        BSWG.physics.init();
                        BSWG.input.init();
                        BSWG.game.changeScene(BSWG.SCENE_TITLE, {}, '#000', 1.0);
                        BSWG.game.start();
                    }, images, shaders, makeTexture);
                });
            });
        };

        for (var i=0; i<scripts.length; i++)
        {
            if (typeof scripts[i] === 'string') {
                var script = document.createElement('script');
                script.onload = scriptsLoaded;
                script.src = "scripts/" + scripts[i];
                document.head.appendChild(script);
            }
            else {
                jQuery.get("scripts/" + scripts[i][0], null, function(script){ return function(data){
                    BSWG[script[1]] = data;
                    scriptsLoaded();
                }; }(scripts[i]), "text");
            }
        }
    };
}();

// http://stackoverflow.com/questions/4878756/javascript-how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
String.prototype.toTitleCase = function()
{
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};