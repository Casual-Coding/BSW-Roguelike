BSWG.d3dr_LUT = {};

BSWG.ui_HM = function(w, h, aw, ah) {

    w = ~~w;
    h = ~~h;

    aw = ~~(aw || w);
    ah = ~~(ah || h);

    var max = Math.max(aw, ah);
    aw = ~~((aw / max) * Math.max(w, h));
    ah = ~~((ah / max) * Math.max(w, h));

    var len = w*h;
    var H = new Array(len);
    for (var i=0; i<len; i++) {
        H[i] = 0.0;
    }
    var hudBtn = new Array();
    var S = function(x,y,v) {
        if (x>=0 && y>=0 && x<w && y<h) {
            H[(~~x)+(~~y)*w] = v;
        }
    };
    var G = function(x,y) {
        if (x>=0 && y>=0 && x<w && y<h) {
            return H[(~~x)+(~~y)*w];
        }
        else {
            return 0.0;
        }
    };
    var circ = function(sx,sy,r, depthEdge, depth) {
        for (var x=sx-r; x<=(sx+r); x++) {
            for (var y=sy-r; y<=(sy+r); y++) {
                var dedge = r - Math.sqrt((x-sx)*(x-sx)+(y-sy)*(y-sy));
                if (dedge >= 0) {
                    var t = Math.max(dedge/2.5, 1.0);
                    S(x,y,depth*t+depthEdge*(1-t));
                }
            }
        }
    };
    var box = function(sx,sy,bw,bh, depthEdge, depth) {
        for (var x=sx; x<(sx+bw); x++) {
            for (var y=sy; y<(sy+bh); y++) {
                var dedge = Math.min(x-sx, Math.min(y-sy, Math.min((sx+bw-1)-x, (sy+bh-1)-y)));
                var t = Math.clamp(dedge / 5, 0.0, 1.0);
                S(x,y,depth*t+depthEdge*(1-t));
            }
        }
    };
    var plate = function(sx,sy,bw,bh, depthEdge, depth) {
        box(sx,sy,bw,bh, depthEdge, depth);
        circ(sx+11, sy+11, 4, depth+0.1, depth+0.2);
        circ(sx+bw-11, sy+bh-11, 4, depth+0.1, depth+0.2);
        circ(sx+11, sy+bh-11, 4, depth+0.1, depth+0.2);
        circ(sx+bw-11, sy+11, 4, depth+0.1, depth+0.2);
        if (depth < depthEdge) {
            hudBtn.push([sx,sy,sx+bw,sy+bh]);
        }
    };
    var aspect = aw/ah;
    return {
        H: H,
        circ: circ,
        box: box,
        plate: plate,
        hudBtn: hudBtn,
        l: function(v) {
            if (aspect >= 1) {
                return v;
            }
            else {
                return v;
            }
        },
        r: function(v) {
            if (aspect >= 1) {
                return (w-1)-v;
            }
            else {
                return ((w-1)-(ah-aw))-v;
            }
        },
        t: function(v) {
            if (aspect <= 1) {
                return v;
            }
            else {
                return v + (aw-ah);
            }
        },
        b: function(v) {
            if (aspect <= 1) {
                return (h-1)-v;
            }
            else {
                return ((h-1)-v);
            }
        }
    };
};

BSWG.uiP3D_list = new Array();

