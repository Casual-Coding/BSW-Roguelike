// BlockShip Wars Main

var BSWG = new function(){

    this.options = {
        fullscreen: false,
        vsync: false,
        postProc: true,
        shadows: true
    };
    this.saveOptions = function() {
        window.localStorage = window.localStorage || {};
        window.localStorage.options = JSON.stringify(this.options);
    };
    this.loadOptions = function() {
        if (window.localStorage && window.localStorage.options) {
            var opts = JSON.parse(window.localStorage.options);
            for (var key in opts) {
                this.options[key] = opts[key];
            }
        }
    };

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
        'clouds.js',
        'special-projectile.js',
       ['ai/ai_template.js', 'ai_Template'],
        'components/blaster.js',
        'components/minigun.js',
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
        'components/shield.js',
        'components/railgun.js',
        'components/razor.js',
        'components/power-core.js',
        'components/util-jpoints.js',
        'components/util-render.js',
        'specials/specials_base.js',
        'specials/controls.js',
        'specials/defense.js',
        'specials/attack.js',
        'specials/speed.js',
        'specials/mele.js'
    ];
    var images = {
        'test_nm': 'ship-nm.png',
        'grass_nm': 'grass-nm-1024.png',
        'water_nm': 'water-nm-1024.png',
        'snow_nm': 'snow-nm-512.png',
        'sand_nm': 'sand-nm-512.png',
        'rock_nm': 'rock-nm-512.png',
        'damage_nm': 'damage-nm.png',
        'hud_nm': 'hud-nm.png',
        'env-map-1': 'env-map-1.png',
        'env-map-2': 'env-map-2.png',
        'env-map-3': 'env-map-3.png',
        'env-map-4': 'env-map-4.png',
        'cursor-normal': 'cursor-normal.png',
        'cursor-pressed': 'cursor-pressed.png',
        'cursor-pressed-right': 'cursor-pressed-right.png',
        'cursor-custom-1': 'cursor-welder.png',
        'cursor-custom-2': 'cursor-mover.png',
        'cursor-custom-3': 'cursor-settings.png',
        'cursor-custom-4': 'cursor-store.png',
        'cursor-custom-5': 'cursor-attractor.png',
        'cursor-custom-6': 'cursor-settings-alt.png',
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
        'tileset-rockland': 'tileset-rockland-512.png',
        'unlock-icon': 'unlock-icon.png',
        'unlock-hover': 'unlock-hover.png',
        'unlock-equipped': 'unlock-equipped.png',
        'cloud-0': 'cloud-256-0.png',
        'cloud-1': 'cloud-256-1.png',
        'cloud-2': 'cloud-256-2.png',
        'cloud-3': 'cloud-256-3.png',
        'cloud-4': 'cloud-256-4.png',
        'power': 'power.png',
        'power-red': 'power-red.png',
        'power-green': 'power-green.png'
    };
    var makeTexture = [
        'test_nm',
        'grass_nm',
        'water_nm',
        'rock_nm',
        'snow_nm',
        'sand_nm',
        'damage_nm',
        'hud_nm',
        'env-map-1',
        'env-map-2',
        'env-map-3',
        'env-map-4',
        'cloud-0',
        'cloud-1',
        'cloud-2',
        'cloud-3',
        'cloud-4'
    ];
    var shaders = {
        'vertex': [
            'basicVertex',
            'basicVertexMulti',
            'basicVertex2',
            'basicVertex2Multi',
            'bgVertex',
            'jpointsVertex',
            'expVertex',
            'planetVertex',
            'pRangeVertex',
            'hudVertex',
            'weatherVertex',
            'exaustVertex',
            'multiSelectionVertex'
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
            'compSelectionFragment',
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
            'cloudFragment',
            'cloudShadowFragment',
            'torpedoFragment',
            'shieldFragment',
            'orbFragment'
        ]
    };
    var ai = [
        'goliath',
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
        'tracker',
        'fighter-mg',
        'four-minigun',
        'freighter-2',
        'little-brute-2',
        'marauder-2',
        'mini-gunner',
        'mini-gunner-m2',
        'mini-gunner-m3',
        'fighter-mg-2'
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

            if (window.localStorage && !window.localStorage.options) {
                BSWG.saveOptions();
            }
            else {
                BSWG.loadOptions();
            }

            BSWG.music.init(function(){
                BSWG.soundLoad(function(){
                    BSWG.render.init(function(){
                        BSWG.physics.init();
                        BSWG.input.init();
                        BSWG.game.changeScene(BSWG.SCENE_TITLE, {}, '#000', 1.0);
                        if (BSWG.options.fullscreen) {
                            var win = BSWG.render.win;
                            if (!win.isFullscreen) {
                                win.toggleFullscreen();
                            }
                        }
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