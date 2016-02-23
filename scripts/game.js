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
        for (var i=0; i<100; i++) {

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
            else if (i<(8+12)) {
                new BSWG.component(BSWG.component_SawBlade, {

                    pos: p,
                    angle: Math.random()*Math.PI*2.0,
                    size: Math.floor(i%3)+1

                });                
            }
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

        BSWG.render.setCustomCursor(true);

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
    var dustImageSize = 512;
    var dustImages = [];

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

            for (var k=0; k<90; k++) {
                ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
            }

        }));
    }

    var merge = function(imgList, iw, ih) { return function(ctx, w, h) {

        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = 1.0;

        for (var i=0; i<imgList.length; i++) {
            var x = i % (w/iw);
            var y = (i-x) / (w/ih);
            ctx.drawImage(imgList[i], x*iw, y*ih);
        }

    } };; 

    var starImgMerge = BSWG.render.proceduralImage(2048, 2048, merge(starImg, 512, 512));
    var nebulaImgMerge = BSWG.render.proceduralImage(2048, 2048, merge(nebulaImg, 512, 512));
    var dustImgMerge = BSWG.render.proceduralImage(2048, 2048, merge(dustImages, 512, 512));

    nebulaImgMerge.texture.wrapS = THREE.ClampToEdgeWrapping;
    nebulaImgMerge.texture.wrapT = THREE.ClampToEdgeWrapping;
    nebulaImgMerge.texture.magFilter = THREE.NearestFilter;
    nebulaImgMerge.texture.minFilter = THREE.LinearFilter;
    nebulaImgMerge.texture.needsUpdate = true;

    var bgGeom = new THREE.PlaneGeometry(2.0, 2.0, 1, 1);

    var bgMat = BSWG.render.newMaterial("bgVertex", "bgFragment", {
        cam: {
            type: 'v3',
            value: new THREE.Vector3(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z)
        },
        vp: {
            type: 'v2',
            value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
        },
        tStars: {
            type: 't',
            value: starImgMerge.texture
        },
        tNebula: {
            type: 't',
            value: nebulaImgMerge.texture
        },
        tDust: {
            type: 't',
            value: dustImgMerge.texture
        }
    });

    var bgMesh = new THREE.Mesh( bgGeom, bgMat );
    bgMesh.frustumCulled = false;
    bgMesh.position.set(-1.0, -1.0, -0.5);
    bgMesh.updateMatrix();
    
    bgMesh.needsUpdate = true;
    bgMat.needsUpdate = true;        
    
    BSWG.render.scene.add( bgMesh );

    this.render = function(ctx, cam, viewport) {

        bgMat.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z);
        bgMat.uniforms.vp.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);

    };

};
