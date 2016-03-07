BSWG.grabSlowdownDist      = 0.5;
BSWG.grabSlowdownDistStart = 3.0;
BSWG.maxGrabDistance       = 45.0;
BSWG.mouseLookFactor       = 0.0; // 0 to 0.5
BSWG.camVelLookBfr         = 0.1; // * viewport.w

BSWG.SCENE_TITLE = 1;
BSWG.SCENE_GAME1 = 2;

BSWG.game = new function(){

    this.test = function ()
    {
        console.log('a');
    };

    this.scene = null;
    this.switchScene = null;

    this.changeScene = function (scene, args, fadeColor, fadeTime, force) {

        if (this.switchScene && !force) {
            return;
        }

        fadeColor = fadeColor || '#000';
        fadeTime = fadeTime || 1.5;

        var fadeTimeOut = fadeTime;

        this.switchScene = {
            color: fadeColor,
            timeOut: fadeTimeOut,
            newScene: scene,
            newArgs: args,
            timeIn: fadeTime,
            fadeTime: fadeTime
        };

        if (this.scene === null) {
            this.switchScene.timeOut = 0.0;
            this.switchScene.newScene = null;
            this.initScene(scene, args);
        }

    };

    var wheelStart = 0;

    this.initScene = function (scene, args)
    {
        // Init game state

        args = args || {};
        this.scene = scene;

        BSWG.physics.reset();
        BSWG.componentList.clear();
        BSWG.blasterList.clear();
        BSWG.planets.init();
        BSWG.ui.clear();

        this.map = null;
        this.mapImage = null;
        this.ccblock = null;
        this.cam = new BSWG.camera();
        BSWG.render.updateCam3D(this.cam);
        this.editMode = false;
        this.showControls = false;

        if (!this.stars) {
            this.stars = new BSWG.starfield();
        }

        if (this.nebulas) {
            this.nebulas.destroy();
            this.nebulas = null;
        }

        var self = this;
        Math.seedrandom();

        var startPos = new b2Vec2(0, 0);

        wheelStart = BSWG.input.MOUSE_WHEEL_ABS() + 10;
        BSWG.input.wheelLimits(wheelStart-10, wheelStart-2);

        switch (scene) {
            case BSWG.SCENE_TITLE:

                this.cam.z *= 1.5;

                this.title1 = new BSWG.uiControl(BSWG.control_3DTextButton, {
                    x: BSWG.render.viewport.w*0.5, y: 80,
                    w: 800, h: 100,
                    vpXCenter: true,
                    text: "BlockShip Wars",
                    color: [0.85, 0.85, 0.85, 1],
                    hoverColor: [0.85, 0.85, 0.85, 1],
                    click: function (me) {
                    }
                });
                this.title2 = new BSWG.uiControl(BSWG.control_3DTextButton, {
                    x: BSWG.render.viewport.w*0.5, y: 145,
                    w: 800, h: 100,
                    vpXCenter: true,
                    text: "r o g u e l i k e",
                    color: [0.4, 0.4, 0.85, 1.0],
                    hoverColor: [0.4, 0.4, 0.85, 1.0],
                    click: function (me) {
                    }
                });

                this.newGameBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                    x: BSWG.render.viewport.w*0.5, y: 350,
                    w: 400, h: 70,
                    vpXCenter: true,
                    text: "New Game",
                    color: [0.35, 0.6, 1., 1.0],
                    hoverColor: [0.95, 0.95, 0.95, 1.0],
                    click: function (me) {
                        self.changeScene(BSWG.SCENE_GAME1, {}, '#000', 0.75);
                    }
                });
                this.sandBoxBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                    x: BSWG.render.viewport.w*0.5, y: 350+70,
                    w: 400, h: 70,
                    vpXCenter: true,
                    text: "Sandbox",
                    color: [0.35, 0.6, 1., 1.0],
                    hoverColor: [0.95, 0.95, 0.95, 1.0],
                    click: function (me) {
                        self.changeScene(BSWG.SCENE_GAME2, {}, '#000', 0.75);
                    }
                });
                this.optionsBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                    x: BSWG.render.viewport.w*0.5, y: 350+140,
                    w: 400, h: 70,
                    vpXCenter: true,
                    text: "Options",
                    color: [0.35*0.75, 0.6*0.75, 1.*0.75, 1.0],
                    hoverColor: [0.3, 0.3, 0.3, 1.0],
                    click: function (me) {
                        //self.changeScene(BSWG.SCENE_GAME1, {}, '#fff');
                    }
                });

                var r = 500;
                var n = 5;
                this.panPositions = [];
                for (var i=0; i<n; i++) {
                    var a = i/n*Math.PI*2.0;
                    var t = i;
                    if (t >= BSWG.planet_MOON) {
                        t += 1;
                    }
                    var pos = new THREE.Vector3(Math.cos(a)*r, Math.sin(a)*r, 0.0);
                    this.panPositions.push(pos);
                    BSWG.planets.add({pos: pos, type: t});
                }
                this.curPanPos = 0;
                this.panPosTime = this.panPosStartTime = 20.0;
                break;

            case BSWG.SCENE_GAME1:

                this.map = BSWG.genMap(128, 30, 8);
                Math.seedrandom();
                for (var i=0; i<this.map.planets.length; i++) {
                    var planet = BSWG.planets.add({pos: this.map.planets[i].worldP.THREE()});
                    this.map.planets[i].pobj = planet;
                }
                startPos = this.map.planets[0].worldP.clone();
                this.map.planets[0].pobj.capture();
                this.mapImage = BSWG.render.proceduralImage(this.map.size, this.map.size, function(ctx, w, h){
                });
                this.nebulas = new BSWG.nebulas(this.map);

            case BSWG.SCENE_GAME2:
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
                this.anchorBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 150 + 10, y: 10,
                    w: 150, h: 50,
                    text: "Anchor",
                    selected: false,
                    click: function (me) {
                        if (self.ccblock)
                        {
                            self.ccblock.anchored = !self.ccblock.anchored;
                            me.selected = self.ccblock.anchored;
                        }
                    }
                });
                this.showControlsBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 150 + 10 + 150 + 10, y: 10,
                    w: 200, h: 50,
                    text: "Show Controls",
                    selected: this.showControls,
                    click: function (me) {
                        me.selected = !me.selected;
                        self.showControls = me.selected;
                    }
                });
                this.exitBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10, y: 10,
                    w: 100, h: 50,
                    text: "Exit",
                    selected: this.editMode,
                    click: function (me) {
                        self.changeScene(BSWG.SCENE_TITLE, {}, '#000', 0.75);
                    }
                });

                this.saveBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 150 + 10 + 150 + 10, y: 10,
                    w: 110, h: 50,
                    text: "Save",
                    selected: false,
                    click: function (me) {
                    }
                });
                this.healBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10, y: 10,
                    w: 110, h: 50,
                    text: "Repair",
                    selected: false,
                    click: function (me) {
                    }
                });

                this.saveBtn.remove();
                this.healBtn.remove();
                this.saveHealAdded = false;

                if (scene === BSWG.SCENE_GAME2) {
                    BSWG.planets.add({});
                }

                var count = scene === BSWG.SCENE_GAME1 ? 44+3 : 125+3;

                var pastPositions = [ new b2Vec2(0, 0) ];
                for (var i=0; i<count; i++) {

                    var p = null;
                    for (var k=0; k<500; k++)
                    {
                        var a = Math.random() * Math.PI * 2.0;
                        var r;
                        if (scene === BSWG.SCENE_GAME1) {
                            r = Math.random() * 10 + 12;
                        }
                        else {
                            r = Math.random() * 26 + 12;
                        }
                        p = new b2Vec2(Math.cos(a)*r+startPos.x, Math.sin(a)*r+startPos.y);
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

                    if (scene === BSWG.SCENE_GAME1) {

                        if (i<4)
                            new BSWG.component(BSWG.component_HingeHalf, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,
                                size: Math.floor(Math.floor(i/2)%2)+1,
                                motor: Math.floor(i%2) === 0,

                            });
                        else if (i<(4+4)) {
                            new BSWG.component(BSWG.component_Spikes, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,
                                size: Math.floor(i%2)+1,
                                pike: true

                            });
                        }
                        else if (i<(4+4+6)) {
                            new BSWG.component(BSWG.component_Thruster, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,

                            });
                        }
                        else if (i<(4+4+6+3)) {
                            new BSWG.component(BSWG.component_Blaster, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,

                            });
                        }
                        else {
                            var k = (i - (4+6+3+4)) % 14;
                            switch (k) {
                                case 0:
                                case 1:
                                    new BSWG.component(BSWG.component_Block, {
                                        pos: p, angle: Math.random()*Math.PI*2.0,
                                        width: 2, height: 2, triangle: 0,
                                    });
                                    break;
                                case 2:
                                case 3:
                                    new BSWG.component(BSWG.component_Block, {
                                        pos: p, angle: Math.random()*Math.PI*2.0,
                                        width: 1, height: 2, triangle: 0,
                                    });
                                    break;
                                case 4:
                                case 5:
                                    new BSWG.component(BSWG.component_Block, {
                                        pos: p, angle: Math.random()*Math.PI*2.0,
                                        width: 1, height: 2, triangle: 1,
                                    });
                                    break;
                                case 6:
                                case 7:
                                    new BSWG.component(BSWG.component_Block, {
                                        pos: p, angle: Math.random()*Math.PI*2.0,
                                        width: 2, height: 1, triangle: 1,
                                    });
                                    break;
                                case 8:
                                case 9:
                                case 10:
                                case 11:
                                    new BSWG.component(BSWG.component_Block, {
                                        pos: p, angle: Math.random()*Math.PI*2.0,
                                        width: 1, height: 1, triangle: 0,
                                    });
                                    break;                
                                case 12:
                                case 13:
                                    new BSWG.component(BSWG.component_Block, {
                                        pos: p, angle: Math.random()*Math.PI*2.0,
                                        width: 2, height: 2, triangle: 1,
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    else {
                        if (i<(6)) {
                            new BSWG.component(BSWG.component_DetacherLauncher, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,
                                size: (i%3) + 1,
                                
                            });   
                        }
                        else if (i<(8+6)) {
                            new BSWG.component(BSWG.component_HingeHalf, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,
                                size: Math.floor(Math.floor(i/2)%2)+1,
                                motor: Math.floor(i%2) === 0,

                            });
                        }
                        else if (i<(8+6+12)) {
                            new BSWG.component(BSWG.component_SawBlade, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,
                                size: Math.floor(i%3)+1

                            });
                        }
                        else if (i<(8+6+24)) {
                            new BSWG.component(BSWG.component_SawMotor, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,
                                size: Math.floor(i%3)+1

                            });
                        }
                        else if (i<(8+6+36)) {
                            new BSWG.component(BSWG.component_Spikes, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,
                                size: Math.floor(i%3)+1,
                                pike: (i%2) ? true : false

                            });
                        }
                        else if (i<(8+6+48)) {
                            new BSWG.component(BSWG.component_ChainLink, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,

                            });
                        }
                        else if (Math.random() < 1/5)
                            new BSWG.component(BSWG.component_Thruster, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,

                            });
                        else if (Math.random() < 1/7)
                            new BSWG.component(BSWG.component_Blaster, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,

                            });
                        else if (Math.random() < 1/8)
                            new BSWG.component(BSWG.component_MissileLauncher, {

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
                }

                this.ccblock = new BSWG.component(BSWG.component_CommandCenter, {

                    pos: startPos.clone(),
                    angle: -Math.PI/3.5

                });

                self.cam.x = startPos.x;
                self.cam.y = startPos.y;
                BSWG.render.updateCam3D(self.cam);
                break;

            default:
                break;
        }

    };

    this.start = function ()
    {
        var self = this;

        var grabbedBlock = null;
        var grabbedLocal = null;
        var grabbedRot = false;

        BSWG.render.setCustomCursor(true);
        BSWG.input.emulateMouseWheel([BSWG.KEY['-'], BSWG.KEY['NUMPAD -']], [BSWG.KEY['='], BSWG.KEY['NUMPAD +']], 2);

        BSWG.render.startRenderer(function(dt, time){

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;
            
            document.title = "BSWR - " + Math.floor(1/BSWG.render.actualDt) + " fps";

            var mx = BSWG.input.MOUSE('x');
            var my = BSWG.input.MOUSE('y');
            var mps = new b2Vec2(mx, my);
            var mp = BSWG.render.unproject3D(mps, 0.0);

            switch (self.scene) {
                case BSWG.SCENE_TITLE:
                    self.panPosTime -= dt;
                    if (self.panPosTime < 0.0) {
                        self.curPanPos = (self.curPanPos + 1) % self.panPositions.length;
                        self.panPosTime = self.panPosStartTime;
                    }
                    self.cam.panTo(dt*0.5, self.panPositions[self.curPanPos]);
                    break;

                case BSWG.SCENE_GAME1:
                case BSWG.SCENE_GAME2:
                    var wheel = BSWG.input.MOUSE_WHEEL_ABS() - wheelStart;
                    var toZ = Math.clamp(0.1 * Math.pow(1.25, wheel), 0.01, 0.25) / Math.min(1.0+self.ccblock.obj.body.GetLinearVelocity().Length()*0.1, 1.5);
                    self.cam.zoomTo(dt*2.5, toZ);
                    var ccp = self.ccblock.obj.body.GetWorldCenter().clone();
                    var p = self.ccblock.obj.body.GetWorldCenter().clone();
                    p.x += self.ccblock.obj.body.GetLinearVelocity().x * 0.5;
                    p.y += self.ccblock.obj.body.GetLinearVelocity().y * 0.5;

                    var bfr = BSWG.camVelLookBfr * viewport.w;
                    var p1 = BSWG.render.unproject3D(new b2Vec2(bfr, bfr));
                    var pc = BSWG.render.unproject3D(new b2Vec2(viewport.w*0.5, viewport.h*0.5));
                    var p2 = BSWG.render.unproject3D(new b2Vec2(viewport.w-bfr, viewport.h-bfr));
                    var w = Math.abs(Math.max(p1.x, p2.x) - pc.x);
                    var h = Math.abs(Math.max(p1.y, p2.y) - pc.y);

                    p.x = Math.clamp(p.x, ccp.x - w, ccp.x + w);
                    p.y = Math.clamp(p.y, ccp.y - h, ccp.y + h);

                    self.cam.panTo(dt*8.0*(self.ccblock.anchored ? 0.15 : 1.0), Math.interpolate(mp, p, 1.0-BSWG.mouseLookFactor));
                    break;

                default:
                    break;
            }

            BSWG.render.updateCam3D(self.cam);
            BSWG.ui.update();
            BSWG.physics.update(dt);
            BSWG.componentList.update(dt);
            BSWG.planets.render(dt);

            switch (self.scene) {
                case BSWG.SCENE_TITLE:
                    break;

                case BSWG.SCENE_GAME1:
                case BSWG.SCENE_GAME2:

                    if (self.editMode) {

                        if (BSWG.input.MOUSE_PRESSED('left')) {
                            if (BSWG.componentList.mouseOver) {
                                grabbedBlock = BSWG.componentList.mouseOver;
                                if (grabbedBlock.type === 'cc' || (grabbedBlock.onCC && (!grabbedBlock.canMoveAttached || grabbedBlock.onCC !== self.ccblock)) || grabbedBlock.distanceTo(self.ccblock) > BSWG.maxGrabDistance) {
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
                        if (grabbedBlock && (BSWG.input.MOUSE_RELEASED('left') || grabbedBlock.distanceTo(self.ccblock) > BSWG.maxGrabDistance)) {
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
                    break;

                default:
                    break;
            }

            self.stars.render(ctx, self.cam, viewport);
            if (self.nebulas) {
                self.nebulas.render(ctx, self.cam, viewport);
            }
            BSWG.componentList.render(ctx, self.cam, dt);
            BSWG.blasterList.updateRender(ctx, self.cam, dt);
            BSWG.render.boom.render(dt);

            switch (self.scene) {
                case BSWG.SCENE_TITLE:
                    break;

                case BSWG.SCENE_GAME1:
                case BSWG.SCENE_GAME2:

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

                    self.exitBtn.p.x = BSWG.render.viewport.w - self.exitBtn.w - 10;

                default:
                    break;
            }

            if (self.ccblock && BSWG.planets.inzone(self.ccblock.obj.body.GetWorldCenter())) {
                if (!self.saveHealAdded) {
                    self.saveBtn.add();
                    self.healBtn.add();
                    self.saveHealAdded = true;
                }
                self.healBtn.p.x = self.showControlsBtn.p.x + self.showControlsBtn.w + 10;
                self.saveBtn.p.x = self.healBtn.p.x + 10 + self.healBtn.w;
            }
            else {
                if (self.saveHealAdded) {
                    self.saveBtn.remove();
                    self.healBtn.remove();
                    self.saveHealAdded = false;
                }
            }

            if (self.map) {
                var zones = self.map.zones;
                for (var i=0; i<zones.length; i++) {
                    if (!zones[i].zoneTitle) {
                        zones[i].zoneTitle = new BSWG.uiControl(BSWG.control_3DTextButton, {
                            x: viewport.w*0.5, y: 160,
                            w: 800, h: 100,
                            vpXCenter: true,
                            text: zones[i].name,
                            color: [1, 1, 1.5, 0],
                            hoverColor: [1, 1, 1.5, 0],
                            lowDetail: true,
                            click: function (me) {}
                        });
                        //zones[i].zoneTitle.remove();
                    }
                }
                self.inZone = self.map.getZone(self.ccblock.obj.body.GetWorldCenter());
                if (self.lastZone !== self.inZone) {
                    if (self.lastZone) {
                        //self.lastZone.zoneTitle.remove();
                        self.lastZone.zoneTitle.hoverColor[3] = self.lastZone.zoneTitle.textColor[3] = 0.0;
                    }
                    self.inZone.zoneTitle.hoverColor[3] = self.inZone.zoneTitle.textColor[3] = 1.0;
                    //self.inZone.zoneTitle.add();
                    self.lastZone = self.inZone;
                    self.zoneChangeT = 6.0;

                    self.inZone.discovered = true;
                    var ctx2 = self.mapImage.getContext('2d');

                    ctx2.globalAlpha = 1.0;
                    self.map.renderZoneMap(ctx2, '#002', true, null, true);
                    self.map.renderEdgeMap(ctx2, '#00f', true, null, true);

                    for (var i=0; i<self.map.planets.length; i++) {
                        if (self.map.planets[i].zone.discovered) {
                            var p = self.map.worldToMap(self.map.planets[i].worldP);
                            ctx2.fillStyle = '#0f0';
                            ctx2.fillRect(p.x/self.map.size * 128-1, p.y/self.map.size * 128-1, 3, 3);
                        }
                    }

                }
                else {
                    self.inZone.zoneTitle.hoverColor[3] = Math.min(self.zoneChangeT, 1.0);
                    self.inZone.zoneTitle.textColor[3] = Math.min(self.zoneChangeT, 1.0);
                    self.zoneChangeT -= dt;
                    if (self.zoneChangeT < 0.0) {
                        self.zoneChangeT = 0.0;
                        //self.inZone.zoneTitle.remove();
                    }
                }
            }

            BSWG.ui.render(ctx, viewport);

            if (self.mapImage) {
                ctx.fillStyle = '#000';
                ctx.strokeStyle = '#88f';
                ctx.fillRect(9, viewport.h - 11 - 128, 128+2, 128+2);
                ctx.strokeRect(9, viewport.h - 11 - 128, 128+2, 128+2);
                ctx.drawImage(self.mapImage, 0, 0, self.map.size, self.map.size, 10, viewport.h - 10 - 128, 128, 128);
                var p = self.map.worldToMap(self.ccblock.obj.body.GetWorldCenter());
                ctx.fillStyle = '#fff';
                ctx.fillRect(10 + p.x/self.map.size * 128-1, viewport.h - 10 - 128 + p.y/self.map.size * 128-1, 3, 3);

                if (self.inZone) {
                    ctx.fillStyle = '#88f';
                    ctx.strokeStyle = '#226';
                    ctx.font = '24px Orbitron';
                    ctx.textAlign = 'left';
                    ctx.fillTextB(self.inZone.name, 10 + 128 + 10, viewport.h - 10);
                }
            }

            if (self.switchScene) {

                var ss = self.switchScene;
                var t = 0.0;
                if (ss.timeOut > 0) {
                    ss.timeOut -= dt;
                    t = 1.0 - (ss.timeOut / ss.fadeTime);
                    if (ss.timeOut < 0) {
                        ss.timeOut = 0;
                        ctx.fillStyle = ss.color;
                        ctx.fillRect(0, 0, viewport.w, viewport.h);
                        ctx.font = '48px Orbitron';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#77d';
                        ctx.fillTextB('Loading ...', 48, viewport.h - 48, true);
                        BSWG.render.setCustomCursor(false);
                        t = 0.0;
                    }
                }
                else if (ss.newScene !== null) {

                    self.initScene(ss.newScene, ss.newArgs);
                    BSWG.render.setCustomCursor(true);
                    ss.newScene = null
                    t = 1.0;
                }
                else if (ss.timeIn > 0) {
                    ss.timeIn -= dt;
                    if (ss.timeIn < 0) {
                        ss.timeIn = 0;
                    }
                    t = ss.timeIn / ss.fadeTime;
                }
                else {
                    self.switchScene = null;
                }

                if (t > 0.0) {
                    ctx.globalAlpha = Math.clamp(t, 0.0, 1.0);
                    ctx.fillStyle = ss.color;
                    ctx.fillRect(0, 0, viewport.w, viewport.h);
                    ctx.globalAlpha = 1.0;
                }
            }

        });
    };

}();