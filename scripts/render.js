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
            ctx.lineWidth = 3.5;
            for (var i=0; i<widths.length; i++) {
                var ch = text.charAt(i) + '';
                /*ctx.fillText(ch, x-2, y);
                ctx.fillText(ch, x+2, y);
                ctx.fillText(ch, x, y-2);
                ctx.fillText(ch, x, y+2);*/
                ctx.strokeText(ch, x, y);
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

    var maxRes = null; //{ w: 1920, h: 1080 };

    this.init = function(complete, images, shaders) {

        if (!Detector.webgl) {
            alert('WebGL not supported.');
            return;
        }

        document.body.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.canvas.oncontextmenu = function(){ return false; };
        this.canvas.style.position = 'fixed';
        this.canvas.style.zIndex = 2;
        this.ctx = this.canvas.getContext('2d');

        this.canvas3D = document.createElement('canvas');
        this.canvas3D.style.position = 'fixed';
        this.canvas3D.style.zIndex = 1;
        this.canvas3D.oncontextmenu = function(){ return false; };

        this.cam3D = new THREE.PerspectiveCamera(85, 1.5, 1.0, 1000);
        this.cam3D.position.z = 10.0;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3D, alpha: true, antialias: true });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.loader = new THREE.JSONLoader();
        this.raycaster = new THREE.Raycaster();
    
        this.sizeViewport();

        BSWG.initCanvasContext(this.ctx);

        this.ctx.clearRect(0, 0, this.viewport.w, this.viewport.h);
        this.ctx.font = '48px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#77d';
        this.ctx.fillTextB('Loading ...', 48, this.viewport.h - 48, true);

        document.body.appendChild(this.canvas);
        document.body.appendChild(this.canvas3D);

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
                        if (ocomplete) {
                            ocomplete();
                        }
                    });
                });
            });
        };

        var toLoad = 0;
        for (var key in images) {
            toLoad += 1;
        }
        var totalImages = toLoad;
        if (!totalImages && complete)
            complete();
        for (var key in images) {
            var img = new Image();
            img.src = 'images/' + images[key];
            img.onload = function() {

                if (Math.isPow2(parseInt(this.width)) && Math.isPow2(parseInt(this.height))) {
                    this.texture = new THREE.Texture(this, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping);
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

    this.heightMapToNormalMap = function (srcHm, dstCtx, w, h, tileMask) {

        tileMask = tileMask || 0;

        var H = function(a, b) {
            while (a < 0 && (tileMask & 1)) {
                a += w;
            }
            while (b < 0 && (tileMask & 4)) {
                b += h;
            }
            while (a >= w && (tileMask & 2)) {
                a -= w;
            }
            while (b >= h && (tileMask & 8)) {
                b -= h;
            }
            if (a < 0 || b < 0 || a >= w || b >= h) {
                return 0.0;
            }
            else {
                return srcHm[(~~a)+(~~b)*w];
            }
        };

        var O = function(v) {
            return Math.max(0, Math.min(255, Math.floor(v * 255)));
        };

        var imgData = dstCtx.getImageData(0, 0, w, h);
        for (var i=0; i<imgData.data.length; i+=4) {
            var x = (~~(i/4)) % w;
            var y = ((~~(i/4)) - x) / w;
    
            var sx = H(x+1, y) - H(x-1, y);
            var sy = H(x, y+1) - H(x, y-1);

            var dx = -sx*64, dy = 2; dz = sy*64;
            var len = Math.sqrt(dx*dx+dy*dy+dz*dz);
            if (len < 0.000001) {
                dx = dy = dz = 0.0;
            }
            else {
                dx /= len; dy /= len; dz /= len;
            }

            imgData.data[i]   = O((dx + 1.0) * 0.5);
            imgData.data[i+2] = O((dy + 1.0) * 0.5);
            imgData.data[i+1] = O((dz + 1.0) * 0.5);
            imgData.data[i+3] = O(H(x, y));
        }

        dstCtx.putImageData(imgData, 0, 0);

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
        this.canvas.width = this.viewport.w;
        this.canvas.height = this.viewport.h;
        /*this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';*/

        /*this.canvas3D.width = this.viewport.w;
        this.canvas3D.height = this.viewport.h;
        this.canvas3D.style.width = '100%';
        this.canvas3D.style.height = '100%';*/

        if (!lvp || lvp.w !== this.viewport.w || lvp.h !== this.viewport.h) {
            this.renderer.setSize( this.viewport.w, this.viewport.h );
            this.cam3D.aspect = this.viewport.w / this.viewport.h;
            this.cam3D.updateProjectionMatrix();
            this.resized = true;
        }
        else {
            this.resized = false;
        }
    };

    this.customCursor = true;
    this.cursorNo = 0;
    this.cursorScale = 1.0;

    var last60dt = new Array(60);
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

    this.startRenderer = function (cbk) {

        if (this.animFrameID !== null) {
            window.cancelAnimationFrame(this.animFrameID);
            this.animFrameID = null;
        }

        this.renderCbk = cbk;

        sumDt = 1;

        var self = this;
        var renderFrame = function () {

            self.animFrameID = window.requestAnimationFrame(renderFrame);

            var frameTime = Date.timeStamp();
            self.actualDt = frameTime - self.lastFrameTime;
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

            var avg = 1/60.0;
            for (var i=0; i<last60dt.length; i++) {
                avg += last60dt[i];
            }
            avg /= last60dt.length + 1;

            var targetDt = 1/60;
            if ((1/avg) < 15) {
                targetDt = 1/10;
            }
            else if ((1/avg) < 25) {
                targetDt = 1/20;
            }
            else if ((1/avg) < 35) {
                targetDt = 1/30;
            }
            else if ((1/avg) < 45) {
                targetDt = 1/40;
            }
            else if ((1/avg) < 55) {
                targetDt = 1/50;
            }

            sumDt += self.actualDt;

            if (sumDt < targetDt * 0.935) {
                return;
            }
            while (sumDt >= targetDt) {
                sumDt -= targetDt;
            }

            self.dt = targetDt;
            self.time += self.dt;

            self.sizeViewport();
            self.ctx.clearRect(0, 0, self.viewport.w, self.viewport.h);

            if (BSWG.ai.editor && BSWG.ai.editor.isFocused()) {
                BSWG.input.EAT_ALL();
            }

            if (self.renderCbk) {
                self.renderCbk(self.dt, self.time, self.ctx);
            }

            if (self.textObjs) {
                for (var i=0; i<self.textObjs.length; i++) {
                    self.textObjs[i].update();
                }
            }

            self.renderer.clear();
            self.renderer.render( self.scene, self.cam3D );

            if (self.customCursor && !self.dlgOpen) {
                document.body.style.cursor = 'none';
                if (BSWG.input.MOUSE('mousein')) {
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

            if (self.dlgOpen) {
                self.ctx.fillStyle = 'rgba(0,0,0,.5)';
                self.ctx.fillRect(0, 0, self.viewport.w, self.viewport.h);
            }

            BSWG.input.newFrame();
        };

        self.animFrameID = window.requestAnimationFrame(renderFrame);
    };

    this.updateCam3D = function ( cam, offset ) {
        if (!offset) {
            offset = new THREE.Vector3(0,0,0);
        }
        if (cam) {
            var f = Math.min(this.viewport.h / this.viewport.w, this.viewport.w / this.viewport.h) * 0.54;
            this.cam3D.position.set(cam.x+offset.x, cam.y+offset.y, f/cam.z);
            this.cam3D.lookAt(new THREE.Vector3(cam.x, cam.y, 0.0));
            this.cam3D.updateProjectionMatrix();
            this.cam3D.updateMatrix();
            this.cam3D.updateMatrixWorld();
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

            var p2 = new THREE.Vector3(p.x, p.y, z).project(this.cam3D);
            return new b2Vec2(
                (p2.x + 1) * this.viewport.w * 0.5,
                (-p2.y + 1) * this.viewport.h * 0.5
            );

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

            var p2 = new THREE.Vector3(
                 (p.x / this.viewport.w) * 2 - 1,
                -(p.y / this.viewport.h) * 2 + 1,
                0.5
            ).unproject(this.cam3D);

            var dir = p2.sub( this.cam3D.position ).normalize();
            var distance = -this.cam3D.position.z / dir.z;
            p2 = this.cam3D.position.clone().add(dir.multiplyScalar(distance));

            return new b2Vec2(p2.x, p2.y);

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
        var rand = Math.random();
        if (lastRandomValue === rand) { // using seed random other places can lead to materials with duplicate UUIDs
            Math.seedrandom();
        }
        lastRandomValue = rand;

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

        material.needsUpdate = true;

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
                curveSegments:  lowDetial ? 2 : 12,
                bevelEnabled:   true,
                bevelThickness: 4 * 0.05,
                bevelSize:      4 * 0.05
            }
        );

        geom.computeBoundingBox();
        geom.computeFaceNormals();

        var xOffset = -(geom.boundingBox.max.x - geom.boundingBox.min.x) / 2.0;

        clr = clr || [0.5,0.5,0.5,1.0];

        material = BSWG.render.newMaterial("basicVertex", "textFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(clr[0], clr[1], clr[2], clr[3])
            },
            light: {
                type: 'v4',
                value: new THREE.Vector4(BSWG.game.cam.x, BSWG.game.cam.y, 20.0, 1.0)
            },
            map: {
                type: 't',
                value: BSWG.render.images['test_nm'].texture
            },
            extra: {
                type: 'v4',
                value: new THREE.Vector4(1,0,0,0)
            }
        });

        mesh = new THREE.Mesh( geom, material );

        pos = pos || new THREE.Vector3(0, 0, 0);

        mesh.position.x = pos.x + xOffset*size/4;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;

        mesh.scale.set(size/4, size/4, size/4);

        mesh.rotation.x = 0;
        mesh.rotation.y = Math.PI * 2;

        this.scene.add(mesh);

        var self = this;

        var obj = {
            mesh: mesh,
            mat: material,
            geom: geom,
            clr: clr,
            pos: pos,
            size: size,
            destroy: function() {
                BSWG.render.scene.remove(this.mesh);

                this.mesh.geometry.dispose();
                this.mesh.material.dispose();
                this.mesh.geometry = null;
                this.mesh.material = null;
                this.mesh = null;
                this.mat = null;
                this.geom = null;

                for (var i=0; i<self.textObjs.length; i++) {
                    if (self.textObjs[i] === this) {
                        self.textObjs.splice(i, 1);
                        break;
                    }
                }
            },
            update: function() {

                var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);

                if (this.pos) {
                    this.mesh.scale.set(this.size/4, this.size/4, this.size/4);
                    this.mesh.position.set(this.pos.x + xOffset*this.size/4, this.pos.y, this.pos.z);
                    this.mesh.updateMatrix();
                }

                this.mat.uniforms.light.value.x = lp.x;
                this.mat.uniforms.light.value.y = lp.y;
                this.mat.uniforms.light.value.z = BSWG.render.cam3D.position.z * 7.0;

                if (fixedTScale) {
                    this.mat.uniforms.extra.value.x = fixedTScale;
                }
                else {
                    this.mat.uniforms.extra.value.x = 1.0 * this.mesh.scale.z;
                }

                if (this.clr) {
                    this.mat.uniforms.clr.value.set(this.clr[0], this.clr[1], this.clr[2], this.clr[3]);
                }

                this.mat.needsUpdate = true;
            }
        };

        this.textObjs.push(obj);
        return obj;
    }

    this.setCustomCursor = function(flag, number, scale) {
        this.cursorScale = scale || 1;
        this.cursorNo = number || 0;
        this.customCursor = !!flag;
    };

    this.test = function () {
        console.log('b');
    };

}();