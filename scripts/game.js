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

        this.editBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 150, h: 50,
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
        for (var i=0; i<88; i++) {

            var p = null;
            for (var k=0; k<500; k++)
            {
                var a = Math.random() * Math.PI * 2.0;
                var r = Math.random() * 32;
                p = new b2Vec2(Math.cos(a)*r, Math.sin(a)*r);
                for (var j=0; j<pastPositions.length && p; j++) {
                    var jp = pastPositions[j];
                    if (Math.pow(jp.x - p.x, 2.0) + Math.pow(jp.y - p.y, 2.0) < 4*4)
                        p = null;
                }
                if (p)
                    break;
            }

            if (!p)
                continue;

            pastPositions.push(p);

            if (i<8)
                new BSWG.component(BSWG.component_HingeHalf, {

                    pos: p,
                    angle: Math.random()*Math.PI*2.0,
                    size: Math.floor(Math.floor(i/2)%2)+1,
                    motor: Math.floor(i%2) === 0,

                });
            else if (Math.random() < 1/5)
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
                    triangle: Math.random() < 0.4 ? (Math.random() < 0.5 ? -1 : 1) : 0.0,
                    armour: false

                });
        }

        this.ccblock = new BSWG.component(BSWG.component_CommandCenter, {

            pos: new b2Vec2(0, 0),
            angle: -Math.PI/3.5

        });

        this.stars = new BSWG.starfield();

        var wheelStart = BSWG.input.MOUSE_WHEEL_ABS() + 10;
        BSWG.input.wheelLimits(wheelStart-10, wheelStart-2);

        var grabbedBlock = null;
        var grabbedLocal = null;
        var grabbedRot = false;

        BSWG.render.startRenderer(function(dt, time){

            document.title = "BSWR - " + Math.floor(1/dt) + " fps";

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
                    grabbedLocal = null;
                    BSWG.physics.endMouseDrag();
                }

                if (grabbedBlock && BSWG.input.KEY_DOWN(BSWG.KEY.SHIFT)) {
                    BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*0.5);
                } else if (grabbedBlock) {
                    BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*1.75);
                }
            }
            else if (grabbedBlock) {
                grabbedBlock = null;
                grabbedLocal = null;
                BSWG.physics.endMouseDrag();
            }

            BSWG.componentList.handleInput(self.ccblock, BSWG.input.getKeyMap());

            var wheel = BSWG.input.MOUSE_WHEEL_ABS() - wheelStart;
            var toZ = Math.clamp(0.1 * Math.pow(1.25, wheel), 0.01, 0.25) / (1.0+self.ccblock.obj.body.GetLinearVelocity().Length()*0.1);
            self.cam.zoomTo(dt*2.5, toZ);
            self.cam.panTo(dt*2.0, self.ccblock.obj.body.GetWorldCenter());

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, viewport.w, viewport.h);

            self.stars.render(ctx, self.cam, viewport);
            BSWG.componentList.render(ctx, self.cam, dt);
            BSWG.blasterList.updateRender(ctx, self.cam, dt);
            BSWG.render.blueBoom.render(ctx, dt);
            BSWG.render.boom.render(ctx, dt);

            if (grabbedBlock) {

                var gpw = grabbedBlock.getWorldPoint(grabbedLocal);
                var gp = self.cam.toScreen(viewport, gpw);

                var ccl = new b2Vec2(0.0, -0.5);
                var ccw = self.ccblock.getWorldPoint(ccl);
                var cc = self.cam.toScreen(viewport, ccw);

                ctx.lineWidth = 2.0;
                ctx.strokeStyle = 'rgba(192, 192, 255, ' + (BSWG.input.MOUSE('shift') ? 0.3 : 0.75) + ')';
                ctx.beginPath();
                ctx.moveTo(cc.x, cc.y);
                ctx.lineTo(gp.x, gp.y);
                ctx.lineTo(mps.x, mps.y);
                ctx.stroke();
                
                ctx.fillStyle = ctx.strokeStyle;

                ctx.beginPath();
                ctx.arc(cc.x, cc.y, 5, 0, 2*Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(gp.x, gp.y, 5, 0, 2*Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(mps.x, mps.y, 5, 0, 2*Math.PI);
                ctx.fill();
                ctx.lineWidth = 1.0;

            }

            self.editBtn.x = 10;
            self.editBtn.y = 10;

            BSWG.ui.render(ctx, viewport);

        });
    };

}();