BSWG.uiPlate3D = function(hudNM, x, y, w, h, z, clr, split, moving) {

    var vp = BSWG.render.viewport;

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = split ? vp.w : w;
    this.h = split ? vp.h : h;

    this.hudGeom = new THREE.PlaneGeometry(2.0, 2.0, 1, 1);
    this.hudMat = BSWG.render.newMaterial("hudVertex", "hudFragment", {
        vp: {
            type: 'v2',
            value: new THREE.Vector2(w, h)
        },
        hudNm: {
            type: 't',
            value: hudNM.texture
        },
        texNm: {
            type: 't',
            value: BSWG.render.images['grass_nm'].texture
        },
        clr: {
            type: 'v4',
            value: new THREE.Vector4(
                clr ? clr[0] : 1,
                clr ? clr[1] : 1,
                clr ? clr[2] : 1,
                clr ? clr[3] : 1
            )
        },
        extra: {
            type: 'v4',
            value: new THREE.Vector4(
                split ? 1.0 : 0.0,
                0.0,
                moving ? 1.0 : 0.0,
                0.0
            )
        },
        scale: {
            type: 'v4',
            value: new THREE.Vector4(w/vp.w, h/vp.h, this.x/vp.w, this.y/vp.h)
        }
    });

    this.hudMesh = new THREE.Mesh( this.hudGeom, this.hudMat );
    this.hudMesh.frustumCulled = false;
    this.hudMesh.position.set(-1.0, -1.0, 4.0 + this.z);
    this.hudMesh.scale.set(w/vp.w, h/vp.h, 1.0);
    this.hudMesh.updateMatrix();
    
    this.hudMesh.needsUpdate = true;
    this.hudMat.needsUpdate = true;

    this.set_pos = function (_x, _y) {
        this.x = _x;
        this.y = _y;
    };

    this.set_z = function (_z) {
        this.z = _z;
    };

    this.set_size = function (_w, _h) {
        this.w = _w;
        this.h = _h;
    };

    this.set_invert = function (flag) {
        if (!this.hudMat) {
            return;
        }
        this.hudMat.uniforms.extra.value.set(
            this.split ? 1.0 : 0.0,
            flag ? 1.0 : 0.0,
            moving ? 1.0 : 0.0,
            0.0
        );
        this.hudMat.needsUpdate = true;
    }

    this.set_clr = function (clr) {
        if (!this.hudMat) {
            return;
        }
        this.hudMat.uniforms.clr.value.set(
            clr ? clr[0] : 1,
            clr ? clr[1] : 1,
            clr ? clr[2] : 1,
            clr ? clr[3] : 1
        );
        this.hudMat.needsUpdate = true;
    };

    this.set_nm = function (nm) {
        if (!this.hudMat) {
            return;
        }
        this.hudMat.uniforms.hudNm.value = nm.texture;
        this.hudMat.needsUpdate = true;
    };

    this.update = function (dt) {

        if (this.hudMesh) {
            var vp = BSWG.render.viewport;
            var p = BSWG.game.cam.toWorld(vp, this.x, this.y);

            if (split) {
                this.w = vp.w;
                this.h = vp.h;
            }

            this.hudMesh.position.set(p.x, p.y, 4.0 + this.z);
            this.hudMesh.scale.set(this.w/vp.w, this.h/vp.h, 1.0);
            this.hudMesh.updateMatrix();

            var x = this.x;
            var y = this.y;

            if (!split) {
                x -= vp.w * 0.5;
                y -= vp.h * 0.5;
                x += this.w * 0.5;
                y += this.h * 0.5;
            }

            this.hudMat.uniforms.scale.value.set(this.w/vp.w, this.h/vp.h, x/vp.w*2.0, y/vp.h*2.0);
            this.hudMat.uniforms.vp.value.set(this.w, this.h);
            this.hudMat.needsUpdate = true;
        }

    };

    this.update(1/60);

    this.remove = function () {

        if (!this.hudMesh) {
            return;
        }

        BSWG.render.scene.remove( this.hudMesh );

        this.hudMesh.geometry.dispose();
        this.hudMesh.material.dispose();
        this.hudMesh.geometry = null;
        this.hudMesh.material = null;
        this.hudMesh = null;
        this.hudMat = null;
        this.hudGeom = null;

        for (var i=0; i<BSWG.uiP3D_list.length; i++) {
            if (BSWG.uiP3D_list[i] === this) {
                BSWG.uiP3D_list.splice(i, 1);
                break;
            }
        }

    };
    
    BSWG.render.scene.add( this.hudMesh );

    BSWG.uiP3D_list.push(this);

};

BSWG.uiP3D_update = function(dt) {

    for (var i=0; i<BSWG.uiP3D_list.length; i++) {
        BSWG.uiP3D_list[i].update(dt);
    }

};

