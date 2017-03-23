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

    this.zoomTo = function (dt, z, center, viewport) {

        if (center) {
            var sp = this.toScreen(viewport, center);
            this.z += (z - this.z) * Math.min(dt, 1.0);
            var cp2 = this.toWorld(viewport, sp);
            this.x += (center.x - cp2.x);
            this.y += (center.y - cp2.y);
            sp = cp2 = null;
        }
        else {
            this.z += (z - this.z) * Math.min(dt, 1.0);
        }
    };

    this.toScreenList = function (viewport, list) {

        var vpsz = Math.max(viewport.w, viewport.h);
        var ret = new Array(list.length);
        for (var i=0, len=list.length; i<len; i++) {
            ret[i] = new b2Vec2(
                (list[i].x - this.x) * this.z * vpsz + viewport.w * 0.5,
                -(list[i].y - this.y) * this.z * vpsz + viewport.h * 0.5
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
            -(y - this.y) * this.z * vpsz + viewport.h * 0.5
        );

    };

    this.toScreenSize = function (viewport, sz) {

        var vpsz = Math.max(viewport.w, viewport.h);
        return sz * this.z * vpsz;

    };

    this.toWorldSize = function (viewport, sz) {

        var vpsz = Math.max(viewport.w, viewport.h);
        return sz / (vpsz * this.z);

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
            -(y - viewport.h * 0.5) / (this.z * vpsz) + this.y
        );

    };

};

BSWG.initCanvasContext = function(ctx) {

    ctx.fontSpacing = 1.0;
    ctx.textWidth = function(text) {
        return ctx.measureText(text).width;
    };
    ctx.textWidthB = function(text) {
        var total = 0.0;
        for (var i=0; i<text.length; i++) {
            var width = 0.0;
            if ((i+1) < text.length) {
                width = ctx.measureText(text.charAt(i) + '' + text.charAt(i+1)).width - 
                        ctx.measureText(text.charAt(i+1) + '').width;
                width += (ctx.fontSpacing || 0.0);
            }
            else {
                width = ctx.measureText(text.charAt(i) + '').width;
            }
            total += width;
        }
        return total;
    };
    ctx.fillTextB = function(text, x, y, noBorder) {

        if (!text || !text.trim || !text.trim().length) {
            return;
        }

        text = '' + text;

        ctx.lineWidth = 3.5;
        if (!noBorder) {
            ctx.strokeText(text, x, y);
        }
        ctx.fillText(text, x, y);       

    };

};

BSWG.shadowMapSize = 1024 * 4;

