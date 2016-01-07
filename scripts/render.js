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
                self.renderCbk(self.dt, self.time);

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