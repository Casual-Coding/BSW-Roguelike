BSWG.grabSlowdownDist      = 0.5;
BSWG.grabSlowdownDistStart = 3.0;
BSWG.maxGrabDistance       = 45.0;
BSWG.mouseLookFactor       = 0.0; // 0 to 0.5
BSWG.camVelLookBfr         = 0.2; // * viewport.w
BSWG.lookRange             = 45.0;

BSWG.SCENE_TITLE = 1;
BSWG.SCENE_GAME1 = 2;

BSWG.game = new function(){

    this.curSong = null;
    this.lastSong = null;
    this.hudBtn = new Array();

    this.initHUD = function (scene) {

        if (scene === BSWG.SCENE_GAME1 || scene === BSWG.SCENE_GAME2 || scene === BSWG.SCENE_TITLE) {

            this.hudBtn = new Array();
            var self = this;

            this.hudNM = BSWG.render.proceduralImage(2048, 2048, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h);

                var off = scene === BSWG.SCENE_GAME1 ? 0 : 256;
                var bsz = 92;
                var sc = bsz/96;
                off *= sc;
                var bfr = 16;

                if (scene !== BSWG.SCENE_TITLE) {

                    H.plate(256*sc-off, h-(bfr*2 + bsz), w-256*sc+off, bfr*2 + bsz, 0.25, 0.5);
                    H.plate(0-off, h-256*sc, 256*sc, 256*sc, 0.15, 0.5);
                    H.plate(7-off, h-256*sc+7, 256*sc-14, 256*sc-14, 0.5, 0.15); // 0

                    var hh = bfr*2 + bsz*2;

                    self.hudBottomYT = h-(bfr*2 + bsz);

                    H.plate(w/2-(bfr+bsz*2), h-hh, bfr*2+bsz*4, hh, 0.25, 0.5);
                    H.plate(w/2-(bfr+bsz*2)+bfr, h-hh+bfr, (bfr*2+bsz*4)-bfr*2, bsz, 0.5, 0.25); // 1

                    H.plate(w/2-(bfr+bsz*2)+bfr, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 2
                    H.plate(w/2-(bfr+bsz*2)+bfr+bsz, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 3
                    H.plate(w/2-(bfr+bsz*2)+bfr+bsz*2, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 4
                    H.plate(w/2-(bfr+bsz*2)+bfr+bsz*3, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 5

                    H.plate(w/2+(bfr+bsz*2)+bfr, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 6
                    H.plate(w/2+(bfr+bsz*2)+bfr+bsz, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 7
                    H.plate(w/2+(bfr+bsz*2)+bfr+bsz*2, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 8
                    H.plate(w/2+(bfr+bsz*2)+bfr+bsz*3, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 9
                    H.plate(w/2+(bfr+bsz*2)+bfr+bsz*4, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 10

                    H.plate(256*sc+bfr, h-(bsz+bfr), w/2-(bfr+bsz*2)-256*sc-bfr*2, bsz, 0.5, 0.15); // 11

                }
                else {
                    for (var i=0; i<12; i++) {
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 0..11
                    }
                    H.plate(0, h-48, w, 48, 0.25, 0.5);
                }

                H.plate(0, 0, w, 48, 0.25, 0.5);

                H.plate(w-48, (48-40)/2+1, 42, 40, 0.5, 0.35); // 12

                if (scene === BSWG.SCENE_GAME2) {
                    H.plate(7, (48-40)/2, 128, 42, 0.5, 0.35); // 13
                    H.plate(7+128+7, (48-40)/2, 128, 42, 0.5, 0.35); // 14
                    H.plate(7+128+7+128+7, (48-40)/2, 128, 42, 0.5, 0.35); // 15
                    H.plate(7+128+7+128+7+128+7, (48-40)/2, 384, 42, 0.5, 0.15); // 16
                }

                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                self.hudBtn = H.hudBtn;

            }, true);

            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                0, 0, // x, y
                BSWG.render.viewport.w, BSWG.render.viewport.h, // w, h
                0.0, // z
                [1,1,1,1], // color
                true // split
            );

        }

    };

    this.hudX = function (x) {

        return x / 2048 * BSWG.render.viewport.w;

    };

    this.hudY = function (y) {

        var aspect = BSWG.render.viewport.w / BSWG.render.viewport.h;

        y = (y / 2048);

        if (y<0.5) {
            return (y * aspect) * BSWG.render.viewport.h;
        }
        else {
            return (y + (1.0/aspect - 1.0)) * aspect * BSWG.render.viewport.h;
        }

    };

    this.removeHUD = function () {

        if (!this.hudObj) {
            return;
        }

        this.hudObj.remove();
        this.hudObj = null;

    };

    this.updateHUD = function (dt) {

        BSWG.uiP3D_update(dt);

    };

    this.setSong = function(bpm, settings, vol, fadeIn) {
        this.lastSong = [ bpm, settings, vol, fadeIn ];
        if (this.curSong) {
            this.curSong.fadeOutStop(1.0);
        }
        settings = settings || {};
        bpm = bpm || 120;
        Math.seedrandom((settings.seed1 || 51) + (settings.seed2 || 0) * 1000.0);
        this.curSong = new BSWG.song(3, bpm, 0.0, settings);
        //this.curSong.start();
        this.curSong.setVolume(vol || 0.25, fadeIn || 3.0);
    };
    this.setSongCache = function(song, vol, fadeIn) {
        if (this.curSong) {
            this.curSong.fadeOutStop(1.0);
        }
        this.curSong = song;
        //this.curSong.start();
        this.curSong.setVolume(vol || 0.25, fadeIn || 3.0);
    };
    this.repeatSong = function() {
        if (this.curSong) {
            //this.curSong.start();
        }
    };

    this.stopMusic = function(t) {
        if (this.curSong) {
            this.curSong.fadeOutStop(t||1.0);
        }
        this.curSong = null;
    };

    this.test = function ()
    {
        console.log('a');
    };

    this.scene = null;
    this.switchScene = null;

    this.changeScene = function (scene, args, fadeColor, fadeTime, force) {

        this.stopMusic(1.0);

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

    this.enemies = new Array();

    this.spawnEnemies = function (list) {

        if (!this.ccblock || this.ccblock.destroyed) {
            return;
        }

        var p = this.ccblock.obj.body.GetWorldCenter().clone();
        var arange = Math.PI/5.5;
        var minr = 50, maxr = 100;
        var v = this.ccblock.obj.body.GetLinearVelocity().clone();
        var a = Math.atan2(v.y, v.x);

        for (var i=0; i<list.length; i++) {
            var aiship = null;
            while (!aiship) {

                var ta = Math.random() * 2 - 1;
                var tr = Math.random();
                var p2 = new b2Vec2(
                    p.x + Math.cos(a + arange * ta) * ((maxr-minr)*tr + minr),
                    p.y + Math.sin(a + arange * ta) * ((maxr-minr)*tr + minr)
                );

                aiship = BSWG.componentList.load(list[i], {p: p2});
                window.setTimeout(function(ais){
                    return function() {
                        ais.reloadAI();
                    };
                }(aiship),10);
            }
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
        BSWG.laserList.clear();
        BSWG.planets.init();
        BSWG.ui.clear();
        BSWG.ai.init();

        this.aiBtn = null;

        this.removeHUD();

        this.map = null;
        this.mapImage = null;
        this.ccblock = null;
        this.cam = new BSWG.camera();
        BSWG.render.updateCam3D(this.cam);
        this.editMode = false;
        this.showControls = false;

        this.battleMode = false;

        this.exportFN = "";
        var setExportFN = function () {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var ampm = "am"
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (hour >= 12) {
                ampm = "pm";
                if (hour > 12) {
                    hour -= 12;
                }
            }
            if (hour < 10) {
                hour = '0' + hour;
            }
            self.exportFN = 'bswr-sandbox-'+month+'-'+day+'-'+year+'-'+hour+'-'+minutes+'-'+seconds+'-'+ampm+'.json';
        }

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
        BSWG.input.CLEAR_GFILE();

        switch (scene) {
            case BSWG.SCENE_TITLE:

                this.cam.z *= 1.5;

                Math.seedrandom();

                if (this.title1) {
                    this.title1.add();
                    this.title2.add();
                    this.newGameBtn.add();
                    this.loadGameBtn.add();
                    this.sandBoxBtn.add();
                }
                else {
                    this.title1 = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 80+42,
                        w: 800, h: 100,
                        vpXCenter: true,
                        text: "BlockShip Wars",
                        color: [0.85, 0.85, 0.85, 1],
                        hoverColor: [0.85, 0.85, 0.85, 1],
                        noDestroy: true,
                        click: function (me) {
                        }
                    });
                    this.title2 = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 145+42,
                        w: 800, h: 100,
                        vpXCenter: true,
                        text: "r o g u e l i k e",
                        color: [0.85, 0.2, 0.2, 1.0],
                        hoverColor: [0.85, 0.2, 0.2, 1.0],
                        noDestroy: true,
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
                        noDestroy: true,
                        click: function (me) {
                            self.changeScene(BSWG.SCENE_GAME1, {}, '#000', 0.75);
                        }
                    });
                    this.loadGameBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 350+70,
                        w: 400, h: 70,
                        vpXCenter: true,
                        text: "Load Game",
                        color: [0.35*0.5, 0.6*0.5, 1.*0.5, 1.0],
                        hoverColor: [0.3, 0.3, 0.3, 1.0],
                        noDestroy: true,
                        click: function (me) {
                            //self.changeScene(BSWG.SCENE_GAME1, {}, '#fff');
                        }
                    });
                    this.sandBoxBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 350+140,
                        w: 400, h: 70,
                        vpXCenter: true,
                        text: "Sandbox",
                        color: [0.35, 0.6, 1., 1.0],
                        hoverColor: [0.95, 0.95, 0.95, 1.0],
                        noDestroy: true,
                        click: function (me) {
                            self.changeScene(BSWG.SCENE_GAME2, {}, '#000', 0.75);
                        }
                    });
                }

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

                this.setSong(134, {
                    seed1: 48,
                    seed2: 55,
                    happy: 0.63,
                    intense: 0.96,
                    smooth: 0.69,
                    rise: 0.51,
                    drop: 0.28,
                    crazy: 0.0,
                    rep: 0.25,
                    root: 0.05,
                    harmonize: 1.0
                }, 0.45, 8.0);
                break;

            case BSWG.SCENE_GAME1:

                this.map = BSWG.genMap(128, 30, 8);
                Math.seedrandom();
                for (var i=0; i<this.map.planets.length; i++) {
                    var planet = BSWG.planets.add({pos: this.map.planets[i].worldP.THREE(), type: i===0 ? BSWG.planet_TERRAN : null});
                    this.map.planets[i].pobj = planet;
                }
                startPos = this.map.planets[0].worldP.clone();
                this.map.planets[0].pobj.capture();
                this.mapImage = BSWG.render.proceduralImage(this.map.size*4, this.map.size*4, function(ctx, w, h){
                });
                this.nebulas = new BSWG.nebulas(this.map);

            case BSWG.SCENE_GAME2:
                this.editBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['build-mode'],
                    selected: this.editMode,
                    click: function (me) {
                        me.selected = !me.selected;
                        self.editMode = me.selected;
                    }
                });
                this.anchorBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 65 + 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['anchor'],
                    selected: false,
                    click: function (me) {
                        if (self.ccblock) {
                            self.ccblock.anchored = !self.ccblock.anchored;
                            me.selected = self.ccblock.anchored;
                        }
                    }
                });
                this.showControlsBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 65 + 10 + 65 + 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['show-controls'],
                    selected: this.showControls,
                    click: function (me) {
                        me.selected = !me.selected;
                        self.showControls = me.selected;
                    }
                });

                this.healBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['repair'],
                    selected: false,
                    click: function (me) {
                    }
                });
                if (scene === BSWG.SCENE_GAME2) {
                    this.compPal = new BSWG.uiControl(BSWG.control_CompPalette, {
                        x: 2048, y: 70,
                        w: 128 * 3,
                        h: 650,
                        clickInner: function (me, B) {
                            var vr = 2;
                            for (var k=1000; k>=0; k--) {
                                var p = self.ccblock.obj.body.GetWorldCenter();
                                var a = Math.random() * Math.PI * 2.0;
                                var r = 6 + Math.pow(Math.random(), 2.0) * vr;
                                p = new b2Vec2(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
                                var any = false;
                                for (var i=0; i<BSWG.componentList.compList.length && !any; i++) {
                                    var C = BSWG.componentList.compList[i];
                                    if (BSWG.physics.bodyDistancePoint(C.obj.body, p, 3.5) <= 0.0) {
                                        any = true;
                                    }
                                }
                                if (any) {
                                    vr += 1.0;
                                    continue;
                                }
                                var args = {};
                                for (var key in B.args) {
                                    if (key !== 'title') {
                                        args[key] = B.args[key];
                                    }
                                }
                                args.pos = p;
                                args.angle = Math.random()*Math.PI*2.0;
                                new BSWG.component(B.comp, args);
                                break;
                            }
                        }
                    });
                    this.saveBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10 + 65 + 10 + 65 + 10, y: 10,
                        w: 65, h: 65,
                        text: 'Export',
                        selected: false,
                        click: function (me) {
                            if (self.scene === BSWG.SCENE_GAME2) {
                                setExportFN();
                                JSON.saveAs(
                                    BSWG.componentList.serialize(null, true),
                                    self.exportFN
                                );
                            }
                        }
                    });
                    this.loadBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10 + 50 + 10 + 50 + 10, y: 10,
                        w: 110, h: 65,
                        text: "Import",
                        selected: false,
                        click: function (me) {
                        }
                    });
                    BSWG.input.GET_FILE(function(data, x, y){
                        if (!data) {
                            return x >= self.loadBtn.p.x && y >= self.loadBtn.p.y &&
                                   x <= (self.loadBtn.p.x + self.loadBtn.w) && y <= (self.loadBtn.p.y + self.loadBtn.h);
                        }

                        BSWG.ai.closeEditor();
                        self.aiBtn.selected = false;

                        var backup = BSWG.componentList.serialize(null, true);

                        try {
                            self.ccblock = null;
                            self.exportFN = data.filename;
                            var obj = JSON.parse(data.data);
                            BSWG.componentList.clear();
                            self.ccblock = BSWG.componentList.load(obj);
                            if (!self.ccblock) {
                                throw "no cc";
                            }
                        } catch (err) {
                            BSWG.componentList.clear();
                            self.ccblock = BSWG.componentList.load(backup);
                        }
                        
                    }, "text");
                    if (scene === BSWG.SCENE_GAME2) {
                        this.aiBtn = new BSWG.uiControl(BSWG.control_Button, {
                            x: 10 + 150 + 10 + 150 + 10, y: 10,
                            w: 150, h: 50,
                            text: "AI Editor",
                            selected: false,
                            click: function (me) {
                                if (!me.selected) {
                                    me.selected = true;
                                    BSWG.ai.openEditor(self.ccblock);
                                }
                                else {
                                    me.selected = false;
                                    BSWG.ai.closeEditor();
                                }
                            }
                        });
                    }
                    else {
                        this.aiBtn = null;
                    }
                    this.shipTest = function(obj) {

                        if (obj) {
                            this.backup = BSWG.componentList.serialize(null, true);
                            try {
                                self.ccblock = null;
                                BSWG.componentList.clear();
                                BSWG.blasterList.clear();
                                BSWG.laserList.clear();
                                self.ccblock = BSWG.componentList.load(obj, {p: new b2Vec2(0, -50)});
                                self.aiship = BSWG.componentList.load(this.backup, {p: new b2Vec2(0, 0)});
                                window.setTimeout(function(){
                                    self.aiship.reloadAI();
                                },10);                                
                                if (!self.ccblock || !self.aiship) {
                                    throw "no cc";
                                }
                            } catch (err) {
                                BSWG.componentList.clear();
                                self.ccblock = BSWG.componentList.load(backup);
                            }
                        }
                        else {
                            BSWG.componentList.clear();
                            BSWG.blasterList.clear();
                            BSWG.laserList.clear();
                            self.ccblock = BSWG.componentList.load(this.backup);
                            self.aiship = null;
                        }

                    };
                }

                this.saveHealAdded = false;

                if (scene === BSWG.SCENE_GAME2) {
                    BSWG.planets.add({});
                }

                var count = scene === BSWG.SCENE_GAME1 ? 44+3 : 145+3;

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
                        /*else if (i<(4+4+6+3+4)) {
                            new BSWG.component(i%2 ? BSWG.component_Laser : BSWG.component_MissileLauncher, {

                                pos: p,
                                angle: Math.random()*Math.PI*2.0,

                            });
                        }*/
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

        this.escMenu = null;

        this.exitBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 100, h: 65,
            text: BSWG.render.images['menu'],
            selected: false,
            clickKey: BSWG.KEY.ESC,
            click: function (me) {
                if (self.escMenu) {
                    self.escMenu.remove();
                    self.escMenu = null;
                    me.selected = false;
                    return;
                }
                me.selected = true;

                var buttons = [
                    new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: -1000,
                        w: 250, h: 32,
                        text: 'Toggle Fullscreen',
                        selected: false,
                        click: function (me) {
                            var win = BSWG.render.win;
                            win.toggleFullscreen();
                        }
                    }),
                    new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: -1000,
                        w: 250, h: 32,
                        text: 'Exit',
                        selected: false,
                        click: function (me) {
                            if (self.scene === BSWG.SCENE_TITLE) {
                                var app = BSWG.app;
                                app.quit();
                            }
                            else {
                                BSWG.ai.closeEditor();
                                self.changeScene(BSWG.SCENE_TITLE, {}, '#000', 0.75);
                            }
                        }
                    })
                ];

                self.escMenu = new BSWG.uiControl(BSWG.control_Menu, {
                    x: BSWG.render.viewport.w - (250 + 16),
                    y: self.exitBtn.p.y + self.exitBtn.h + 3,
                    w: 1, h: 1,
                    buttons: buttons
                });

            }
        });

        self.initHUD(scene);

        BSWG.render.resetl60();

    };

    this.shipTest = null;
    this.emodeTint = 0.0;
    this.bmodeTint = 0.0;

    this.start = function ()
    {
        var self = this;

        var grabbedBlock = null;
        var grabbedLocal = null;
        var grabbedRot = false;

        BSWG.render.setCustomCursor(true);
        BSWG.input.emulateMouseWheel([BSWG.KEY['-'], BSWG.KEY['NUMPAD -']], [BSWG.KEY['='], BSWG.KEY['NUMPAD +']], 2);

        BSWG.render.startRenderer(function(dt, time){

            self.hudBottomY = self.hudY(self.hudBottomYT);

            if (self.editMode || !(self.scene === BSWG.SCENE_GAME1 || self.scene === BSWG.SCENE_GAME2)) {
                self.emodeTint += (1 - self.emodeTint) * dt * 5;
            }
            else {
                self.emodeTint += (0 - self.emodeTint) * dt * 5;
            }

            if (self.battleMode) {
                self.bmodeTint += (1 - self.bmodeTint) * dt * 5;
            }
            else {
                self.bmodeTint += (0 - self.bmodeTint) * dt * 5;
            }

            if (self.hudObj) {
                var t = self.emodeTint;
                if (self.scene === BSWG.SCENE_TITLE) {
                    self.hudObj.set_clr([(0.85+(1-t)*0.05) * 0.7, (0.85+(1-t)*0.05) * 0.7, (1.0+(t)*0.1) * 0.7, 1]);
                }
                else {
                    self.hudObj.set_clr([0.85+(1-t)*0.05 + self.bmodeTint * 0.2, 0.85+(1-t)*0.05 - self.bmodeTint * 0.2, 1.0+(t)*0.1 - self.bmodeTint * 0.2, 1]);
                }
            }

            if (self.curSong) {
                if (self.curSong.timeIndex() > (3 * 60 + 3)) {
                    self.repeatSong();
                }
            }

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;
            
            document.title = "BlockShip Wars: Roguelike - " + Math.floor(1/BSWG.render.actualDt) + " fps (" + Math.floor(1/BSWG.render.dt) + ")";

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
                    if (!self.ccblock.destroyed) {
                        var wheel = BSWG.input.MOUSE_WHEEL_ABS() - wheelStart;
                        var toZ = Math.clamp(0.1 * Math.pow(1.25, wheel), 0.01, 0.25) / Math.min(1.0+self.ccblock.obj.body.GetLinearVelocity().Length()*0.1, 1.5);

                        var ccs = BSWG.componentList.allCCs();
                        var avgDist = 0.0;
                        var avgP = self.ccblock.p().clone();
                        var w = 1;
                        avgP.x *= w;
                        avgP.y *= w;
                        for (var i=0; i<ccs.length; i++) {
                            var dist = Math.distVec2(ccs[i].p(), self.ccblock.p());
                            avgDist += dist;
                            var tw = 1;
                            if (dist > 20) {
                                tw = 1 / (1+(dist-20)/10);
                            }
                            avgP.x += ccs[i].p().x * tw;
                            avgP.y += ccs[i].p().y * tw;
                            w += tw;
                        }
                        avgP.x /= w;
                        avgP.y /= w;
                        avgDist = Math.clamp(avgDist/ccs.length, 0.0, BSWG.lookRange);
                        toZ /= Math.max(Math.log(avgDist), 1.0);
                        toZ = Math.max(toZ, 0.007);

                        self.cam.zoomTo(dt*2.5, toZ);
                        var ccp = self.ccblock.obj.body.GetWorldCenter().clone();
                        var p = avgP.clone();//self.ccblock.obj.body.GetWorldCenter().clone();
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

                        self.cam.panTo(dt*4.0*(self.ccblock.anchored ? 0.15 : 1.0), Math.interpolate(mp, p, 1.0-BSWG.mouseLookFactor));                       
                    }
                    break;

                default:
                    break;
            }

            var offset = null;
            /*if (self.ccblock) {
                var offset = self.ccblock.obj.body.GetLinearVelocity().THREE(0.0);  
                offset.x = -offset.x * 0.5;
                offset.y = -offset.y * 0.5;
            }*/
            BSWG.render.updateCam3D(self.cam, offset);
            BSWG.ui.update();
            BSWG.physics.update(dt);
            BSWG.componentList.update(dt);
            BSWG.planets.render(dt);

            switch (self.scene) {
                case BSWG.SCENE_TITLE:
                    break;

                case BSWG.SCENE_GAME1:
                case BSWG.SCENE_GAME2:

                    if (self.editMode && !self.ccblock.destroyed) {

                        if (BSWG.input.MOUSE_PRESSED('left') && !BSWG.ui.mouseBlock) {
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
                            BSWG.input.EAT_MOUSE('left');
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

                    if (!self.ccblock.ai) {
                        BSWG.componentList.handleInput(self.ccblock, BSWG.input.getKeyMap());
                    }
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
            BSWG.laserList.updateRender(ctx, self.cam, dt);
            BSWG.render.boom.render(dt);

            switch (self.scene) {
                case BSWG.SCENE_TITLE:
                    self.exitBtn.p.x = self.hudX(self.hudBtn[12][0]) + 2;
                    self.exitBtn.p.y = self.hudY(self.hudBtn[12][1]) + 2;
                    self.exitBtn.w = self.hudX(self.hudBtn[12][2]) - self.exitBtn.p.x - 4;
                    self.exitBtn.h = self.hudY(self.hudBtn[12][3]) - self.exitBtn.p.y - 4;
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

                    self.exitBtn.p.x = self.hudX(self.hudBtn[12][0]) + 2;
                    self.exitBtn.p.y = self.hudY(self.hudBtn[12][1]) + 2;
                    self.exitBtn.w = self.hudX(self.hudBtn[12][2]) - self.exitBtn.p.x - 4;
                    self.exitBtn.h = self.hudY(self.hudBtn[12][3]) - self.exitBtn.p.y - 4;

                    //self.exitBtn.p.x = BSWG.render.viewport.w - self.exitBtn.w - 10;
                    if (self.scene === BSWG.SCENE_GAME2 && self.aiBtn) {
                        self.aiBtn.p.x = self.hudX(self.hudBtn[13][0]) + 1;
                        self.aiBtn.p.y = self.hudY(self.hudBtn[13][1]) + 1;
                        self.aiBtn.w = self.hudX(self.hudBtn[13][2]) - self.aiBtn.p.x - 2;
                        self.aiBtn.h = self.hudY(self.hudBtn[13][3]) - self.aiBtn.p.y - 2;
                    }

                    if (self.scene === BSWG.SCENE_GAME2 && self.loadBtn) {
                        self.loadBtn.p.x = self.hudX(self.hudBtn[14][0]) + 1;
                        self.loadBtn.p.y = self.hudY(self.hudBtn[14][1]) + 1;
                        self.loadBtn.w = self.hudX(self.hudBtn[14][2]) - self.loadBtn.p.x - 2;
                        self.loadBtn.h = self.hudY(self.hudBtn[14][3]) - self.loadBtn.p.y - 2;
                    }

                    if (self.scene === BSWG.SCENE_GAME2 && self.saveBtn) {
                        self.saveBtn.p.x = self.hudX(self.hudBtn[15][0]) + 1;
                        self.saveBtn.p.y = self.hudY(self.hudBtn[15][1]) + 1;
                        self.saveBtn.w = self.hudX(self.hudBtn[15][2]) - self.saveBtn.p.x - 2;
                        self.saveBtn.h = self.hudY(self.hudBtn[15][3]) - self.saveBtn.p.y - 2;
                    }

                default:
                    break;
            }

            if (self.ccblock && !self.ccblock.destroyed && BSWG.planets.inzone(self.ccblock.obj.body.GetWorldCenter())) {
                if (!self.saveHealAdded) {
                    //self.saveBtn.add();
                    self.healBtn.add();
                    self.saveHealAdded = true;
                }
                self.healBtn.p.x = self.showControlsBtn.p.x + self.showControlsBtn.w + 10;
                //self.saveBtn.p.x = self.healBtn.p.x + 10 + self.healBtn.w;
            }
            else {
                if (self.saveHealAdded) {
                    //self.saveBtn.remove();
                    self.healBtn.remove();
                    self.saveHealAdded = false;
                }
            }

            if (self.scene === BSWG.SCENE_GAME2) {
                self.healBtn.p.x = self.showControlsBtn.p.x + self.showControlsBtn.w + 10;
                //self.saveBtn.p.x = self.healBtn.p.x + 10 + self.healBtn.w;
                //self.loadBtn.p.x = self.saveBtn.p.x + 10 + self.saveBtn.w;
                if (BSWG.ai.runMode) {
                    self.saveBtn.p.y = -1000;
                    self.loadBtn.p.y = -1000;
                    self.aiBtn.p.y = -1000;
                }
                else {
                    //self.saveBtn.p.y = 10;
                    //self.loadBtn.p.y = 10;
                    self.aiBtn.p.y = self.hudY(self.hudBtn[13][1]) + 1;
                }
            }

            if (self.map && self.ccblock && !self.ccblock.destroyed) {
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
                if (!self.zSwitchTime) {
                    self.zSwitchTime = Date.timeStamp() - 5;
                }
                if (self.lastZone !== self.inZone && (Date.timeStamp() - self.zSwitchTime)>1.0) {
                    self.zSwitchTime = Date.timeStamp();
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
                    self.map.renderZoneMap(ctx2, '#002', true, 4, true);
                    self.map.renderEdgeMap(ctx2, '#00f', true, 4, true);

                    for (var i=0; i<self.map.planets.length; i++) {
                        if (self.map.planets[i].zone.discovered) {
                            var p = self.map.worldToMap(self.map.planets[i].worldP);
                            ctx2.fillStyle = '#0f0';
                            ctx2.fillRect(p.x/self.map.size * 128*4-6, p.y/self.map.size * 128*4-6, 12, 12);
                        }
                    }

                    /*var bpm = self.inZone.musicBPM;
                    var settings = self.inZone.musicSettings;*/

                    if (self.inZone.pobj && self.inZone.pobj.captured) {
                        self.setSongCache(self.inZone.songCap, 0.35, 3.0);
                    }
                    else {
                        self.setSongCache(self.inZone.song, 0.35, 3.0);
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
            
            if (self.editBtn) {
                self.editBtn.p.x = self.hudX(self.hudBtn[6][0]) + 2;
                self.editBtn.p.y = self.hudY(self.hudBtn[6][1]) + 2;
                self.editBtn.w = self.hudX(self.hudBtn[6][2]) - self.editBtn.p.x - 4;
                self.editBtn.h = self.hudY(self.hudBtn[6][3]) - self.editBtn.p.y - 4;
            }

            if (self.anchorBtn) {
                self.anchorBtn.p.x = self.hudX(self.hudBtn[7][0]) + 2;
                self.anchorBtn.p.y = self.hudY(self.hudBtn[7][1]) + 2;
                self.anchorBtn.w = self.hudX(self.hudBtn[7][2]) - self.anchorBtn.p.x - 4;
                self.anchorBtn.h = self.hudY(self.hudBtn[7][3]) - self.anchorBtn.p.y - 4;
            }

            if (self.showControlsBtn) {
                self.showControlsBtn.p.x = self.hudX(self.hudBtn[8][0]) + 2;
                self.showControlsBtn.p.y = self.hudY(self.hudBtn[8][1]) + 2;
                self.showControlsBtn.w = self.hudX(self.hudBtn[8][2]) - self.showControlsBtn.p.x - 4;
                self.showControlsBtn.h = self.hudY(self.hudBtn[8][3]) - self.showControlsBtn.p.y - 4;
            }

            if (self.healBtn) {
                self.healBtn.p.x = self.hudX(self.hudBtn[9][0]) + 2;
                self.healBtn.p.y = self.hudY(self.hudBtn[9][1]) + 2;
                self.healBtn.w = self.hudX(self.hudBtn[9][2]) - self.healBtn.p.x - 4;
                self.healBtn.h = self.hudY(self.hudBtn[9][3]) - self.healBtn.p.y - 4;
            }

            BSWG.ui.render(ctx, viewport);

            self.updateHUD(dt);

            BSWG.ai.update(ctx, dt);

            if (self.map && self.ccblock && !self.ccblock.destroyed) {
                var p = self.ccblock.obj.body.GetWorldCenter().clone();
                var ret = self.map.tickSpawner(dt, p);

                if (self.battleMode) {
                    var ccs = BSWG.componentList.allCCs();
                    if ((ccs.length - (self.ccblock && !self.ccblock.destroyed ? 1 : 0)) === 0) {
                        self.battleMode = false;
                    }
                    for (var i=0; i<ccs.length; i++) {
                        if (self.ccblock && self.ccblock.id !== ccs[i].id && (ccs[i].obj && ccs[i].obj.body && Math.distVec2(ccs[i].obj.body.GetWorldCenter(), self.ccblock.obj.body.GetWorldCenter()) > self.map.escapeDistance)) {
                            ccs[i].warpOut();
                        }
                    }
                }

                if (ret === null) {
                    // nop
                }
                else if (ret === 'escape' && self.battleMode) {
                    var ccs = BSWG.componentList.allCCs();
                    for (var i=0; i<ccs.length; i++) {
                        if (self.ccblock && self.ccblock.id !== ccs[i].id) {
                            ccs[i].warpOut();
                        }
                    }
                }
                else if (typeof ret !== 'string') {
                    var enemies = [];
                    var e = BSWG.getEnemy(ret.type);
                    if (e && e.obj) {
                        enemies.push(e.obj);
                        if (ret.max && ret.max > 0) {
                            for (var i=0; i<ret.max; i++) {
                                if (Math.random() < 0.5) {
                                    enemies.push(e.obj);
                                }
                            }
                        }
                        if (ret.with && ret.with.length) {
                            for (var i=0; i<ret.with.length; i++) {
                                var ew = BSWG.getEnemy(ret.with[i]);
                                if (ew && ew.obj) {
                                    enemies.push(ew.obj);
                                }
                            }
                        }
                    }
                    self.battleMode = true;
                    self.spawnEnemies(enemies);
                }
            }

            if (self.scene === BSWG.SCENE_GAME2 && !BSWG.ai.runMode) {
                var x = self.hudX(self.hudBtn[16][0]),
                    y = self.hudY(self.hudBtn[16][1]);
                var w = self.hudX(self.hudBtn[16][2]) - x,
                    h = self.hudY(self.hudBtn[16][3]) - y;
                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#00f';
                ctx.font = (~~(h*0.25)) + 'px Orbitron';
                ctx.textAlign = 'left';
                ctx.fillTextB(self.exportFN, x + w * 0.05, y + h * 0.5 + (h*0.25*0.5), true);
            }

            if (self.mapImage) {
                var x = self.hudX(self.hudBtn[0][0])+1,
                    y = self.hudY(self.hudBtn[0][1])+1;
                var w = self.hudX(self.hudBtn[0][2])-x-2,
                    h = self.hudY(self.hudBtn[0][3])-y-2;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(x, y, w, h);
                ctx.drawImage(self.mapImage, 0, 0, self.map.size*4, self.map.size*4, x, y, w, h);

                if (self.ccblock && !self.ccblock.destroyed) {
                    var p = self.map.worldToMap(self.ccblock.obj.body.GetWorldCenter());
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + p.x/self.map.size * w-1, y + p.y/self.map.size * h-1, 3, 3);
                }

                if (self.inZone) {
                    var x = self.hudX(self.hudBtn[11][0])+1,
                        y = self.hudY(self.hudBtn[11][1])+1;
                    var w = self.hudX(self.hudBtn[11][2])-x-2,
                        h = self.hudY(self.hudBtn[11][3])-y-2;
                    ctx.fillStyle = '#88f';
                    ctx.strokeStyle = '#226';
                    ctx.font = '18px Orbitron';
                    ctx.textAlign = 'left';
                    ctx.fillTextB(self.inZone.name + ' - L' + self.inZone.minLevel + '', x + 15, y + 10 + 18);
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