BSWG.draw3DRect = function(ctx, x1, y1, w, h, insz, pressedIn, outline) {

    var key = ctx.fillStyle + ',' + w + ',' + h + ',' + insz + ',' + pressedIn + ',' + outline;

    if (BSWG.d3dr_LUT[key]) {
        ctx.drawImage(BSWG.d3dr_LUT[key], x1-1, y1-1);
        return;
    }

    var octx = ctx;
    var ox1 = x1, oy1 = y1;

    x1 = y1 = 1;

    BSWG.d3dr_LUT[key] = BSWG.render.proceduralImage(w+2, h+2, function(ctx) {

        ctx.clearRect(0, 0, w+2, h+2);
        ctx.globalAlpha = octx.globalAlpha;
        ctx.fillStyle = octx.fillStyle;

        var x2 = x1+w, y2 = y1+h;

        var zcenter = new b2Vec2((x1+x2)*0.5, (y1+y2)*0.5);
        var iscaleh = (w-insz) / w, iscalev = (h-insz) / h;

        var overts = [
            new b2Vec2(x1, y1),
            new b2Vec2(x2, y1),
            new b2Vec2(x2, y2),
            new b2Vec2(x1, y2)
        ];
        if (pressedIn) overts.reverse();
        var len = overts.length;
        var iverts = new Array(len);

        for (var i=0; i<len; i++) {
            var vec = new b2Vec2(
                (overts[i].x - zcenter.x) * iscaleh + zcenter.x,
                (overts[i].y - zcenter.y) * iscalev + zcenter.y
            );
            iverts[i] = vec;
        }

        ctx.beginPath();
        ctx.moveTo(overts[0].x, overts[0].y);
        for (var i=1; i<len; i++) {
            ctx.lineTo(overts[i].x, overts[i].y);
        }
        ctx.closePath();
        ctx.fill();

        if (outline) {
            ctx.strokeStyle = outline;
            ctx.lineWidth = 2.0;
            ctx.stroke();
            ctx.lineWidth = 1.0;
        }

        var oAlpha = parseFloat(ctx.globalAlpha);
        ctx.fillStyle = '#999';

        for (var i=0; i<len; i++) {
            var j = (i+1) % len;

            var a = overts[i], b = overts[j],
                c = iverts[j], d = iverts[i];

            var angle = Math.atan2(b.y - a.y, b.x - a.x);
            var alpha = Math.sin(angle + Math.PI/4.0) * 0.5 + 0.5;
            ctx.globalAlpha = oAlpha * alpha * 0.6;

            var grad = ctx.createLinearGradient(a.x,a.y, c.x,c.y);
            grad.addColorStop(0,"#999");
            grad.addColorStop(1,"#555");

            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.closePath();
            ctx.fill();
        }

        var grad = ctx.createLinearGradient(iverts[0].x,iverts[0].y, iverts[2].x, iverts[2].y);
        if (pressedIn) {
            grad.addColorStop(0,"#000");
            grad.addColorStop(1,"#222");
        }
        else {
            grad.addColorStop(0,"#999");
            grad.addColorStop(1,"#666");        
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.globalAlpha = 0.65 * (pressedIn ? 0.4 : 1.0);
        ctx.moveTo(iverts[0].x, iverts[0].y);
        for (var i=1; i<len; i++) {
            ctx.lineTo(iverts[i].x, iverts[i].y);
        }
        ctx.closePath();
        ctx.fill();

    });

    octx.drawImage(BSWG.d3dr_LUT[key], ox1-1, oy1-1);

};

BSWG.control_Button = {

    init: function (args) {

    },

    destroy: function () {
        if (this.hudNM) {
            this.hudNM.destroy();
            this.hudNM = null;
        }
        if (this.hudObj) {
            this.hudObj.remove();
            this.hudObj = null;
        }
    },

    onremove: function() {
        this.destroy();
    },

    render: function (ctx, viewport) {

        var aw = this.w, ah = this.h;

        if (!this.hudNM || aw !== this.lastAW || ah !== this.lastAH) {

            if (this.hudNM) {
                this.hudNM.destroy();
            }

            var max = Math.max(this.w, this.h);
            var sz = 64;
            while (sz < max && sz < 2048) {
                sz *= 2;
            }

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.box(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.25, 0.5);
                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

            }, true);

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {

            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.p.x, this.p.y, // x, y
                this.w, this.h, // w, h
                0.1, // z
                [1,1,1,1], // color
                false // split
            );
        }

        if (this.hudObj) {
            this.hudObj.set_pos(this.p.x, this.p.y);
            this.hudObj.set_size(this.w, this.h);
            this.hudObj.set_invert(this.selected || this.mouseDown);
            this.hudObj.set_clr(this.mouseIn ? [1.1, 1.1, 1.3, 1] : [0.9, 0.9, 1, 1]);
        }

        ctx.font = Math.min(~~(this.h * 0.5), 16) + 'px Orbitron';

        if (this.selected) {
            ctx.strokeStyle = '#777';
        }
        else {
            ctx.strokeStyle = '#999';
        }

        if (this.selected) {
            ctx.fillStyle = 'rgba(100,100,100,1)';
        }
        else {
            ctx.fillStyle = 'rgba(50,50,50,1)';
        }
            
        ctx.lineWidth = 2.0;

        ctx.globalAlpha = 0.5;

        //if (typeof this.text === 'string') {
        //    BSWG.draw3DRect(ctx, this.p.x, this.p.y, this.w, this.h, 7, this.selected || this.mouseDown, this.mouseIn ? 'rgba(255,255,255,0.45)' : null);
        //}

        ctx.globalAlpha = 1.0;

        ctx.lineWidth = 1.0;

        ctx.textAlign = 'center';
        if (this.selected) {
            ctx.fillStyle = '#ddf';
        }
        else {
            ctx.fillStyle = '#fff';
        }

        ctx.strokeStyle = '#111';
        if (typeof this.text !== 'string') {
            ctx.drawImage(this.text, 0, 0, this.text.width, this.text.height, this.p.x + this.w * 0.5 - this.h*0.4, this.p.y + this.h*0.1, this.h*0.8, this.h*0.8);
        }
        else {
            ctx.fillTextB(this.text, this.p.x + this.w*0.5, this.p.y + this.h*0.5+6);
        }

        ctx.textAlign = 'left';

    },

    update: function () {

    },

};

