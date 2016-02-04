BSWG.game = new function(){

    this.test = function ()
    {
        console.log('a');
    };

    this.createNew = function ()
    {
        // Init game state

        BSWG.physics.reset();
        BSWG.componentList.clear();
        BSWG.blasterList.clear();
        this.cam = new BSWG.camera();
        this.editMode = false;
        var self = this;

        var editBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 100, h: 50,
            text: "Build Mode",
            selected: this.editMode,
            click: function (me) {
                me.selected = !me.selected;
                self.editMode = me.selected;
            }
        });
    };

    this.start = function ()
    {
        var self = this;

        var pastPositions = [ new b2Vec2(0, 0) ];
        for (var i=0; i<50; i++) {

            var p = null;
            for (var k=0; k<500; k++)
            {
                var a = Math.random() * Math.PI * 2.0;
                var r = Math.random() * 25;
                p = new b2Vec2(Math.cos(a)*r, Math.sin(a)*r);
                for (var j=0; j<pastPositions.length && p; j++) {
                    var jp = pastPositions[j];
                    if (Math.pow(jp.get_x() - p.get_x(), 2.0) + Math.pow(jp.get_y() - p.get_y(), 2.0) < 4*4)
                        p = null;
                }
                if (p)
                    break;
            }

            if (!p)
                continue;

            pastPositions.push(p);

            if (Math.random() < 1/5) 
                new BSWG.component(BSWG.component_Thruster, {

                    pos: p,
                    angle: Math.random()*Math.PI*2.0,

                });
            else if (Math.random() < 1/6)
                new BSWG.component(BSWG.component_Blaster, {

                    pos: p,
                    angle: Math.random()*Math.PI*2.0,

                });
            else
                new BSWG.component(BSWG.component_Block, {

                    pos: p,
                    angle: Math.random()*Math.PI*2.0,
                    width: Math.floor(Math.random()*3)+1,
                    height: Math.floor(Math.random()*3)+1,
                    armour: false

                });
        }

        this.ccblock = new BSWG.component(BSWG.component_CommandCenter, {

            pos: new b2Vec2(0, 0),
            angle: -Math.PI/3.5

        });

        this.stars = new BSWG.starfield();

        var wheelStart = BSWG.input.MOUSE_WHEEL_ABS() + 10;
        BSWG.input.wheelLimits(wheelStart-10, wheelStart+10);

        var grabbedBlock = null;
        var grabbedLocal = null;
        var grabbedRot = false;

        BSWG.render.startRenderer(function(dt, time){

            document.title = "BSWR - " + Math.floor(1/dt) + " fps";
            //document.title = BSWG.input.getKeyMap()[BSWG.KEY.LEFT];

            //console.log(window.__DC);
            window.__DC = 0;

            BSWG.physics.update(dt);
            BSWG.componentList.update(dt);
            BSWG.ui.update();

            var mx = BSWG.input.MOUSE('x');
            var my = BSWG.input.MOUSE('y');
            var mps = new b2Vec2(mx, my);
            var mp = self.cam.toWorld(BSWG.render.viewport, mps);

            if (self.editMode) {

                if (BSWG.input.MOUSE_PRESSED('left')) {
                    if (BSWG.componentList.mouseOver) {
                        grabbedBlock = BSWG.componentList.mouseOver;
                        if (grabbedBlock.type === 'cc' || grabbedBlock.onCC) {
                            grabbedBlock = null;
                        }
                        else {
                            grabbedLocal = grabbedBlock.getLocalPoint(mp);
                            BSWG.physics.startMouseDrag(grabbedBlock.obj.body, grabbedBlock.obj.body.GetMass()*1.75);
                        }
                    }
                }
                if (BSWG.input.MOUSE_RELEASED('left') && grabbedBlock) {
                    grabbedBlock = null;
                    [grabbedLocal].destroy();
                    grabbedLocal = null;
                    BSWG.physics.endMouseDrag();
                }

                if (grabbedBlock && BSWG.input.MOUSE('shift')) {
                    BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*0.5);
                } else if (grabbedBlock) {
                    BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*1.75);
                }
            }
            else if (grabbedBlock) {
                grabbedBlock = null;
                [grabbedLocal].destroy();
                grabbedLocal = null;
                BSWG.physics.endMouseDrag();
            }

            BSWG.componentList.handleInput(self.ccblock, BSWG.input.getKeyMap());

            var wheel = BSWG.input.MOUSE_WHEEL_ABS() - wheelStart;
            var toZ = Math.clamp(0.1 * Math.pow(1.25, wheel), 0.01, 0.25);
            self.cam.zoomTo(dt*5.0, toZ);
            self.cam.panTo(dt, self.ccblock.obj.body.GetWorldCenter());

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, viewport.w, viewport.h);

            self.stars.render(ctx, self.cam, viewport);
            BSWG.componentList.render(ctx, self.cam, dt);
            BSWG.blasterList.updateRender(ctx, self.cam, dt);

            if (grabbedBlock) {

                var gpw = grabbedBlock.getWorldPoint(grabbedLocal);
                var gp = self.cam.toScreen(viewport, gpw);

                var ccl = new b2Vec2(0.0, -0.5);
                var ccw = self.ccblock.getWorldPoint(ccl);
                var cc = self.cam.toScreen(viewport, ccw);

                ctx.lineWidth = 2.0;
                ctx.strokeStyle = 'rgba(192, 192, 255, ' + (BSWG.input.MOUSE('shift') ? 0.3 : 0.75) + ')';
                ctx.beginPath();
                ctx.moveTo(cc.get_x(), cc.get_y());
                ctx.lineTo(gp.get_x(), gp.get_y());
                ctx.lineTo(mps.get_x(), mps.get_y());
                ctx.stroke();
                
                ctx.fillStyle = ctx.strokeStyle;

                ctx.beginPath();
                ctx.arc(cc.get_x(), cc.get_y(), 5, 0, 2*Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(gp.get_x(), gp.get_y(), 5, 0, 2*Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(mps.get_x(), mps.get_y(), 5, 0, 2*Math.PI);
                ctx.fill();
                ctx.lineWidth = 1.0;

                [gpw, gp, ccl, ccw, cc].destroy();

            }

            BSWG.ui.render(ctx, viewport);

            [mp, mps].destroy();

        });
    };

}();

