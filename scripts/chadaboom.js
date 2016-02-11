window.chadaboom = function(batches, onLoad) {

    this.nframes = 2 * 60;
    this.bwidth = 12;
    this.bheight = 10;

    var toLoad = 0;
    for (var i=0; i<batches.length; i++) {
        var b = batches[i];
        toLoad += b.count;
    }

    for (var i=0; i<batches.length; i++) {
        var b = batches[i];
        b.img = [];

        for (var j=0; j<b.count; j++) {
            var img = new Image();
            img.src = b.name + '-' + b.size + '-' + j + '.png';
            img.onload = function() {
                toLoad -= 1;
                if (toLoad === 0) {
                    if (onLoad)
                        onLoad();
                }
            };
            b.img.push(img);
        }

        b.i = i;
    }

    this.batches = batches;
    this.list = [];

};

chadaboom.prototype.render = function(ctx, dt) {

    for (var i=0; i<this.list.length; i++) {
        var B = this.list[i];
        B.t -= dt;
        if (B.t <= 0.0) {
            this.list.splice(i, 1);
            i --;
            continue;
        }

        var p = B.p();
        var sz = B.sz(B.res);
        var bb = this.batches[B.bbi];

        var frame = Math.floor((1.0-(B.t / B.maxt)) * this.nframes);
        if (frame < 0) {
            frame = 0;
        }
        if (frame >= this.nframes) {
            frame = this.nframes-1;
        }

        ctx.save();
        ctx.translate(p.x-sz*0.5, p.y-sz*0.5);
        ctx.rotate(B.rot);
        ctx.drawImage(bb.img[B.img], (frame%this.bwidth)*bb.size, Math.floor(frame/this.bwidth)*bb.size, bb.size, bb.size, 0, 0, sz, sz);
        ctx.restore();
    }

};

chadaboom.prototype.add = function(posFn, sizeFn, res, life) {

    res = res || 256;
    if (res < 0) {
        res = 0;
    }
    life = life || 2.0;

    var bb = null;
    for (var i=0; i<this.batches.length; i++) {
        if (!bb || Math.abs(res-bb.size) > Math.abs(res-this.batches[i].size)) {
            bb = this.batches[i];
        }
    }

    if (!bb) {
        return false;
    }

    if (typeof posFn === "object") {
        var posObj = posFn;
        posFn = function() {
            return posObj;
        };
    }

    if (typeof sizeFn === "number") {
        var sizeVal = sizeFn;
        sizeFn = function(res) {
            return sizeVal;
        };
    }

    this.list.push({

        p: posFn,
        sz: sizeFn,
        res: res,
        bbi: bb.i,
        img: Math.floor(Math.random()*1000000) % bb.count,
        t: life,
        maxt: life,
        rot: Math.random() * Math.PI * 2.0,

    });

    return true;

};

chadaboom.prototype.clear = function() {

    this.list.length = 0;

};