BSWG.render = new function() {

    var win = BSWG.nwg ? BSWG.nwg.Window.get() : null;
    if (win) {
        win.show();
        win.maximize();
    }
    this.win = win;

    this.canvas = null;
    this.ctx = null;
    this.viewport = null;
    this.renderCbk = null;
    this.animFrameID = null;
    this.lastFrameTime = Date.timeStamp();
    this.dt = 1.0/60.0;
    this.time = 0.0;
    this.images = {};
    this.cam3D = null;
    this.dlgOpen = false;
    this.resized = true;
    this.envMapTint = /*THREE.CACHE(*/new THREE.Vector4(0,0,0,0);//);
    this.envMapParam = /*THREE.CACHE(*/new THREE.Vector4(0,0,0,0);//);
    this.envMapT = this.tileDark = 0.0;
    this.screenShake = 0.0;
    this.aiTrainMode = false;

    var old = THREE.Math.generateUUID;
    THREE.Math.generateUUID = function() {
        var tmp = Math.random;
        Math.random = Math._random;
        var ret = old.apply(THREE.Math, arguments);
        Math.random = tmp;
        return ret;
    };

    var maxRes = null; //{ w: 1920, h: 1080 };

    this.clearScene = function() {

        while (this.scene && this.scene.children.length) {
            this.scene.remove(this.scene.children[0]);
        }
        while (this.sceneS && this.sceneS.children.length) {
            this.sceneS.remove(this.sceneS.children[0]);
        }
        if (this.boom) {
            this.boom.readd();
        }
        if (this.weather) {
            this.weather.readd();
        }
        this.envMapTint.set(0,0,0,0);
        this.envMapParam.set(0,0,0,0);
        this.envMapT = this.tileDark = 0.0;
        this.screenShake = 0.0;

    };

    this.init = function(complete, images, shaders, textures) {

        if (!Detector.webgl) {
            alert('WebGL not supported.');
            return;
        }

        document.body.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.canvas.oncontextmenu = function(){ return false; };
        this.canvas.style.position = 'fixed';
        this.canvas.style.zIndex = 2;
        this.canvas.style.left = '0px';
        this.canvas.style.right = '0px';
        this.ctx = this.canvas.getContext('2d');

        this.canvas3D = document.createElement('canvas');
        this.canvas3D.style.position = 'fixed';
        this.canvas3D.style.zIndex = 1;
        this.canvas3D.style.left = '0px';
        this.canvas3D.style.right = '0px';
        this.canvas3D.oncontextmenu = function(){ return false; };

        this.cam3D = new THREE.PerspectiveCamera(85, 1.5, 1.0, 100);
        this.cam3D.matrixAutoUpdate = true;
        this.cam3D.position.z = 10.0;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3D, alpha: true, antialias: true });
        this.renderer.setClearColor( 0x000000, 0x00 );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.loader = new THREE.JSONLoader();
        this.raycaster = new THREE.Raycaster();
    
        this.composer = new THREE.EffectComposer( this.renderer );
        this.renderPass = new THREE.RenderPass( this.scene, this.cam3D )
        this.renderPass.renderToScreen = false;
        this.composer.addPass( this.renderPass );
        this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
        this.effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );
        this.composer.addPass( this.effectFXAA );
        this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.3, 0.75);
        this.composer.addPass( this.bloomPass );
        this.copyShader = new THREE.ShaderPass(THREE.CopyShader);
        this.copyShader.renderToScreen = true;
        this.composer.addPass( this.copyShader );

        this.cam3DS = new THREE.OrthographicCamera(-110, 110, 110, -110, 0, 256);
        this.cam3DS.matrixAutoUpdate = true;
        this.cam3DS.aspect = 1.0;
        this.cam3DS.updateProjectionMatrix();
        this.cam3DS.position.z = 10.0;
        this.shadowMatrix = /*THREE.CACHE(*/new THREE.Matrix4();//);
        this.sceneS = new THREE.Scene();

        this.shadowMap = new THREE.WebGLRenderTarget(BSWG.shadowMapSize, BSWG.shadowMapSize, {
            stencilBuffer: false,
            depthBuffer: true
        });
        this.shadowMap.depthTexture = new THREE.DepthTexture(BSWG.shadowMapSize, BSWG.shadowMapSize);
        this.shadowMap.depthTexture.magFilter = THREE.LinearFilter;
        this.shadowMap.depthTexture.minFilter = THREE.LinearFilter;
        
        this.cloudColor = /*THREE.CACHE(*/new THREE.Vector4(0, 0, 0, 0.9);//);

        this.sizeViewport();

        BSWG.initCanvasContext(this.ctx);

        this.ctx.globalAlpha = 1.0;
        var grd = this.ctx.createLinearGradient(0, 0, 0, this.viewport.h);
        grd.addColorStop(0, "#000");
        grd.addColorStop(1, "#000");
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.viewport.w, this.viewport.h);
        this.ctx.font = '48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#aaf';
        this.ctx.fillTextB('Loading ...', this.viewport.w*.5, this.viewport.h - 48, true);
        this.ctx.textAlign = 'left';
        this.ctx.drawImage(BSWG.titleImage, 0, 0, BSWG.titleImage.width, BSWG.titleImage.height, this.viewport.w/2 - BSWG.titleImage.width/3.0, 48, BSWG.titleImage.width/1.5, BSWG.titleImage.height/1.5);

        document.body.appendChild(this.canvas3D);
        document.body.appendChild(this.canvas);

        this.images = images = images || {};

        var ocomplete = complete;
        var self = this;
        complete = function() {
            self.loadShaders(shaders, function() {
                self.boom = new chadaboom3D([
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
                    }
                ],
                function(){
                    var loader = new THREE.FontLoader();
                    loader.load('fonts/orbitron-400.js', function (response) {
                        self.font3D = response;
                        self.weather = new BSWG.weather();
                        if (ocomplete) {
                            ocomplete();
                        }
                    });
                });
            });
        };

        var makeTexture = {};
        textures = textures || [];
        for (var i=0; i<textures.length; i++) {
            makeTexture[textures[i]] = true;
        }

        var toLoad = 0;
        for (var key in images) {
            toLoad += 1;
        }
        var totalImages = toLoad;
        if (!totalImages && complete) {
            complete();
        }
        for (var key in images) {
            var img = new Image();
            img.src = 'images/' + images[key];
            img.makeTexture = makeTexture[key];
            img.onload = function() {

                if (Math.isPow2(parseInt(this.width)) && Math.isPow2(parseInt(this.height)) && this.makeTexture) {
                    this.texture = new THREE.Texture(this, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping);
                    this.texture.magFilter = THREE.LinearFilter;
                    this.texture.minFilter = THREE.LinearMipMapLinearFilter;
                    //this.texture.anisotropy = Math.min(1, self.renderer.getMaxAnisotropy());
                    this.texture.needsUpdate = true;
                }

                toLoad -= 1;
                if (toLoad === 0) {
                    if (complete)
                        complete();
                }
            };
            images[key] = img;
        }
    };

    this.loadShaders = function(shadersIn, complete) {

        var shaders = [];
        
        for (var i=0; i<shadersIn.vertex.length; i++) {
            shaders.push([
                shadersIn.vertex[i],
                "x-shader/x-vertex"
            ]);
        }

        for (var i=0; i<shadersIn.fragment.length; i++) {
            shaders.push([
                shadersIn.fragment[i],
                "x-shader/x-fragment"
            ]);
        }

        var count = shaders.length;
        if (count === 0 && complete) {
            complete();
        }
        for (var i=0; i<shaders.length; i++)
        {
            jQuery.get("shaders/" + shaders[i][0] + ".glsl", null, function(shader){ return function(data){
                var script = jQuery("<script id=\'SHADER_" + shader[0] + "\' type=\'" + shader[1] + "\'>");
                script.html(data);
                script.appendTo(jQuery(document.head));
                count -= 1;
                if (count === 0 && complete) {
                    complete();
                }
            }; }(shaders[i]));
        }
    };

    this.procImageCache = function (self, key, w, h, ex, cbk) {

        ex = ex || null;

        if (self[key] && parseInt(self[key].width) === parseInt(w) && parseInt(self[key].height) === parseInt(h) && ex === self[key].__ex) {
            return self[key];
        }

        if (self[key]) {
            self[key].destroy();
            self[key] = null;
        }

        self[key] = this.proceduralImage(w, h, cbk, true);
        self[key].__ex = ex;
        return self[key];

    };

    this.proceduralImage = function (w, h, cbk, noTexture) {

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');

        BSWG.initCanvasContext(ctx);

        cbk(ctx, w, h);

        if (!noTexture) {

            canvas.texture = new THREE.Texture(canvas, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping);
            canvas.texture.needsUpdate = true;

            canvas.destroy = function () {

                canvas.texture.dispose();
                canvas.texture = null;
                canvas = null;

            };

        }
        else {

            canvas.destroy = function () {

                canvas = null;

            };

        }

        canvas.debug = function () {

            this.style.position = 'fixed';
            this.style.zIndex = '1000';
            document.body.appendChild(this);

        };

        return canvas;

    };

    var __imgData = new ImageData(2048, 2048);
    var __sqrt = new Float32Array(1 << 21);
    for (var i=0; i<__sqrt.length; i++) {
        __sqrt[i] = Math.sqrt(i/256);
    }

    this.heightMapToNormalMap = function (srcHm, dstCtx, w, h) {

        var x=0, y=0, sx=0, sy=0, dx=0, dy=0, dz=0, len=0, i=0, j=0;
        var sz = w * h;
        for (j=0; j<sz; j++) {
            x = j % w;
            y = (j - x) / w;
    
            sx = 0;
            if (x < (w-1)) {
                sx += srcHm[j+1];
            }
            if (x > 0) {
                sx -= srcHm[j-1];
            }

            sy = 0;
            if (y < (h-1)) {
                sy += srcHm[j+w];
            }
            if (y > 0) {
                sy -= srcHm[j-w];
            }

            dx = -sx*64, dy = 2; dz = sy*64;
            len = __sqrt[~~(dx*dx+dy*dy+dz*dz*256)];
            if (len < 0.000001) {
                dx = dy = dz = 0.0;
            }
            else {
                dx /= len;
                dy /= len;
                dz /= len;
            }

            i = (x + (y << 11)) << 2;

            __imgData.data[i]   = (dx + 1.0) * 0.5 * 255;
            __imgData.data[i+2] = (dy + 1.0) * 0.5 * 255;
            __imgData.data[i+1] = (dz + 1.0) * 0.5 * 255;
            __imgData.data[i+3] = srcHm[j] * 255;
        }
        dstCtx.putImageData(__imgData, 0, 0, 0, 0, w, h);

    };

    this.sizeViewport = function() {

        var lvp = this.viewport;
        this.viewport = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        if (maxRes) {
            if (this.viewport.w > maxRes.w) {
                var aspect = this.viewport.w / this.viewport.h;
                this.viewport.w = maxRes.w;
                this.viewport.h = ~~(maxRes.h / aspect);
            }
        }

        if (!lvp || lvp.w !== this.viewport.w || lvp.h !== this.viewport.h) {
            this.canvas.width = this.viewport.w;
            this.canvas.height = this.viewport.h;
            this.renderer.setSize( this.viewport.w, this.viewport.h );
            this.cam3D.aspect = this.viewport.w / this.viewport.h;
            this.cam3D.updateProjectionMatrix();
            this.composer.setSize(this.viewport.w, this.viewport.h);
            this.effectFXAA.uniforms['resolution'].value.set(1 / this.viewport.w, 1 / this.viewport.h );
            this.bloomPass.resolution.set(1 / this.viewport.w, 1 / this.viewport.h );
            this.resized = true;
            this.renderer.setPixelRatio( window.devicePixelRatio );
        }
        else {
            this.resized = false;
        }
    };

    this.frameSkip = 0;

    this.customCursor = true;
    this.cursorNo = 0;
    this.cursorScale = 1.0;

    var last60dt = new Array(BSWG.options.vsync ? 20 : 60);
    for (var i=0; i<last60dt.length; i++) {
        last60dt[i] = 1.0/60;
    }
    var l60ptr = 0;

    this.next60 = true;
    this.resetl60 = function(){
        for (var i=0; i<last60dt.length; i++) {
            last60dt[i] = 1.0/60;
        }
        l60ptr = 0;
        this.next60 = true;
    };

    this.lastAF = BSWG.options.vsync;

    this.startRenderer = function (cbk) {

        if (this.animFrameID !== null) {
            if (this.lastAf) {
                window.cancelAnimationFrame(this.animFrameID);    
            }
            else {
                window.cancelTimeout(this.animFrameID);
            }
            this.animFrameID = null;
        }

        this.renderCbk = cbk;

        var self = this;
        var renderFrame = function () {

            var lvsync = BSWG.options.vsync;

            if (BSWG.options.vsync && !self.aiTrainMode) {
                self.animFrameID = window.requestAnimationFrame(renderFrame);
                self.lastAF = true;
            }
            else {
                self.animFrameID = window.setTimeout(renderFrame, self.aiTrainMode ? 1 : 16);
                self.lastAF = false;
            }

            var frameTime;
            while (true) {
                frameTime = Date.timeStamp();
                self.actualDt = frameTime - self.lastFrameTime;
                //if (self.actualDt >= (1/66)) {
                    break;
                //}
            }

            if (self.actualDt > 1/10) {
                self.actualDt = 1/10;
            }
            self.lastFrameTime = frameTime;

            if (self.next60) {
                self.actualDt = 1/60;
                self.next60 = false;
            }

            last60dt[l60ptr] = self.actualDt;
            l60ptr = (l60ptr+1) % last60dt.length;

            var avg = 0.0;
            for (var i=0; i<last60dt.length; i++) {
                avg += last60dt[i];
            }
            avg /= last60dt.length;

            var targetDt = 1/(Math.round((1/avg)/5)*5);

            self.dt = targetDt;

            if (self.aiTrainMode) {
                self.dt = 1/30;
            }

            self.time += self.dt;

            self.sizeViewport();
            self.ctx.clearRect(0, 0, self.viewport.w, self.viewport.h);

            if (BSWG.ai.editor && BSWG.ai.editor.isFocused()) {
                BSWG.input.EAT_ALL();
            }

            if (self.renderCbk) {
                self.ctx.save();
                self.renderCbk(self.dt, self.time, self.ctx);
                self.checkCanvas();
                self.ctx.restore();
            }

            if (self.textObjs) {
                for (var i=0; i<self.textObjs.length; i++) {
                    self.textObjs[i].update();
                }
            }

            var tmp = Math.random;
            Math.random = Math._random;

            self.renderer.sortObjects = false;
            //self.renderer.clear();
            
            var Z = 10.0;//Math.clamp(self.cam3D.position.z/1.5+1, 7.1, 10);
            var frange = 150;
            self.cam3DS.left = -(frange+27.5) * (Z/10);
            self.cam3DS.right = (frange+30.0) * (Z/10);
            self.cam3DS.top = (frange*0.75) * (Z/10);
            self.cam3DS.bottom = -(frange*0.75) * (Z/10);
            self.cam3DS.zoom = 1.0;

            self.cam3DS.updateProjectionMatrix();

            var XZ = 1.0;

            self.cam3DS.position.set(self.cam3D.position.x + 5.0*Z*XZ, self.cam3D.position.y + 0.4*Z, 10.0*Z);
            self.cam3DS.updateMatrix();
            self.cam3DS.updateMatrixWorld(true);
            self.cam3DS.lookAt(new THREE.Vector3(self.cam3D.position.x - 5.0*Z*XZ, self.cam3D.position.y - 0.4*Z, 0.0));
            self.cam3DS.updateProjectionMatrix();
            self.cam3DS.updateMatrix();
            self.cam3DS.updateMatrixWorld(true);

            if (BSWG.options.shadows && !self.aiTrainMode) {
                self.renderer.render(self.sceneS, self.cam3DS, self.shadowMap);
            }

            self.renderer.sortObjects = true;

            self.shadowMatrix.copy(self.cam3DS.projectionMatrix);
            self.shadowMatrix.multiply(self.cam3DS.matrixWorldInverse);
            if (!BSWG.options.shadows) {
                self.shadowMatrix.makeTranslation(0,0,100000);
            }
            
            /*self.shadowMatrix.CACHE();
            self.cloudColor.CACHE();
            self.envMapTint.CACHE();
            self.envMapParam.CACHE();*/

            if (!self.aiTrainMode || !((this.frameSkip++)%10)) {
                if (BSWG.options.postProc) {
                    self.composer.render();
                }
                else {
                    self.renderer.render(self.scene, self.cam3D);
                }
            }

            self.ctx.save();

            if (self.customCursor && !self.dlgOpen) {
                document.body.style.cursor = 'none';
                if (BSWG.input.MOUSE('mousein') && (BSWG.specialList.contList.length === 0 || BSWG.ui.mouseBlock || BSWG.ui_DlgBlock)) {
                    self.ctx.drawImage(
                        self.images[
                            self.cursorNo ? 'cursor-custom-' + self.cursorNo :
                            (BSWG.input.MOUSE('left') ? 'cursor-pressed' :
                            (BSWG.input.MOUSE('right') ? 'cursor-pressed-right' : 'cursor-normal'))
                        ],
                        0,   0,
                        128, 128,
                        BSWG.input.MOUSE('x')-32*self.cursorScale,
                        BSWG.input.MOUSE('y')-32*self.cursorScale,
                        64*self.cursorScale,  64*self.cursorScale
                    );
                }
            }
            else {
                document.body.style.cursor = null;
            }
            self.cursorLock = false;

            if (self.dlgOpen) {
                self.ctx.fillStyle = 'rgba(0,0,0,.5)';
                self.ctx.fillRect(0, 0, self.viewport.w, self.viewport.h);
            }

            var newVsync = BSWG.options.vsync;
            if (BSWG.input.KEY_PRESSED(BSWG.KEY.F10)) {
                newVsync = !newVsync;
            }            

            BSWG.input.newFrame();

            Math.random = tmp;

            self.checkCanvas();
            self.ctx.restore();

            self.screenShake -= Math.min(self.dt * 2.0, 1) * self.screenShake;

            if (BSWG.options.vsync !== newVsync) {
                BSWG.options.vsync = newVsync;
                BSWG.saveOptions();
            }

            if (BSWG.options.vsync !== lvsync) {
                last60dt = new Array(BSWG.options.vsync ? 20 : 60);
                for (var i=0; i<last60dt.length; i++) {
                    last60dt[i] = 1.0/60;
                }
                l60ptr = 0;
            }
        };

        if (BSWG.options.vsync && !self.aiTrainMode) {
            this.animFrameID = window.requestAnimationFrame(renderFrame);
            this.lastAF = true;
        }
        else {
            this.animFrameID = window.setTimeout(renderFrame, self.aiTrainMode ? 1 : 16);
            this.lastAF = false;
        }
    };

    this.checkCanvas = function () {

        /*for (var key in this.ctx) {
            var value = this.ctx[key];
            if (!isFinite(value) && (typeof value) !== 'function') {
                console.log(key + ': ' + value);
            }
        }*/

    };

    this.addScreenShake = function(pos, size) {
        size /= 4.0;
        if (!BSWG.game.battleMode && BSWG.game.editMode) {
            size /= 30.0;
        }
        var dx = pos.x - this.cam3D.position.x,
            dy = pos.y - this.cam3D.position.y,
            dz = pos.z - this.cam3D.position.z;
        var dist = (1 + Math.sqrt(dx*dx + dy*dy + dz*dz));
        this.screenShake += size / dist;
    };

    this.updateCam3D = function ( cam, offset ) {
        if (!offset) {
            offset = new b2Vec2(0, 0);
        }

        if (cam) {
            var f = Math.min(this.viewport.h / this.viewport.w, this.viewport.w / this.viewport.h) * 0.54;
            var rx = (Math.random() - 0.5) * 0.5 * this.screenShake,
                ry = (Math.random() - 0.5) * 0.5 * this.screenShake,
                rz = 0; //(Math.random() - 0.5) * 0.1 * this.screenShake;
            this.cam3D.position.set(cam.x+offset.x + rx, cam.y+offset.y + ry, f/cam.z + rz);
            this.cam3D.lookAt(new THREE.Vector3(cam.x + rx, cam.y + ry, 0.0));
            this.cam3D.matrixWorldNeedsUpdate = true;
            this.cam3D.updateMatrix(true);
            this.cam3D.updateMatrixWorld(true);
            this.cam3D.updateProjectionMatrix(true);
            this.scene.matrixWorldNeedsUpdate = true;
            this.scene.updateMatrixWorld(true);
            p1 = p2 = null;
        }
    };

    this.project3D = function ( p, z ) {

        if (p.constructor === Array) {

            var len = p.length;
            var ret = new Array(len);
            for (var i=0; i<len; i++) {
                ret[i] = this.project3D(p[i], z);
            }

            return ret;

        }

        if (this.cam3D && this.viewport) {

            var ret = new THREE.Vector3(p.x, p.y, z).project(this.cam3D);
            ret.x = (ret.x + 1) * this.viewport.w * 0.5;
            ret.y = (-ret.y + 1) * this.viewport.h * 0.5;
            return ret;

        }
        else {

            return new b2Vec2(0, 0);

        }

    };

    this.unproject3D = function ( p, z ) {

        if (p.constructor === Array) {

            var len = p.length;
            var ret = new Array(len);
            for (var i=0; i<len; i++) {
                ret[i] = this.unproject3D(p[i], z);
            }

            return ret;

        }

        if (this.cam3D && this.viewport) {

            if (!z && z !== 0) {
                z = 0.5;
            }

            var p2 = new THREE.Vector3(
                 (p.x / this.viewport.w) * 2 - 1,
                -(p.y / this.viewport.h) * 2 + 1,
                z
            ).unproject(this.cam3D);

            var p2 = p2.sub( this.cam3D.position ).normalize();
            var distance = -this.cam3D.position.z / p2.z;
            p2 = this.cam3D.position.clone().add(p2.multiplyScalar(distance));

            var ret = new b2Vec2(p2.x, p2.y);
            p2 = null;
            return ret;

        }
        else {

            return new b2Vec2(0, 0);

        }

    };

    this.stopRenderer = function () {
        if (this.animFrameID !== null) {
            window.cancelAnimationFrame(this.animFrameID);
            this.animFrameID = null;
        }
        document.body.style.cursor = null;
        this.renderCbk = null;
    };

    this.getShader = function ( id )
    {
        return document.getElementById('SHADER_' + id).textContent;
    };

    var lastRandomValue = null;
    this.newMaterial = function (vertexID, fragmentID, data, blendMode, side) {
        var __tmp = Math.random;
        Math.random = Math._random;

        data = data || {};
        var attr = {};
        var uniforms = {};
        for (var key in data) {
            if (key.indexOf('a_') === 0) {
                attr[key.substring(2)] = data[key];
            }
            else {
                uniforms[key] = data[key];
            }
        }

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            //attributes: attr,
            vertexShader: this.getShader(vertexID),
            fragmentShader: this.getShader(fragmentID),
            transparent: true
        });
        if (side) {
            material.side = side;
        }

        if (blendMode || blendMode === 0) {
            material.blending = blendMode;
        }

        Math.random = __tmp;

        //material.needsUpdate = true;

        return material;
    };

    this.textObjs = [];

    this.geomBBScreen = function(geom, z) {

        if (!geom.boundingBox) {
            geom.computeBoundingBox();
        }

        var min = this.project3D(geom.boundingBox.min, z||0.0);
        var max = this.project3D(geom.boundingBox.max, z||0.0);

        return {
            x: Math.min(min.x, max.x),
            y: Math.min(min.y, max.y),
            w: Math.abs(max.x - min.x),
            h: Math.abs(max.y - min.y)
        };

    };

    this.make3DText = function(text, size, depth, clr, pos, lowDetial, fixedTScale) {

        var geom = new THREE.TextGeometry(
            text,
            {
                font:           this.font3D,
                size:           4,
                height:         (depth/size)*4,
                curveSegments:  lowDetial ? 2 : 3,
                bevelEnabled:   true,
                bevelThickness: 4 * 0.05,
                bevelSize:      4 * 0.05
            }
        );

        var bgeom = new THREE.BufferGeometry();
        bgeom.fromGeometry(geom);
        geom = bgeom;
        bgeom = null;

        geom.computeBoundingBox();
        geom.computeVertexNormals();

        var xOffset = -(geom.boundingBox.max.x - geom.boundingBox.min.x) / 2.0;

        clr = clr || [0.5,0.5,0.5,1.0];

        material = BSWG.render.newMaterial("basicVertex", "textFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(clr[0], clr[1], clr[2], clr[3])
            },
            map: {
                type: 't',
                value: BSWG.render.images['test_nm'].texture
            },
            extra: {
                type: 'v4',
                value: new THREE.Vector4(1,0,0,0)
            },
            envMap: {
                type: 't',
                value: BSWG.render.envMap.texture
            },
            envMap2: {
                type: 't',
                value: BSWG.render.envMap2.texture
            },
            envMapT: {
                type: 'f',
                value: BSWG.render.envMapT
            },
            envMapTint: {
                type: 'v4',
                value: BSWG.render.envMapTint
            },
            envMapParam: {
                type: 'v4',
                value: BSWG.render.envMapParam
            },
            viewport: {
                type: 'v2',
                value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
            }
        });

        //shadowMat = BSWG.render.newMaterial("basicVertex", "shadowFragment", {});
        //shadowMesh = new THREE.Mesh( geom, shadowMat );

        mesh = new THREE.Mesh( geom, material );
        mesh.renderOrder = 1450.0;

        pos = pos || new THREE.Vector3(0, 0, 0);

        mesh.position.x = pos.x + xOffset*size/4;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;

        mesh.scale.set(size/4, size/4, size/4);

        mesh.rotation.x = 0;
        mesh.rotation.y = Math.PI * 2;

        //shadowMesh.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);
        //shadowMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
        //shadowMesh.updateMatrix();
        //this.sceneS.add(shadowMesh);

        this.scene.add(mesh);
        var self = this;

        var obj = {
            mesh: mesh,
            mat: material,
            added: true,
            geom: geom,
            clr: clr,
            pos: pos,
            size: size,
            //shadowMesh: shadowMesh,
            //shadowMat: shadowMat,
            destroy: function() {
                this.added = false;
                BSWG.render.scene.remove(this.mesh);
                //BSWG.render.sceneS.remove(this.shadowMesh);

                this.mesh.geometry.dispose();
                this.mesh.material.dispose();
                this.mesh.geometry = null;
                this.mesh.material = null;
                this.mesh = null;
                this.mat = null;
                this.geom = null;
                //this.shadowMesh.geometry = null;
                //this.shadowMesh.material = null;
                //this.shadowMat.dispose();
                //this.shadowMat = null;
                //this.shadowMesh = null;

                for (var i=0; i<self.textObjs.length; i++) {
                    if (self.textObjs[i] === this) {
                        self.textObjs.splice(i, 1);
                        break;
                    }
                }
            },
            update: function() {

                if (this.clr[3] <= 0) {
                    if (this.added) {
                        this.added = false;
                        BSWG.render.scene.remove(this.mesh);
                    }
                }
                else {
                    if (!this.added) {
                        this.added = true;
                        BSWG.render.scene.add(this.mesh);
                    }
                }

                var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);

                if (this.pos) {
                    this.mesh.scale.set(this.size/4, this.size/4, this.size/4);
                    this.mesh.position.set(this.pos.x + xOffset*this.size/4, this.pos.y, this.pos.z);
                    this.mesh.updateMatrix();
                    this.mesh.updateMatrixWorld(true);
                }

                //this.shadowMesh.scale.set(this.mesh.scale.x, this.mesh.scale.y, this.mesh.scale.z);
                //this.shadowMesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
                //this.shadowMesh.updateMatrix();

                if (fixedTScale) {
                    this.mat.uniforms.extra.value.x = fixedTScale;
                }
                else {
                    this.mat.uniforms.extra.value.x = 1.0 * this.mesh.scale.z;
                }

                this.mat.uniforms.viewport.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);
                this.mat.uniforms.envMapT.value = BSWG.render.envMapT;

                if (this.clr) {
                    this.mat.uniforms.clr.value.set(this.clr[0], this.clr[1], this.clr[2], this.clr[3]);
                }

                //this.mat.needsUpdate = true;

                lp = null;
            }
        };

        this.textObjs.push(obj);
        return obj;
    }

    this.setCustomCursor = function(flag, number, scale, lock) {
        if (this.cursorLock) {
            return;
        }
        this.cursorScale = scale || 1;
        this.cursorNo = number || 0;
        this.customCursor = !!flag;
        this.cursorLock = !!lock;
    };

    this.test = function () {
        console.log('b');
    };

}();