BSWG.starfield = function(){

    var imageCount = 32;
    var imageSize = 384;
    var images = [];
    var starSizeO = [ 1, 8 ];
    var layers = 2;

    Math.seedrandom(Date.timeStamp());

    for (var i=0; i<imageCount; i++) {
        images.push(BSWG.render.proceduralImage(imageSize, imageSize, function(ctx, w, h){

            ctx.clearRect(0, 0, w, h);

            for (var k=0; k<128; k++)
            {
                var rr = Math.random();

                if (rr < 0.7)
                    ctx.fillStyle = '#fff';
                else if (rr < 0.85)
                    ctx.fillStyle = '#f88';
                else
                    ctx.fillStyle = '#88f';

                var x = Math.random() * (w - starSizeO[1] * 2) + starSizeO[1];
                var y = Math.random() * (w - starSizeO[1] * 2) + starSizeO[1];
                var r = Math.random() * (starSizeO[1] - starSizeO[0]) + starSizeO[0];
                var l = Math.random();

                ctx.beginPath();
                ctx.arc(x, y, r, 0, 2*Math.PI);
                ctx.globalAlpha = l * 0.15;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, r*0.2, 0, 2*Math.PI);
                ctx.globalAlpha = l;
                ctx.fill();
            }

            ctx.globalAlpha = 1.0;

            if (!(i%4))
            {
                var r = Math.random();

                if (r < 1/3) ctx.fillStyle = '#f33';
                else if (r < 2/3) ctx.fillStyle = '#3f3';
                else ctx.fillStyle = '#33f';

                var L = [ [w*0.5, w*0.5, w*0.15] ];
                ctx.beginPath();
                ctx.arc(w*0.5, h*0.5, w*0.15, 0, 2*Math.PI);
                ctx.globalAlpha = 0.2;
                ctx.fill();

                for (var k=0; k<64; k++)
                {
                    var j = Math.floor(Math.random()*L.length);
                    var rr = Math.random() * L[j][2];
                    var ra = Math.random() * Math.PI * 2.0;
                    var x = L[j][0] + Math.cos(ra) * rr;
                    var y = L[j][1] + Math.sin(ra) * rr;
                    var r = Math.random() * L[j][2] * 0.25 + L[j][2] * 0.75;

                    if (x-r < 0 || y-r < 0 || x+r >= w || y+r >= h)
                        continue;

                    L.push([x, y, r]);

                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, 2*Math.PI);
                    ctx.globalAlpha = 0.1;
                    ctx.fill();
                }
            }

        }));
    }

    this.render = function(ctx, cam, viewport) {

        var vpsz = Math.max(viewport.w, viewport.h);

        for (var l=layers; l>=1; l--) {

            var sz = imageSize / l;
            var camz = 0.005 / l;
            var offx = (-cam.x * vpsz * camz);
            var offy = (-cam.y * vpsz * camz);
            var ix = Math.floor(offx / sz);
            var iy = Math.floor(offy / sz);
            offx -= ix * sz;
            offy -= iy * sz;
            var cx = ((offx-imageSize) - viewport.w * 0.5) / (camz * vpsz) + cam.x;
            var cy = ((offy-imageSize) - viewport.h * 0.5) / (camz * vpsz) + cam.y;

            cx = Math.floor(cx / (imageSize / (vpsz * camz)));
            cy = Math.floor(cy / (imageSize / (vpsz * camz)));

            if (l === 2) {
                offx = offy = cx = cy = 0; // 2nd layer fixed in position as temp-fix to bug
            }

            ctx.globalAlpha = 1/(l*l);

            var _cx=cx;
            for (var x=offx-sz; x<viewport.w; x+=sz) {

                var _cy=cy;
                for (var y=offy-sz; y<viewport.h; y+=sz) {

                    var k = Math.floor(Math.abs((_cx+1000) * 13 + (_cy+1000) * 7));
                    ctx.drawImage(images[k % images.length], x, y, sz, sz);
                    _cy += 1;
                }
                _cx += 1;
            }
        }

        ctx.globalAlpha = 1.0;

    };

};
