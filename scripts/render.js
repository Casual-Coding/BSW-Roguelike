BSWG.camera = function() {

    this.x = 0;
    this.y = 0;
    this.z = 0.01;

    this.panTo = function (dt, x, y) {

        if (typeof x === "object") {
            y = x.y;
            x = x.x;
        }

        this.x += (x - this.x) * Math.min(dt, 1.0);
        this.y += (y - this.y) * Math.min(dt, 1.0);
    };

    this.zoomTo = function (dt, z) {

        this.z += (z - this.z) * Math.min(dt, 1.0);
    };

    this.toScreenList = function (viewport, list) {

        var vpsz = Math.max(viewport.w, viewport.h);
        var ret = new Array(list.length);
        for (var i=0, len=list.length; i<len; i++) {
            ret[i] = new b2Vec2(
                (list[i].x - this.x) * this.z * vpsz + viewport.w * 0.5,
                (list[i].y - this.y) * this.z * vpsz + viewport.h * 0.5
            );
        }
        return ret;

    };

    this.toScreen = function (viewport, x, y) {

        if (typeof x === "object") {
            y = x.y;
            x = x.x;
        }

        var vpsz = Math.max(viewport.w, viewport.h);

        return new b2Vec2(
            (x - this.x) * this.z * vpsz + viewport.w * 0.5,
            (y - this.y) * this.z * vpsz + viewport.h * 0.5
        );

    };

    this.toScreenSize = function (viewport, sz) {

        var vpsz = Math.max(viewport.w, viewport.h);
        return sz * this.z * vpsz;

    };

    this.wrapToScreen = function (viewport, x, y) {

        if (typeof x === "object") {
            y = x.y;
            x = x.x;
        }

        var self = this;
        return function(vx, vy) {
            x += vx;
            y += vy;
            return self.toScreen(viewport, x, y);
        };

    }

    this.wrapToScreenSize = function (viewport, sz) {

        var self = this;
        return function() {
            return self.toScreenSize(viewport, sz);
        };

    };

    this.toWorld = function (viewport, x, y) {

        if (typeof x === "object") {
            y = x.y;
            x = x.x;
        }

        var vpsz = Math.max(viewport.w, viewport.h);

        return new b2Vec2(
            (x - viewport.w * 0.5) / (this.z * vpsz) + this.x,
            (y - viewport.h * 0.5) / (this.z * vpsz) + this.y
        );

    };

};

BSWG.initCanvasContext = function(ctx) {

    ctx.fontSpacing = 1.0;
    ctx.fillTextB = function(text, x, y, noBorder) {

        if (!text || !text.trim || !text.trim().length) {
            return;
        }

        var widths = new Array(text.length);
        var total = 0.0;
        for (var i=0; i<widths.length; i++) {
            if ((i+1) < widths.length) {
                widths[i] = ctx.measureText(text.charAt(i) + '' + text.charAt(i+1)).width - 
                            ctx.measureText(text.charAt(i+1) + '').width;
                widths[i] += (ctx.fontSpacing || 0.0);
            }
            else {
                widths[i] = ctx.measureText(text.charAt(i) + '').width;
            }
            total += widths[i];
        }

        var oalign = ctx.textAlign;

        if (ctx.textAlign === 'center') {
            x -= total * 0.5;
        }
        else if (ctx.textAlign === 'right') {
            x -= total;
        }

        var x0 = x;

        ctx.textAlign = 'left';

        if (!noBorder) {
            var tmp = ctx.fillStyle;
            ctx.fillStyle = ctx.strokeStyle;
            for (var i=0; i<widths.length; i++) {
                var ch = text.charAt(i) + '';
                ctx.fillText(ch, x-2, y);
                ctx.fillText(ch, x+2, y);
                ctx.fillText(ch, x, y-2);
                ctx.fillText(ch, x, y+2);
                x += widths[i];
            }
            ctx.fillStyle = tmp;
        }

        x = x0;

        for (var i=0; i<widths.length; i++) {
            var ch = text.charAt(i) + '';
            ctx.fillText(ch, x, y);
            x += widths[i];
        }

        ctx.textAlign = oalign;
    };

};

