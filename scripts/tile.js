BSWG.tileSize = 512;
BSWG.tileMeshSize = 64;
BSWG.tileSizeWorld = 16.0;

BSWG.tMask = {
    L: 1,
    R: 2,
    U: 4,
    D: 8
}

BSWG.tile = function (image, imgX, imgY, tileMask) {

    var self = this;
    this.heightMap = new Array(BSWG.tileSize * BSWG.tileSize);

    this.normalMap = BSWG.render.proceduralImage(BSWG.tileSize, BSWG.tileSize, function(ctx, w, h){
        ctx.drawImage(image, imgX, imgY, BSWG.tileSize, BSWG.tileSize, 0, 0, BSWG.tileSize, BSWG.tileSize);
        var imgData = ctx.getImageData(0, 0, w, h);
        for (var i=0; i<imgData.data.length; i+=4) {
            self.heightMap[~~(i/4)] = imgData.data[i+0];
        }
        BSWG.render.heightMapToNormalMap(self.heightMap, ctx, w, h, tileMask);
    });

};

BSWG.tileSet = function (imageName) {

    var image = (typeof imageName === 'string') ? BSWG.render.images[imageName] : imageName;

    this.tiles = [
        [
            new BSWG.tile(image, BSWG.tileSize*0, BSWG.tileSize*0, BSWG.tMask.R | BSWG.tMask.D),
            new BSWG.tile(image, BSWG.tileSize*1, BSWG.tileSize*0, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.D),
            new BSWG.tile(image, BSWG.tileSize*2, BSWG.tileSize*0, BSWG.tMask.L | BSWG.tMask.D)
        ],
        [
            new BSWG.tile(image, BSWG.tileSize*0, BSWG.tileSize*1, BSWG.tMask.R | BSWG.tMask.D | BSWG.tMask.U),
            new BSWG.tile(image, BSWG.tileSize*1, BSWG.tileSize*1, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.D | BSWG.tMask.U),
            new BSWG.tile(image, BSWG.tileSize*2, BSWG.tileSize*1, BSWG.tMask.L | BSWG.tMask.D | BSWG.tMask.U)
        ],
        [
            new BSWG.tile(image, BSWG.tileSize*0, BSWG.tileSize*2, BSWG.tMask.R | BSWG.tMask.U),
            new BSWG.tile(image, BSWG.tileSize*1, BSWG.tileSize*2, BSWG.tMask.L | BSWG.tMask.R | BSWG.tMask.U),
            new BSWG.tile(image, BSWG.tileSize*2, BSWG.tileSize*2, BSWG.tMask.L | BSWG.tMask.U)
        ]
    ];

};