window.chadaboom = function(batches, onLoad) {

    this.bwidth = 9;
    this.bheight = 5;
    this.nframes = this.bwidth * this.bheight;

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

    var oAlpha = parseFloat(ctx.globalAlpha);

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

        var t = Math.pow(1.0-(B.t / B.maxt), 1.0/B.attack);
        sz *= Math.pow(t, 0.25);
        var frame = t * this.nframes;
        if (frame < 0) {
            frame = 0;
        }
        if (frame > this.nframes-2) {
            frame = this.nframes-2;
        }

        var f1 = Math.floor(frame);
        var f2 = f1 + 1;
        var ft = frame - f1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(B.rot);
        ctx.translate(-sz*0.5, -sz*0.5);
        //ctx.globalAlpha = oAlpha * (1.0 - ft);
        ctx.drawImage(bb.img[B.img], (f1%this.bwidth)*bb.size, Math.floor(f1/this.bwidth)*bb.size, bb.size, bb.size, 0, 0, sz, sz);
        //ctx.globalAlpha = oAlpha * ft;
        //ctx.drawImage(bb.img[B.img], (f2%this.bwidth)*bb.size, Math.floor(f2/this.bwidth)*bb.size, bb.size, bb.size, 0, 0, sz, sz);
        ctx.restore();
    }

};

chadaboom.prototype.add = function(posFn, sizeFn, res, life, attack) {

    res = res || 256;
    if (res < 0) {
        res = 0;
    }
    life = life || 2.0;
    attack = attack || 2.0;
    if (attack <= 0) {
        attack = 0;
    }

    var bb = null;
    for (var i=0; i<this.batches.length; i++) {
        var d0 = bb ? Math.abs(res-bb.size) : 100000;
        var d1 = Math.abs(res-this.batches[i].size);
        if (bb && res < bb.size) {
            d0 = Math.pow(d0, 0.75);
        }
        if (res < this.batches[i].size) {
            d1 = Math.pow(d1, 0.75);
        }
        if (!bb || d0 > d1) {
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
        attack: attack

    });

    return true;

};

chadaboom.prototype.clear = function() {

    this.list.length = 0;

};