BSWG.control_Menu = {

    init: function (args) {

        this.w = 0;
        this.h = 8;

        for (var i=0; i<args.buttons.length; i++) {
            this.w = Math.max(this.w, 16 + args.buttons[i].w);
            this.h += args.buttons[i].h + 8;
        }

        this.buttons = args.buttons;

    },

    destroy: function () {
        for (var i=0; i<this.buttons.length; i++) {
            this.buttons[i].remove();
        }
        this.buttons.length = 0;
        if (this.hudNM) {
            this.hudNM.destroy();
            this.hudNM = null;
        }
        if (this.hudObj) {
            this.hudObj.remove();
            this.hudObj = null;
        }
    },

    onremove: function() {
        this.destroy();
    },

    render: function (ctx, viewport) {

        var y = this.p.y + 8;
        for (var i=0; i<this.buttons.length; i++) {
            this.buttons[i].w = this.w-16;
            this.buttons[i].p.x = this.p.x+8;
            this.buttons[i].p.y = y;
            y += this.buttons[i].h + 8;
        }

        var aw = this.w, ah = this.h;

        if (!this.hudNM || aw !== this.lastAW || ah !== this.lastAH) {

            if (this.hudNM) {
                this.hudNM.destroy();
            }

            var max = Math.max(this.w, this.h);
            var sz = 64;
            while (sz < max && sz < 2048) {
                sz *= 2;
            }

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);
                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

            }, true);

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.p.x, this.p.y, // x, y
                this.w, this.h, // w, h
                0.05, // z
                [1,1,1,1], // color
                false // split
            );
        }

        if (this.hudObj) {
            this.hudObj.set_pos(this.p.x, this.p.y);
            this.hudObj.set_size(this.w, this.h);
        }

    },

    update: function () {

    },

};

