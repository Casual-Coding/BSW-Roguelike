BSWG.grabSlowdownDist = 0.5;
BSWG.grabSlowdownDistStart = 3.0;

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
        this.showControls = false;
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

        this.showControlsBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10 + 150 + 10, y: 10,
            w: 200, h: 50,
            text: "Show Controls",
            selected: this.showControls,
            click: function (me) {
                me.selected = !me.selected;
                self.showControls = me.selected;
            }
        });
    };

    this.start = function ()
    {
        var self = this;

        Math.seedrandom();

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

        var blackoutT = 1.0;

        BSWG.render.startRenderer(function(dt, time){

            var wheel = BSWG.input.MOUSE_WHEEL_ABS() - wheelStart;
            var toZ = Math.clamp(0.1 * Math.pow(1.25, wheel), 0.01, 0.25) / (1.0+self.ccblock.obj.body.GetLinearVelocity().Length()*0.1);
            self.cam.zoomTo(dt*2.5, toZ);
            self.cam.panTo(dt*2.0, self.ccblock.obj.body.GetWorldCenter());
            BSWG.render.updateCam3D(self.cam);

            document.title = "BSWR - " + Math.floor(1/dt) + " fps";

            BSWG.ui.update();
            BSWG.physics.update(dt);
            BSWG.componentList.update(dt);

            var mx = BSWG.input.MOUSE('x');
            var my = BSWG.input.MOUSE('y');
            var mps = new b2Vec2(mx, my);
            var mp = BSWG.render.unproject3D(mps, 0.0);

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
                            grabbedBlock.obj.body.SetLinearDamping(0.5);
                            grabbedBlock.obj.body.SetAngularDamping(0.25);
                        }
                    }
                }
                if (BSWG.input.MOUSE_RELEASED('left') && grabbedBlock) {
                    grabbedBlock.obj.body.SetLinearDamping(0.1);
                    grabbedBlock.obj.body.SetAngularDamping(0.1);
                    grabbedBlock = null;
                    grabbedLocal = null;
                    BSWG.physics.endMouseDrag();
                }

                if (grabbedBlock && BSWG.input.KEY_DOWN(BSWG.KEY.SHIFT)) {
                    grabbedBlock.obj.body.SetAngularDamping(1.0);
                    grabbedBlock.obj.body.SetLinearDamping(10.0);
                } else if (grabbedBlock) {
                    grabbedBlock.obj.body.SetAngularDamping(0.1);
                    grabbedBlock.obj.body.SetLinearDamping(0.1);
                    
                    var dist = Math.distVec2(grabbedBlock.getWorldPoint(grabbedLocal), BSWG.physics.mousePosWorld());
                    if (dist < BSWG.grabSlowdownDistStart) {
                        var t = Math.pow(1.0 - Math.clamp((dist - BSWG.grabSlowdownDist) / (BSWG.grabSlowdownDistStart - BSWG.grabSlowdownDist), 0, 1), 2.0);
                        BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*1.75*(1.0+t*0.5));
                        grabbedBlock.obj.body.SetLinearDamping(0.1 + 2.0*t);
                        grabbedBlock.obj.body.SetAngularDamping(0.1 + 2.0*t);
                    }
                    else {
                        BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*1.75);
                    }
                }
            }
            else if (grabbedBlock) {
                grabbedBlock.obj.body.SetLinearDamping(0.1);
                grabbedBlock.obj.body.SetAngularDamping(0.1);
                grabbedBlock = null;
                grabbedLocal = null;
                BSWG.physics.endMouseDrag();
            }

            self.grabbedBlock = grabbedBlock;

            BSWG.componentList.handleInput(self.ccblock, BSWG.input.getKeyMap());

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;

            self.stars.render(ctx, self.cam, viewport);
            BSWG.componentList.render(ctx, self.cam, dt);
            BSWG.blasterList.updateRender(ctx, self.cam, dt);
            BSWG.render.blueBoom.render(ctx, dt);
            BSWG.render.boom.render(ctx, dt);

            if (grabbedBlock) {

                self.ccblock.grabT = 0.19;

                var gpw = grabbedBlock.getWorldPoint(grabbedLocal);
                var gp = BSWG.render.project3D(gpw);

                var ccl = new b2Vec2(0.0, 0.6);
                var ccw = self.ccblock.getWorldPoint(ccl);
                var cc = BSWG.render.project3D(ccw);

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

            if (blackoutT >= 0) {
                ctx.globalAlpha = Math.min(blackoutT, 1.0);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, viewport.w, viewport.h);
                ctx.globalAlpha = 1.0;
                blackoutT -= dt * 1.5;
            }
            else {
                blackoutT = 0.0;
            }

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

            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#fff';

            for (var k=0; k<60; k++) {
                ctx.fillRect(Math.random()*w, Math.random()*h, 4, 4);
            }

        }));
    }

    var bgImg = [],
        bgImgCount = 0,
        bgGeom = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

    var addBgImg = function(img, x, y, z, w, h, a, clr, cull) {

        if (true) {
            if ((x+w) < 0 || (y+h) < 0 || x >= BSWG.render.viewport.w || y >= BSWG.render.viewport.h) {
                return;
            }
        }

        x += w * 0.5;
        y += h * 0.5;

        var x1 = 2 * (x / BSWG.render.viewport.w) - 1;
        var y1 = 1 - 2 * (y / BSWG.render.viewport.h);

        w = Math.abs(w/BSWG.render.viewport.w) * 2.0;
        h = Math.abs(h/BSWG.render.viewport.h) * 2.0;

        if (bgImgCount < bgImg.length) { // replace
            var obj = bgImg[bgImgCount];
            obj.mat.uniforms.pos.value.set(x1, y1, z);
            obj.mat.uniforms.sza.value.set(w, h, a);
            obj.mat.uniforms.clr.value.set(clr[0], clr[1], clr[2], clr[3]);
            obj.mat.uniforms.img.value = img.texture;
            obj.mat.needsUpdate = true;
            bgImgCount ++;
        }
        else { // add new
            var obj = new Object();
            obj.geom = bgGeom;
            obj.mat = BSWG.render.newMaterial("bgVertex", "bgFragment", {
                pos: {
                    type: 'v3',
                    value: new THREE.Vector3(x1, y1, z)
                },
                sza: {
                    type: 'v3',
                    value: new THREE.Vector3(w, h, a)
                },
                clr: {
                    type: 'v4',
                    value: new THREE.Vector4(clr[0], clr[1], clr[2], clr[3])
                },
                img: {
                    type: 't',
                    value: img.texture
                }
            }, THREE.AdditiveBlending);

            obj.mesh = new THREE.Mesh( obj.geom, obj.mat );
            obj.mesh.frustumCulled = false;

            obj.mesh.needsUpdate = true;
            obj.mat.needsUpdate = true;
            
            BSWG.render.scene.add( obj.mesh );

            bgImg.push(obj);
            bgImgCount ++;
        }

    };

    this.render = function(ctx, cam, viewport) {

        //Math.seedrandom();

        var oz = cam.z;

        bgImgCount = 0;

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
                    var w = Math.abs(ps[1].x - ps[0].x),
                        h = Math.abs(ps[1].y - ps[0].y);
                    var k = Math.floor(Math.random2d(x*13.5+97*l*l, y*7.431+55*l*l) * 1000000);
                    if (l>1 && (~~(k/37))%[2,5][l-2] === 0) {
                        var r1 = (k%100)/100;
                        var r2 = ((k+371)%1000)/1000;
                        var nimg = nebulaImg[k % nebulaImg.length];
                        var sz = (r1*([1.7, 6.0][l-2])+0.5)*Math.min(w,h);
                        addBgImg(nimg, ps[0].x, ps[0].y, l, sz, sz, Math.PI*2.0*r2, [1,1,1,0.3*alpha]);
                    }
                    addBgImg(img[k % img.length], ps[0].x, ps[0].y, l, w, h, 0.0, [1,1,1,[0.4, 0.4, 0.95][l-1] * alpha], true);
                }
            }

            ctx.globalAlpha = 1.0;
        }

        cam.z = oz;

        while (bgImgCount < bgImg.length) {
            var mesh = bgImg[bgImgCount].mesh;
            BSWG.render.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            mesh.geometry = null;
            mesh.material = null;
            mesh = null;
            bgImg[bgImgCount].mesh = null;
            bgImg[bgImgCount].mat = null;
            bgImg[bgImgCount] = null;
            bgImg.splice(bgImgCount, 1);
        }

    };

};
