window.BSWG = window.BSWG || {};

BSWG.character = new function(num_desc, img_size) {

    var layers = [
        [
            [ 'char-shirt', 1.0 ]
        ],
        [
            [ 'char-face', 1.0 ]
        ],
        [
            [ 'char-tattoo', 0.2 ]
        ],
        [
            [ 'char-outline', 1.0 ]
        ],
        [
            [ 'char-pads', 0.25 ],
            [ 'char-spikes', 0.25 ]
        ],
        [
            [ 'char-demon-eyes', 0.2 ]
        ],
        [
            [ 'char-fangs', 0.2 ]
        ],
        [
            [ 'char-beard', 0.35 ]
        ],
        [
            [ 'char-burns-down', 0.2 ]
        ],
        [
            [ 'char-hair-anime', 1/8 ],
            [ 'char-hair-long', 1/10 ],
            [ 'char-hair-short', 1/8 ],
            [ 'char-hair-swoop', 1/10 ],
            [ 'char-beret', 1/4 ]
        ],
        [
            [ 'char-burns-devil', 0.2 ]
        ]
    ];

    var hairColors = [
        [ 1, 1, 1,     0.0, 1.0 ],
        [ 1, 0, 0,    -0.5, 1.0 ],
        [ 0, 1, 0,    -0.5, 1.0 ],
        [ 0, 0, 1,    -0.5, 1.0 ],
        [ .2, .2, .2,  0.0, 1.0 ],
        [ 0, 1, 0,     0.0, 1.0 ],
        [ 1, 1, .5,   -0.5, 1.0 ]
    ];

    var skinColors = [
        [ .32, .04, .04,  0.5, 1.0 ],
        [ .16, .02, .02,  0.5, 1.0 ],
        [ .5, 0, 0,       0.0, 1.0 ],
        [ .5, .5, 0,      0.0, 1.0 ],        
        [ 0, .5, 0,       0.0, 1.0 ],
        [ 0, 0, .5,       0.0, 1.0 ],
        [ .08, .08, .08,  0.1, 1.0 ],
        [ .5, .5, .1,     0.0, 1.0 ]
    ];

    var shirtColors = [
        [ 1, 0, 0,      0.0, 1.0 ],
        [ 0, 1, 0,      0.0, 1.0 ],
        [ 0, 0, 1,      0.0, 1.0 ],
        [ .2, .2, .2,   0.0, 1.0 ],
        [ 1, .5, 0,     0.0, 1.0 ],
        [ 1, 1, 1,      0.0, 1.0 ]
    ];

    var eyeColors = [
        [ 1, 1, 1,      0.0, 1.0 ],
        [ 1, 0, 0,      0.0, 1.0 ],
        [ 0, 1, 0,      0.0, 1.0 ],
        [ 0, 0, 1,      0.0, 1.0 ],
        [ 0, 0, 0,      0.0, 1.0 ]
    ];

    var colors = {
        'char-shirt': shirtColors,
        'char-pads': shirtColors,
        'char-spikes': shirtColors,
        'char-face': skinColors,
        'char-demon-eyes': eyeColors,
        'char-beard': hairColors,
        'char-burns-devil': hairColors,
        'char-burns-down': hairColors,
        'char-hair-swoop': hairColors,
        'char-hair-short': hairColors,
        'char-hair-long': hairColors,
        'char-hair-anime': hairColors,
        'char-face': skinColors,
        'char-beret': shirtColors
    };

    var descs = new Array(num_desc);

    Math.seedrandom(666);

    for (var i=0; i<num_desc; i++) {

        var D = null;
        while (true) {
            D = new Array();
            for (var j=0; j<layers.length; j++) {
                for (var k=0; k<layers[j].length; k++) {
                    if (Math.random() <= layers[j][k][1]) {
                        var layer = new Object();
                        layer.img = layers[j][k][0];
                        if (colors[layer.img]) {
                            layer.color = colors[layer.img][(~~(Math.random()*1000000)) % colors[layer.img].length];
                        }
                        else {
                            layer.color = null;
                        }
                        D.push(layer);
                        break;
                    }
                }
            }

            var conflict = false;

            for (var j=0; j<i && !conflict; j++) {
                var D2 = descs[j];
                var same = true;
                if (D2.length !== D.length) {
                    same = false;
                }
                else {
                    for (var k=0; k<D.length && same; k++) {
                        if (D[k].image !== D2[k].image) {
                            same = false;
                        }
                        if ((D[k].color === null) !== (D2[k].color === null)) {
                            same = false;
                        }
                        else if (D[k].color) {
                            if (D[k].color.length !== D2[k].color.length) {
                                same = false;
                            }
                            else {
                                for (var f=0; f<D[k].color.length && same; f++) {
                                    if (D[k].color[f] !== D2[k].color[f]) {
                                        same = false;
                                    }
                                }
                            }
                        }
                    }
                }
                if (same) {
                    conflict = true;
                }
            }

            if (!conflict) {
                break;
            }
        }

        descs[i] = D;
    }

    this.descs = descs;

    Math.seedrandom();

}(512, 192);