BSWG.control_CompPalette = {

    init: function (args) {

        var x = 10, y = 10;

        var CL = BSWG.componentList.sbTypes;
        var headers = new Array(CL.length);
        var buttons = new Array();

        if (args.clickInner) {
            this.clickInner = args.clickInner;
        }

        for (var i=0; i<CL.length; i++) {
            headers[i] = {
                x: x,
                y: y,
                text: CL[i].name
            };
            y += 20;

            var SBL = CL[i].sbadd;
            var x2 = x;
            var w = ~~((this.w-20) / 3);
            for (var j=0; j<SBL.length; j++) {
                buttons.push({
                    args: SBL[j],
                    text: SBL[j].title,
                    comp: CL[i],
                    x: x2, y: y,
                    w: w, h: 18,
                    mouseIn: false,
                    mouseDown: false
                });
                x2 += w;
                if (((j+1)%3) === 0) {
                    x2 = x;
                    y += 20;
                }
            }
            if (SBL.length % 3) {
                y += 20;
            }
            y += 5;
        }

        this.h = y+5;

        this.headers = headers;
        this.buttons = buttons;

    },

    destroy: function () {
        if (this.hudNM) {
            this.hudNM.destroy();
            this.hudNM = null;
        }
        if (this.hudObj) {
            this.hudObj.remove();
            this.hudObj = null;
        }
    },

    render: function (ctx, viewport) {

        var aw = this.w, ah = this.h;

        if (!this.hudNM || aw !== this.lastAW || ah !== this.lastAH) {

            if (this.hudNM) {
                this.hudNM.destroy();
            }

            var max = Math.max(this.w, this.h);
            var sz = 64;
            while (sz < max && sz < 2048) {
                sz *= 2;
            }

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);
                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

            }, true);

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.p.x, this.p.y, // x, y
                this.w, this.h, // w, h
                0.05, // z
                [.9,.9,1.1,1], // color
                false, // split
                true // moving
            );
        }

        if (this.hudObj) {
            this.hudObj.set_pos(this.p.x, this.p.y);
            this.hudObj.set_size(this.w, this.h);
        }

        ctx.font = '16px Orbitron';

        ctx.fillStyle = 'rgba(50,50,50,0.5)';
            
        //ctx.lineWidth = 2.0;

        //BSWG.draw3DRect(ctx, this.p.x, this.p.y, this.w, this.h, 4, false, null);

        ctx.lineWidth = 1.0;

        for (var i=0; i<this.headers.length; i++) {
            var H = this.headers[i];
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ddf';
            ctx.strokeStyle = '#111';
            ctx.fillTextB(H.text, this.p.x + H.x, this.p.y + H.y + 12);            
        }

        for (var i=0; i<this.buttons.length; i++) {
            var B = this.buttons[i];
            ctx.font = '12px Orbitron';
            ctx.strokeStyle = '#888';
            ctx.fillStyle = 'rgba(50,50,50,1)';
                
            ctx.lineWidth = 2.0;

            ctx.fillStyle = B.mouseDown ?
                'rgba(32, 32, 32, 0.9)' :
                (B.mouseIn ?
                    'rgba(128, 128, 128, 0.8)' :
                    'rgba(128, 128, 128, 0.5)'
                );
            ctx.fillRect(this.p.x + B.x, this.p.y + B.y, B.w-1, B.h);

            ctx.lineWidth = 1.0;

            ctx.textAlign = 'center';
            ctx.fillStyle = B.mouseDown ? '#bbb' : '#bbb';
            ctx.fillText(B.text, B.x + this.p.x + B.w*0.5, B.y + this.p.y + B.h*0.5+4);

            ctx.textAlign = 'left';            
        }

    },

    update: function () {

        var toX = 2048;

        if (BSWG.game.editMode) {
            toX = BSWG.render.viewport.w - (this.w);
        }

        this.p.x += (toX - this.p.x) * BSWG.render.dt * 4.0;
        this.p.y = BSWG.game.hudBottomY - this.h;

        if (this.buttons && this.mouseIn) {

            var mx = BSWG.input.MOUSE('x') - this.p.x;
            var my = BSWG.input.MOUSE('y') - this.p.y;

            for (var i=0; i<this.buttons.length; i++) {

                var B = this.buttons[i];

                if (mx >= B.x && my >= B.y && mx < (B.x + B.w) && my < (B.y + B.h) && !BSWG.game.grabbedBlock)
                    B.mouseIn = true;
                else
                    B.mouseIn = false;

                if (B.mouseIn && this.clickInner && BSWG.input.MOUSE_RELEASED('left') && !BSWG.game.grabbedBlock)
                {
                    this.clickInner(this, B);
                }

                B.mouseDown = B.mouseIn && BSWG.input.MOUSE('left') && !BSWG.game.grabbedBlock;

            }

        }
        else if (this.buttons) {

            for (var i=0; i<this.buttons.length; i++) {

                var B = this.buttons[i];

                B.mouseIn = B.mouseDown = false;

            }

        }

    },

};

