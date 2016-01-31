BSWG.camera = function() {

    this.x = 0;
    this.y = 0;
    this.z = 0.01;

    this.panTo = function (dt, x, y) {

        if (typeof x === "object") {
            y = x.get_y();
            x = x.get_x();
        }

        this.x += (x - this.x) * Math.min(dt, 1.0);
        this.y += (y - this.y) * Math.min(dt, 1.0);
    };

    this.zoomTo = function (dt, z) {

        this.z += (z - this.z) * Math.min(dt, 1.0);
    };

    this.toScreenList = function (viewport, list) {

        var vpsz = Math.max(viewport.w, viewport.h);
        var ret = [];
        for (var i=0, len=list.length; i<len; i++)
        {
            ret.push(new b2Vec2(
                (list[i].get_x() - this.x) * this.z * vpsz + viewport.w * 0.5,
                (list[i].get_y() - this.y) * this.z * vpsz + viewport.h * 0.5
            ));
        }
        return ret;

    };

    this.toScreen = function (viewport, x, y) {

        if (typeof x === "object") {
            y = x.get_y();
            x = x.get_x();
        }

        var vpsz = Math.max(viewport.w, viewport.h);

        return new b2Vec2(
            (x - this.x) * this.z * vpsz + viewport.w * 0.5,
            (y - this.y) * this.z * vpsz + viewport.h * 0.5
        );

    };

    this.toWorld = function (viewport, x, y) {

        if (typeof x === "object") {
            y = x.get_y();
            x = x.get_x();
        }

        var vpsz = Math.max(viewport.w, viewport.h);

        return new b2Vec2(
            (x - viewport.w * 0.5) / (this.z * vpsz) + this.x,
            (y - viewport.h * 0.5) / (this.z * vpsz) + this.y
        );

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

    var maxRes = { w: 1920, h: 1080 };

    this.init = function(complete)
    {
        document.body.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.sizeViewport();
        this.ctx = this.canvas.getContext('2d');

        document.body.appendChild(this.canvas);

        if (complete)
            complete();
    };

    this.proceduralImage = function (w, h, cbk) {

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.style.position = 'fixed';
        canvas.style.top = '200%';
        canvas.style.left = '0px';
        var ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);

        cbk(ctx, w, h);

        document.body.removeChild(canvas);

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
            self.dt = self.lastFrameTime - frameTime;
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