BSWG.starfield = function(){

    var dustCount = 16;
    var dustImageSize = 1024;
    var dustImages = [];
    var starSizeO = [ 1, 8 ];
    var layers = 2;

    var starImg = [];
    for (var i=0; i<15; i++) {
        starImg.push(BSWG.render.images['stars_' + i]);
    }
    var nebulaImg = [];
    for (var i=0; i<15; i++) {
        nebulaImg.push(BSWG.render.images['nebula_' + i]);
    }

    Math.seedrandom(666);

    for (var i=0; i<dustCount; i++) {
        dustImages.push(BSWG.render.proceduralImage(dustImageSize, dustImageSize, function(ctx, w, h){

            ctx.clearRect(0, 0, w, h);

            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#bbb';

            for (var k=0; k<185; k++) {
                ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
            }

        }));
    }

    this.render = function(ctx, cam, viewport) {

        var oz = cam.z;

        for (var l=3; l>=1; l--) {

            var t = (l-1)/2;
            cam.z = (oz*(1.0-t) + t*0.1) / Math.pow(l, 5.0);
            var alpha = 1.0/Math.pow(Math.max(1, l-1), 2.0);

            var tsize = [25, 150, 225][l-1];

            var p1 = cam.toWorld(viewport, new b2Vec2(0, 0));
            var p2 = cam.toWorld(viewport, new b2Vec2(viewport.w, viewport.h));
            p1.x = (Math.floor(p1.x / tsize)-6) * tsize;
            p1.y = (Math.floor(p1.y / tsize)-6) * tsize;
            p2.x = (Math.floor(p2.x / tsize)+7) * tsize;
            p2.y = (Math.floor(p2.y / tsize)+7) * tsize;

            var img = l === 1 ? dustImages : starImg;

            var p = new b2Vec2(p1.x, p1.y);
            for (p.x = p1.x; p.x <= p2.x; p.x += tsize) {
                for (p.y = p1.y; p.y <= p2.y; p.y += tsize) {
                    var x = p.x / tsize, y = p.y / tsize;
                    var ps = cam.toScreenList(viewport, [p, new b2Vec2(p.x+tsize, p.y+tsize)]);
                    var w = ps[1].x - ps[0].x,
                        h = ps[1].y - ps[0].y;
                    var k = Math.floor(Math.random2d(x*13.5+97*l*l, y*7.431+55*l*l) * 1000000);
                    if (l>1 && (~~(k/37))%[2,5][l-2] === 0) {
                        var r1 = (k%100)/100;
                        var r2 = ((k+371)%1000)/1000;
                        var nimg = nebulaImg[k % nebulaImg.length];
                        var sz = (r1*([1.7, 6.0][l-2])+0.5)*Math.min(w,h);
                        ctx.save();
                        ctx.translate(ps[0].x, ps[0].y);
                        ctx.rotate(Math.PI*2.0*r2);
                        ctx.translate(-sz*0.5, -sz*0.5);
                        ctx.globalAlpha = 0.3 * alpha;
                        ctx.drawImage(nimg, 0, 0, nimg.width, nimg.height, 0, 0, sz, sz);
                        ctx.restore();
                    }
                    ctx.globalAlpha = [0.4, 0.4, 0.95][l-1] * alpha;
                    ctx.drawImage(img[k % img.length], ps[0].x, ps[0].y, w, h);
                }
            }

            ctx.globalAlpha = 1.0;
        }

        cam.z = oz;

    };

};