BSWG.ui_3dScreen = function(p, z) {
    return BSWG.render.unproject3D(p, z || 0.0).THREE(z || 0.0);
};

BSWG.ui_3dSizeW = function(sz, p, z) {
    return Math.abs(
        BSWG.render.unproject3D(new b2Vec2(p.x + sz, p.y), z || 0.0).x -
        BSWG.render.unproject3D(new b2Vec2(p.x, p.y), z || 0.0).x
    );
};

BSWG.ui_3dSizeH = function(sz, p, z) {
    return Math.abs(
        BSWG.render.unproject3D(new b2Vec2(p.x, p.y-sz*0.5), z || 0.0).y -
        BSWG.render.unproject3D(new b2Vec2(p.x, p.y+sz*0.5), z || 0.0).y
    );
};

BSWG.control_3DTextButton = {

    noEat: true,

    init: function (args) {

        this.textColor = args.color || [0.5, 0.5, 0.5, 1.0];
        this.hoverColor = args.hoverColor || [0.7, 0.7, 0.7, 1.0];
        this.lowDetail = args.lowDetail || false;
        this.xCentered = true;

        var H = BSWG.ui_3dSizeH(this.h, this.p);
        if (!this.textObj) {
            this.textObj = BSWG.render.make3DText(
                this.text,
                H,
                H * 0.5,
                this.textColor,
                BSWG.ui_3dScreen(this.p),
                this.lowDetail,
                0.35
            );
        }
        this.added = true;

        this.noDestroy = args.noDestroy || false;

    },

    render: function (ctx, viewport) {

        var H = BSWG.ui_3dSizeH(this.h, this.p);
        this.textObj.size = H*0.5;
        this.textObj.pos = BSWG.ui_3dScreen(this.p);
        this.textObj.pos.y -= H*0.75;
        this.textObj.clr = this.mouseIn ? this.hoverColor : this.textColor;
        if (this.textObj.clr[3] <= 0.001) {
            if (this.added) {
                BSWG.render.scene.remove(this.textObj.mesh);
                this.added = false;
            }
        }
        else {
            if (!this.added) {
                BSWG.render.scene.add(this.textObj.mesh);
                this.added = true;
            }
        }
    },

    update: function () {

    },

    destroy: function () {
        if (this.textObj) {
            if (this.added) {
                BSWG.render.scene.remove(this.textObj.mesh);
                this.added = false;
            }
            if (!this.noDestroy) {
                this.textObj.destroy();
                this.textObj = null;
            }
        }
    }

};

BSWG.control_KeyConfig = {

    init: function (args) {

        var self = this;
        this.close = function (key) {
            self.key = key;
            args.close(key);
            self.remove();
        };

        this.title = args.title || 'Keybinding';

        this.key = args.key;

    },

    render: function (ctx, viewport) {

        ctx.font = '16px Orbitron';

        ctx.strokeStyle = '#aaa';
        ctx.fillStyle = 'rgba(50,50,50,1.0)';

        ctx.lineWidth = 2.0;

        ctx.globalAlpha = 0.75;
        BSWG.draw3DRect(ctx, this.p.x, this.p.y, this.w, this.h, 5, true, true ? 'rgba(255,255,255,0.45)' : null);
        ctx.globalAlpha = 1.0;

        ctx.lineWidth = 1.0;

        ctx.beginPath();
        ctx.moveTo(this.p.x + 16, this.p.y + 30);
        ctx.lineTo(this.p.x + this.w - 16, this.p.y + 30);
        ctx.closePath();
        ctx.strokeStyle = '#aaa';
        ctx.stroke();

        ctx.strokeStyle = '#111';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillTextB(this.title, this.p.x + 16, this.p.y + 25);
        ctx.fillStyle = '#ddd';
        ctx.fillTextB("Bound to ", this.p.x + 16, this.p.y + 25 + 25);
        ctx.fillStyle = '#afa';
        ctx.fillTextB("" + BSWG.KEY_NAMES[this.key].toTitleCase(), this.p.x + 16 + 93, this.p.y + 25 + 25);
        ctx.fillStyle = '#aaf';
        ctx.fillTextB("Press a key to bind", this.p.x + 16, this.p.y + 25 + 44);

        ctx.textAlign = 'left';

    },

    update: function () {

        var keys = BSWG.input.getKeyMap();
        if (keys[BSWG.KEY.ESC] || BSWG.input.MOUSE_PRESSED('left') || !BSWG.game.editMode) {
            BSWG.input.EAT_KEY(BSWG.KEY.ESC);
            BSWG.input.EAT_MOUSE('left');
            this.close(null);
            return;
        }

        for (var k in keys) {
            k = parseInt(k);
            if (keys[k] === true && k !== BSWG.KEY.ALT && k !== BSWG.KEY.WINDOWS && k !== BSWG.KEY.SHIFT && k !== BSWG.KEY.CTRL && k !== BSWG.KEY['RIGHT CLICK']) {
                BSWG.input.EAT_KEY(k);
                this.close(parseInt(k));
                return;
            }
        }

        if (this.key) {
            BSWG.input.EAT_KEY(this.key);
        }

    },

};

