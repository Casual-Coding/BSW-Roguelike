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
        [ .2, .2, 1,       0.0, 1.0 ],
        [ .08, .08, .08,  0.1, 1.0 ],
        [ .5, .5, .1,     0.0, 1.0 ]
    ];

    var shirtColors = [
        [ 1, 0, 0,      0.0, 1.0 ],
        [ 0, 1, 0,      0.0, 1.0 ],
        [ .5, .5, 1,      0.0, 1.0 ],
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

    this.getImage = function(ctx, I) {

        var img = BSWG.render.images[I.img];
        var img2 = img;

        if (I.color) {
            img2 = BSWG.render.proceduralImage(img_size, img_size, function(ctx2, w, h) {

                ctx2.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);

                var idat = ctx2.getImageData(0, 0, w, h);
                var C = I.color;

                for (var i=0; i<(w*h*4); i+=4) {
                    var r = idat.data[i+0]/255;
                    var g = idat.data[i+1]/255;
                    var b = idat.data[i+2]/255;

                    var l = Math.max(r, Math.max(g, b));

                    r = (C[0] * C[4] + C[3]) * l;
                    g = (C[1] * C[4] + C[3]) * l;
                    b = (C[2] * C[4] + C[3]) * l;

                    idat.data[i+0] = Math.clamp(~~(r*255), 0, 255);
                    idat.data[i+1] = Math.clamp(~~(g*255), 0, 255);
                    idat.data[i+2] = Math.clamp(~~(b*255), 0, 255);
                }

                ctx2.putImageData(idat, 0, 0);

            }, true);
        }

        if (ctx) {
            ctx.drawImage(img2, 0, 0, img2.width, img2.height, 0, 0, img_size, img_size);
        }

        return img2;

    };

    this.cache = {};

    this.getPortrait = function(id, friend) {

        var D = this.descs[(~~(id||0)) % this.descs.length];
        var self = this;

        return BSWG.render.proceduralImage(img_size, img_size, function(ctx, w, h) {

            if (friend) {
                self.getImage(ctx, {img: 'char-friend-bg'});
            }
            else {
                self.getImage(ctx, {img: 'char-enemy-bg'});
            }

            for (var i=0; i<D.length; i++) {
                self.getImage(ctx, D[i]);
            }

        }, true);

    };

    this.getMom = function(friend) {

        var self = this;

        return BSWG.render.proceduralImage(img_size, img_size, function(ctx, w, h) {

            if (friend) {
                self.getImage(ctx, {img: 'char-friend-bg'});
            }
            else {
                self.getImage(ctx, {img: 'char-enemy-bg'});
            }

            self.getImage(ctx, {img: 'char-mom'});

        }, true);

    };

    this.displayBunch = function () {

        var self = this;
        var img2 = BSWG.render.proceduralImage(1024, 1024, function(ctx, w, h) {

            for (var i=0; i<8; i++) {
                for (var j=0; j<8; j++) {
                    var k = i + j*8;
                    var img = null;
                    if (k === 0) {
                        img = self.getMom(true);
                    }
                    else {
                        img = self.getPortrait(k-1, Math.random()>0.8);
                    }
                    ctx.drawImage(img, 0, 0, img_size, img_size, i*128, j*128, 128, 128);
                }
            }


        }, true);

        img2.debug();

    };

}(512, 192);