BSWG.render = new function(){

    this.canvas = null;
    this.ctx = null;
    this.viewport = null;
    this.renderCbk = null;
    this.animFrameID = null;
    this.lastFrameTime = Date.timeStamp();
    this.dt = 1.0/60.0;
    this.time = 0.0;
    this.images = {};

    var maxRes = { w: 1920, h: 1080 };

    this.init = function(complete, images)
    {
        document.body.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.canvas.oncontextmenu = function(){ return false; };
        this.sizeViewport();
        this.ctx = this.canvas.getContext('2d');

        BSWG.initCanvasContext(this.ctx);

        this.ctx.font = '48px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#7d7';
        this.ctx.fillTextB('Loading ...', 48, this.viewport.h - 48, true);

        document.body.appendChild(this.canvas);

        this.images = images = images || {};

        var ocomplete = complete;
        var self = this;
        complete = function() {
            self.boom = new chadaboom([
                {
                    'name': 'images/explosion',
                    'size': 64,
                    'count': 4
                },
                {
                    'name': 'images/explosion',
                    'size': 128,
                    'count': 2
                },
                {
                    'name': 'images/explosion',
                    'size': 256,
                    'count': 2
                },
                {
                    'name': 'images/explosion',
                    'size': 512,
                    'count': 1
                }
            ],
            chadaboom.fire,
            function(){            
                self.blueBoom = new chadaboom([
                    {
                        'name': 'images/explosion',
                        'size': 64,
                        'count': 4
                    }
                ],
                chadaboom.blue_flame,
                function(){  
                    if (ocomplete) {
                        ocomplete();
                    }
                });
            });
        };

        var toLoad = 0;
        for (var key in images) {
            toLoad += 1;
        }
        var totalImages = toLoad;
        for (var key in images) {
            var img = new Image();
            img.src = 'images/' + images[key];
            img.onload = function() {
                toLoad -= 1;
                if (toLoad === 0) {
                    if (complete)
                        complete();
                }
            };
            images[key] = img;
        }

        if (!totalImages && complete)
            complete();
    };

    this.proceduralImage = function (w, h, cbk) {

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');

        BSWG.initCanvasContext(ctx);

        cbk(ctx, w, h);

        return canvas;

    };

    this.sizeViewport = function()
    {
        this.viewport = {
            w: Math.min(maxRes.w, window.innerWidth),
            h: Math.min(maxRes.h, window.innerHeight)
        };
        this.canvas.width = this.viewport.w;
        this.canvas.height = this.viewport.h;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    };

    this.startRenderer = function (cbk)
    {
        if (this.animFrameID !== null)
        {
            window.cancelAnimationFrame(this.animFrameID);
            this.animFrameID = null;
        }

        this.renderCbk = cbk;

        var self = this;
        var renderFrame = function ()
        {
            var frameTime = Date.timeStamp();
            self.dt = frameTime - self.lastFrameTime;
            self.lastFrameTime = frameTime;
            self.dt = Math.clamp(self.dt, 1.0/60.0, 1.0/10.0);
            self.time += self.dt;

            self.sizeViewport();
            if (self.renderCbk)
                self.renderCbk(self.dt, self.time, self.ctx);

            BSWG.input.newFrame();

            self.animFrameID = window.requestAnimationFrame(renderFrame);
        };

        self.animFrameID = window.requestAnimationFrame(renderFrame);
    };

    this.stopRenderer = function ()
    {
        if (this.animFrameID !== null)
        {
            window.cancelAnimationFrame(this.animFrameID);
            this.animFrameID = null;
        }
        this.renderCbk = null;
    };

    this.test = function ()
    {
        console.log('b');
    };

}();