BSWG.uiControl = function (desc, args) {

    if (!args) args = {};

    this.render = function (ctx, viewport) { };
    this.update = function ( ) { };
    this.init = function (args) { };
    this.destroy = function ( ) { };

    for (var k in desc) {
        this[k] = desc[k];
    }

    this.p = { x: args.x || 0, y: args.y || 0 };
    this.w = args.w || 40;
    this.h = args.h || 40;
    this.click = args.click || null;
    this.text = args.text || "";
    this.selected = args.selected || null;
    this.vpXCenter = args.vpXCenter || false;
    this.clickKey = args.clickKey || null;

    this.init(args);

    this.remove = function () {

        if (this.onremove) {
            this.onremove();
        }

        BSWG.ui.remove(this);

    };

    this.add = function () {

        BSWG.ui.add(this);

    };

    this.add();

    this._update = function () {

        var mx = BSWG.input.MOUSE('x');
        var my = BSWG.input.MOUSE('y');

        if (this.vpXCenter) {
            this.p.x = BSWG.render.viewport.w * 0.5;
        }

        if (this.xCentered) {
            mx += this.w * 0.5;
        }

        if (mx >= this.p.x && my >= this.p.y && mx < (this.p.x + this.w) && my < (this.p.y + this.h) && !BSWG.game.grabbedBlock)
            this.mouseIn = true;
        else
            this.mouseIn = false;

        if (this.click && ((this.mouseIn && BSWG.input.MOUSE_RELEASED('left')) || (this.clickKey && BSWG.input.KEY_PRESSED(this.clickKey))) && !BSWG.game.grabbedBlock)
        {
            this.click(this);
        }

        this.mouseDown = this.mouseIn && BSWG.input.MOUSE('left') && !BSWG.game.grabbedBlock;

        this.update();

        /*if (this.mouseIn && !this.noEat) {
            BSWG.input.EAT_MOUSE('left');
            BSWG.input.EAT_MOUSE('right');
            BSWG.input.EAT_MOUSE('middle');
        }*/

        if (this.mouseIn && !this.noEat) {
            BSWG.ui.mouseBlock = true;
        }

    };

};

BSWG.ui = new function () {

    this.mouseBlock = false;

    this.list = [];

    this.clear = function ( ) {
        while (this.list.length) {
            this.list[0].destroy();
            this.remove(this.list[0]);
        }
    };

    this.render = function (ctx, viewport) {
        for (var i=0; i<this.list.length; i++) {
            this.list[i].render(ctx, viewport);
        }
    };

    this.update = function () {
        this.mouseBlock = false;
        for (var i=0; i<this.list.length; i++) {
            this.list[i]._update();
        }
    };

    this.remove = function(el) {
        
        if (el === BSWG.compActiveConfMenu) {
            BSWG.compActiveConfMenu = null;
            el.confm = null;
        }
        for (var i=0; i<this.list.length; i++) {
            if (this.list[i] === el)
            {
                this.list.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    this.add = function(el) {
        this.remove(el);
        this.list.push(el);
    };

}();