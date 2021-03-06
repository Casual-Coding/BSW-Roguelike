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
    var H = new Float32Array(len);
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
    var rects = [];
    var box = function(sx,sy,bw,bh, depthEdge, depth) {
        rects.push([sx, sy, bw, bh]);
        sx = ~~sx; sy = ~~sy; bw = ~~bw; bh = ~~bh;
        var mx = Math.min(w, sx+bw), my = Math.min(h, sy+bh);
        for (var x=Math.max(0, sx); x<mx; x++) {
            for (var y=Math.max(sy, sy); y<my; y++) {
                var dedge = Math.min(x-sx, Math.min(y-sy, Math.min((sx+bw-1)-x, (sy+bh-1)-y)));
                var t = dedge / 5;
                if (t < 0) {
                    t = 0;
                }
                else if (t > 1) {
                    t = 1;
                }
                H[x+y*w] = depth*t+depthEdge*(1-t);
            }
        }
    };
    var plate = function(sx,sy,bw,bh, depthEdge, depth) {
        rects.push([sx, sy, bw, bh]);
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
        rects: rects,
        circ: circ,
        box: box,
        plate: plate,
        hudBtn: hudBtn,
        hx: function(v, w, x) {
            var t = (v - this.l(0)) / (this.r(0) - this.l(0));
            return w*t + (x||0);
        },
        hy: function(v, h, y) {
            var t = (v - this.t(0)) / (this.b(0) - this.t(0));
            return h*t + (y||0);
        },
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

BSWG.uiPlate3D = function(hudNM, hudHM, x, y, w, h, z, clr, split, moving) {

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
            value: BSWG.render.images['hud_nm'].texture
        },
        zpos: {
            type: 'f',
            value: 0.0001
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
    this.hudMat.depthWrite = false;
    this.hudMat.depthTest = false;
    var oldGeom = this.hudGeom;
    this.hudGeom = new THREE.BufferGeometry().fromGeometry(this.hudGeom);
    oldGeom.dispose();
    oldGeom = null;

    this.hudMesh = new THREE.Mesh( this.hudGeom, this.hudMat );
    this.hudMesh.frustumCulled = false;
    this.hudMesh.position.set(-1.0, -1.0, 4.0 + this.z);
    this.hudMesh.scale.set(w/vp.w, h/vp.h, 1.0);
    this.hudMesh.updateMatrix();
    this.hudMesh.renderOrder = 2000.0 + this.z;
    
    this.hudMesh.needsUpdate = true;
    //this.hudMat.needsUpdate = true;

    this.clr = [
        this.hudMat.uniforms.clr.value.x,
        this.hudMat.uniforms.clr.value.y,
        this.hudMat.uniforms.clr.value.z,
        this.hudMat.uniforms.clr.value.w
    ];

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

    this.clear_bg = function(ctx) {
        for (var i=0; i<hudHM.rects.length; i++) {
            var R = hudHM.rects[i];
            var x1 = hudHM.hx(R[0], this.w, this.x),
                y1 = hudHM.hy(R[1], this.h, this.y);
            var x2 = hudHM.hx(R[0]+R[2], this.w, this.x),
                y2 = hudHM.hy(R[1]+R[3], this.h, this.y);
            ctx.clearRect(x1, y1, (x2-x1), (y2-y1));
        }
    };

    this.set_invert = function (flag) {
        if (!this.hudMat) {
            return;
        }
        this.hudMat.uniforms.extra.value.set(
            this.split ? 1.0 : 0.0,
            flag ? 1.0 : 0.0,
            moving ? 1.0 : 0.0,
            this.hudMat.uniforms.extra.value.w
        );
        //this.hudMat.needsUpdate = true;
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
        this.clr[0] = this.hudMat.uniforms.clr.value.x;
        this.clr[1] = this.hudMat.uniforms.clr.value.y;
        this.clr[2] = this.hudMat.uniforms.clr.value.z;
        this.clr[3] = this.hudMat.uniforms.clr.value.w;
        //this.hudMat.needsUpdate = true;
    };

    this.set_nm = function (nm) {
        if (!this.hudMat) {
            return;
        }
        this.hudMat.uniforms.hudNm.value = nm.texture;
        //this.hudMat.needsUpdate = true;
    };

    this.do_flashing = function ( ) {
        var t = Math.sin(BSWG.render.time * Math.PI * 3) * 0.5 + 0.5;
        this.hudMat.uniforms.clr.value.set(
            this.clr[0] * t + 1.5 * (1-t),
            this.clr[1] * t + 1.5 * (1-t),
            this.clr[2] * t + 1.5 * (1-t),
            this.clr[3]
        );
        //this.hudMat.needsUpdate = true;
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
            //this.hudMesh.updateMatrixWorld(true);

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
            this.hudMat.uniforms.extra.value.w = BSWG.render.time;
            //this.hudMat.needsUpdate = true;
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


BSWG.control_UnlockTree = {

    noEat: false,

    init: function (args) {

        this.w = BSWG.render.viewport.h / 1.5;
        this.h = this.w;

        this.bRows = 4;

        this.updateButtons();

        this.cats = [ 'attack', 'mele', 'defend', 'speed' ];

        this.scrollY = 0.0;

        this.catClr = {
            'attack': '#800',
            'defend': '#048',
            'mele': '#880',
            'speed': '#084'
        };

        this.catClrLight = {
            'attack': '#f00',
            'defend': '#08f',
            'mele': '#ff0',
            'speed': '#0f8'
        };

        this.hoverKey = null;
    },

    updateButtons: function () {

        this.buttons = [];

        if (!this.hudHM) {
            return;
        }

        var self = this;
        this.maxLevelCat = {};
        this.maxLevel = 0;

        for (var i=0; i<this.cats.length; i++) {
            var cat = this.cats[i];
            var levels = BSWG.specialsUnlockInfo[cat].levels;
            for (var level in levels) {
                this.maxLevelCat[cat] = Math.max(this.maxLevelCat[cat] || 0, parseInt(level));
                this.maxLevel = Math.max(this.maxLevel, parseInt(level));
            }
        }

        var hx = function(v) {
            var t = (v - self.hudHM.l(0)) / (self.hudHM.r(0) - self.hudHM.l(0));
            return self.w*t + self.p.x;
        };
        var hy = function(v) {
            var t = (v - self.hudHM.t(0)) / (self.hudHM.b(0) - self.hudHM.t(0));
            return self.h*t + self.p.y;
        };

        var w = (this.w - (hx(20) - this.p.x)) / (this.bRows*2);
        self.bWidth = w;
        self.scrollH = w;
        var y = hy(10);
        for (var level=this.maxLevel; level >= 0; level--) {
            for (var i=0; i<this.cats.length; i++) {
                var cat = this.cats[i];
                if (this.maxLevelCat[cat] < level) {
                    continue;
                }
                var levels = BSWG.specialsUnlockInfo[cat].levels;
                if (level > BSWG.game.xpInfo[cat] && BSWG.game.specialMode) {
                    continue;
                }
                var x = w*i*2 + (Math.floor((level+1)/2)%2)*w;

                var B = {
                    x: x + 5 + 9,
                    y: y - this.p.y + 5,
                    w: w - 10,
                    h: w - 10,
                    cat: cat,
                    level: level,
                    has: BSWG.game.xpInfo[cat] >= level,
                    canHave: (BSWG.game.xpInfo[cat]+Math.min(1, BSWG.game.xpInfo.pointsLeft())) >= level,
                    nameClr: this.catClrLight[cat],
                    key: levels[level],
                    name: levels[level] ? BSWG.specialsInfo[levels[level]].name : '',
                    energy: levels[level] ? BSWG.specialsInfo[levels[level]].energy : 0,
                    row: i
                };

                B.render = function(me, key, has) {
                    return function(ctx) {
                        var x = me.x + self.p.x;
                        var y = me.y + self.p.y - self.scrollY;
                        if (key) {
                            ctx.globalAlpha = me.canHave ? 1.0 : 0.25;
                            if (me.canHave && !me.has) {
                                ctx.globalAlpha = Math.sin(BSWG.render.time*5*(me.mouseIn ? 2 : 1))*0.35+0.65;
                            }
                            ctx.translate(x+me.w/2, y+me.h/2);
                            ctx.rotate(BSWG.render.time);
                            ctx.translate(-me.w/2, -me.h/2);
                            if (me.mouseIn) {
                                ctx.drawImage(BSWG.render.images['unlock-hover'], 0, 0, me.w, me.h);
                            }
                            ctx.drawImage(BSWG.render.images['unlock-icon'], 0, 0, me.w, me.h);
                            ctx.resetTransform();
                            if (BSWG.game.specialMode && BSWG.game.ccblock.specialEquipped(key)) {
                                ctx.translate(x+me.w/2, y+me.h/2);
                                ctx.rotate(BSWG.render.time*2);
                                ctx.translate(-me.w*1.125/2, -me.h*1.125/2);
                                ctx.drawImage(BSWG.render.images['unlock-equipped'], 0, 0, me.w*1.125, me.h*1.125);
                                ctx.resetTransform();
                            }
                            
                            ctx.globalAlpha *= 0.5;
                            ctx.translate(x+me.w/2, y+me.h/2);
                            ctx.rotate(-BSWG.render.time);
                            ctx.translate(-me.w/2, -me.h/2);
                            ctx.drawImage(BSWG.render.images['unlock-icon'], 0, 0, me.w, me.h);
                            ctx.resetTransform();
                            ctx.globalAlpha = 1.0;

                            ctx.globalAlpha = me.canHave ? 1.0 : 0.5;

                            BSWG.renderSpecialIcon(ctx, key, x + me.w/2, y + me.h/2, me.w, 0.0, BSWG.game.ccblock, true);

                            ctx.globalAlpha = me.canHave ? 1.0 : 0.5;

                            ctx.fillStyle = me.nameClr;
                            ctx.strokeStyle = '#000';
                            ctx.font = '10px Orbitron';
                            ctx.textAlign = 'center';
                            ctx.fillTextB(me.name, x + me.w/2, y+10+4);
                            ctx.fillStyle = '#eee';
                            ctx.font = '8px Orbitron';
                            ctx.fillTextB((me.level === 1 ? '1 point' : me.level + ' points'), x + me.w/2, y+me.h-4);
                            ctx.fillStyle = '#99f';
                            ctx.fillTextB(me.energy + ' energy', x + me.w/2, y+me.h-4+10);

                            ctx.globalAlpha = 1.0;
                        }
                        else
                        {
                            ctx.globalAlpha = me.canHave ? 1.0 : 0.25;
                            if (BSWG.game.specialMode) {
                                ctx.globalAlpha = 0.5;
                            }
                            if (me.canHave && !me.has) {
                                ctx.globalAlpha = Math.sin(BSWG.render.time*5*(me.mouseIn ? 2 : 1))*0.35+0.65;
                            }
                            ctx.translate(x+me.w/2, y+me.h/2);
                            ctx.rotate(BSWG.render.time*3);
                            ctx.translate(-me.w/4, -me.h/4);
                            if (me.mouseIn) {
                                ctx.drawImage(BSWG.render.images['unlock-hover'], 0, 0, me.w*.5, me.h*.5);
                            }
                            ctx.drawImage(BSWG.render.images['unlock-icon'], 0, 0, me.w*.5, me.h*.5);
                            ctx.resetTransform();
                            ctx.globalAlpha *= 0.5;
                            ctx.translate(x+me.w/2, y+me.h/2);
                            ctx.rotate(-BSWG.render.time);
                            ctx.translate(-me.w/4, -me.h/4);
                            ctx.drawImage(BSWG.render.images['unlock-icon'], 0, 0, me.w*.5, me.h*.5);
                            ctx.resetTransform();
                            ctx.globalAlpha = 1.0;
                        }
                    };
                }(B, levels[level]);

                this.buttons.push(B);
            }

            if (!(level%2)) y += w;
        }

        for (var i=0; i<this.buttons.length; i++) {
            this.buttons[i].y -= y - hy(0) - w*2*self.bRows;
        }

        /*ctx.drawImage(BSWG.render.images['unlock-icon'], this.p.x, this.p.y, this.w, this.h);
        if (this.key) {
            BSWG.renderSpecialIcon(ctx, this.key, this.p.x+this.w/2, this.p.y+this.p.h/2, this.w, 0.0, self.ccblock);
        }*/

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

            var self = this;

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);

                var bSize = (H.r(10) - H.l(10)) / self.bRows;

                for (var i=0; i<4; i++) {
                    H.plate(H.l(10) + i*bSize, H.t(10), bSize-1, H.b(10)-H.t(10), 0.35, 0.15); // 0..3
                }

                for (var i=0; i<4; i++) {
                    H.plate(H.l(10) + i*bSize + 5, H.t(12), bSize - 1 - 10, bSize/2, 0.15, 0.1); // 4..7
                }

                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                self.hudHM = H;
                self.hudBtn = H.hudBtn;

            });

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
                this.p.x, this.p.y, // x, y
                this.w, this.h, // w, h
                0.15, // z
                [.9,.9,1.1,1], // color
                false, // split
                true // moving
            );
        }

        if (this.hudObj) {
            this.hudObj.set_pos(this.p.x, this.p.y);
            this.hudObj.set_size(this.w, this.h);
            ctx.clearRect(this.p.x, this.p.y, this.w, this.h);
        }

        if (this.p.y < -this.h) {
            return;
        }

        var self = this;
        var hx = function(v) {
            var t = (v - self.hudHM.l(0)) / (self.hudHM.r(0) - self.hudHM.l(0));
            return self.w*t + self.p.x;
        };
        var hy = function(v) {
            var t = (v - self.hudHM.t(0)) / (self.hudHM.b(0) - self.hudHM.t(0));
            return self.h*t + self.p.y;
        };

        for (var i=0; i<this.cats.length; i++) {
            var x = hx(self.hudBtn[4+i][0]), y = hy(self.hudBtn[4+i][1]);
            var w = hx(self.hudBtn[4+i][2]) - x, h = hy(self.hudBtn[4+i][3]) - y;

            var text = BSWG.specialsUnlockInfo[this.cats[i]].title;
            var clr = this.catClr[this.cats[i]];
            
            ctx.globalAlpha = 0.75;
            var grd = ctx.createLinearGradient(x, y+5, x, y+h-5);
            grd.addColorStop(0, 'rgba(255,255,255,0)');
            grd.addColorStop(0.1, clr);
            grd.addColorStop(0.5, clr);
            grd.addColorStop(0.75, clr);
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(x+5, y+5, w-10, h-10);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.textAlign = 'center';
            ctx.font = '14px Orbitron';
            ctx.fillTextB(text, x+w/2, y+h/2+14/2-14/2);
            ctx.textAlign = 'left';
            x += w;
            grd = null;
        }

        //ctx.save();
        //ctx.rect(this.p.x+5, this.p.y+5+this.bWidth, this.w-10, this.h-10-this.bWidth);
        //ctx.clip();

        for (var i=0; i<this.cats.length; i++) {
            var cat = this.cats[i];
            var lb = null;
            for (var j=0; j<this.buttons.length; j++) {
                if (this.buttons[j].cat === cat) {
                    var B = this.buttons[j];
                    if (lb) {
                        var x1 = lb.x + lb.w*0.5 + this.p.x, y1 = lb.y + lb.h*0.5 + this.p.y - this.scrollY;
                        var x2 = B.x + B.w*0.5 + this.p.x, y2 = B.y + B.h*0.5 + this.p.y - this.scrollY;
                        ctx.beginPath();
                        ctx.lineWidth = 3.0;
                        ctx.strokeStyle = lb.has ? '#fff' : (lb.canHave ? '#787878' : '#282828');
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    lb = B;
                }
            }
        }

        for (var i=0; i<this.buttons.length; i++) {
            this.buttons[i].render(ctx);
        }

        //ctx.restore();

        for (var i=0; i<this.buttons.length; i++) {
            if (this.buttons[i].mouseIn) {
                break;
            }
        }
    },

    update: function () {

        var toY = -this.h - 1;

        if (BSWG.game.scene === BSWG.SCENE_GAME1 && (BSWG.game.unlockMode || BSWG.game.specialMode) && !BSWG.game.battleMode && BSWG.game.dialogObj.hidden) {
            toY = BSWG.game.hudTopY;
            this.updateButtons();
        }

        this.p.y += (toY - this.p.y) * BSWG.render.dt * 4.0;
        this.p.x = BSWG.render.viewport.w/2 - this.w/2;

        this.lastHoverKey = this.hoverKey;
        this.hoverKey = null;

        if (this.buttons && this.mouseIn) {

            var mx = BSWG.input.MOUSE('x') - this.p.x;
            var my = BSWG.input.MOUSE('y') - this.p.y;

            for (var i=0; i<this.buttons.length; i++) {

                var B = this.buttons[i];

                if (mx >= B.x && my >= B.y && mx < (B.x + B.w) && my < (B.y + B.h) && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn)
                    B.mouseIn = true;
                else
                    B.mouseIn = false;
                
                /*if (BSWG.game.scene === BSWG.SCENE_GAME1) {
                    if (this.buttons[i].args.count < 1) {
                        B.mouseIn = B.mouseDown = false;
                    }
                }*/

                if (BSWG.game.specialMode && !B.key) {
                    B.mouseIn = false;
                }
                else if (BSWG.game.unlockMode && B.has && !B.key) {
                    B.mouseIn = false;
                }

                if (B.mouseIn && BSWG.input.MOUSE_RELEASED('left') && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn)
                {
                    if (BSWG.game.unlockMode) {
                        if (B.canHave && !B.has) {
                            BSWG.game.xpInfo.usePoint(B.cat, BSWG.game.ccblock);
                            new BSWG.soundSample().play('levelup', null, 0.125, 1.5);
                        }
                    }
                    else if (B.key) {
                        BSWG.game.ccblock.equipSpecial(B.key, B.row);
                        new BSWG.soundSample().play('special-equip', null, 0.4, 1.0);
                    }
                }

                B.mouseDown = B.mouseIn && BSWG.input.MOUSE('left') && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn;

                if (B.mouseIn) {
                    this.hoverKey = B.cat + '|' + B.level;
                }

            }

            if (this.hoverKey !== this.lastHoverKey && this.hoverKey) {
                new BSWG.soundSample().play('unlock-hover', null, 0.065, 1.0);
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

BSWG.control_Button = {

    init: function (args) {

        this.z = args.z || 0.1;
        if (args.userKeyBind) {
            this.userKeyBind = args.userKeyBind;
        }

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
        this.hudHM = null;
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

            var self = this;
            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.box(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.25, 0.5);
                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                self.hudHM = H;

            });

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {

            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
                this.p.x, this.p.y, // x, y
                this.w, this.h, // w, h
                this.z || 0.1, // z
                [1,1,1,1], // color
                false // split
            );
        }

        if (this.hudObj) {
            this.hudObj.set_pos(this.p.x, this.p.y);
            this.hudObj.set_size(this.w, this.h);
            this.hudObj.set_invert(this.selected || this.mouseDown);
            this.hudObj.set_clr(this.mouseIn ? [1.1, 1.1, 1.3, 1] : [0.9, 0.9, 1, 1]);
            this.hudObj.clear_bg(ctx);
            if (this.flashing) {
                this.hudObj.do_flashing();
            }
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
        if (typeof this.text === 'function') {
            this.text(ctx, this.p.x, this.p.y, this.w, this.h, this.mouseIn);
        }
        else if (typeof this.text !== 'string') {
            ctx.drawImage(this.text, 0, 0, this.text.width, this.text.height, this.p.x + this.w * 0.5 - this.h*0.4, this.p.y + this.h*0.1, this.h*0.8, this.h*0.8);
        }
        else {
            ctx.fillTextB(this.text, this.p.x + this.w*0.5, this.p.y + this.h*0.5+6);
        }

        if (BSWG.game.showControls && this.userKeyBind) {
            var str = BSWG.KEY_NAMES[BSWG.game.buttonBinds[this.userKeyBind]];
            if (str && str.length) {
                var fs = Math.min(~~(this.h * 0.3), 12);
                var grad = ctx.createLinearGradient(this.p.x,this.p.y,this.p.x+this.w, this.p.y);
                grad.addColorStop(0,   BSWG.input.KEY_DOWN(BSWG.game.buttonBinds[this.userKeyBind]) ? 'rgba(0, 0, 0, 0.0)' : 'rgba(255, 255, 255, 0.0)');
                grad.addColorStop(0.5, BSWG.input.KEY_DOWN(BSWG.game.buttonBinds[this.userKeyBind]) ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)');
                grad.addColorStop(1,   BSWG.input.KEY_DOWN(BSWG.game.buttonBinds[this.userKeyBind]) ? 'rgba(0, 0, 0, 0.0)' : 'rgba(255, 255, 255, 0.0)');
                ctx.fillStyle = grad;
                ctx.fillRect(this.p.x+5, this.p.y+this.h-8-fs-5, this.w-10, 8+fs);
                ctx.font = (fs-1) + 'px Orbitron';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#000';
                ctx.fillTextB(str, this.p.x + this.w*0.5, this.p.y + this.h - 6 - 5);
                ctx.textAlign = 'left';
            }
        }

        ctx.textAlign = 'left';

    },

    update: function () {

    },

    hoverClickSound: true

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

    onadd: function() {
        for (var i=0; i<this.buttons.length; i++) {
            this.buttons[i].remove();
            this.buttons[i].add();
        }
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

            var self = this;
            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);
                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                self.hudHM = H;

            });

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
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
            this.hudObj.clear_bg(ctx);
        }

    },

    update: function () {

    },

};

window.testCD = function () {

    BSWG.game.openDialog({
        'first': {
            who: 54,
            friend: false,
            text: "Test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test ",
            buttons: [
                {
                    text: 'Ok',
                    click: function(fns) {
                        fns.change('second');
                    }
                }
            ]
        },
        'second': {
            who: -1,
            friend: true,
            text: "Bah bah bah bah bah bah bah bah bah bah bah bah bah bah bah bah bah bah bah\nBah bah bah bah bah bah bah bah bah bah bah bah bah bah bah bah!!!!!",
            buttons: [
                {
                    text: 'Ok',
                    click: function(fns) {
                        fns.close();
                    }
                }
            ]            
        }
    }, 'first');

};

BSWG.ui_DlgBlock = false;


BSWG.control_Inventory = {

    noEat: false,

    init: function (args) {

        this.compClr = {
            'weapon': [1, .5, 0],
            'block': [.7, .7, .7],
            'movement': [0, 1, .25]
        };
        this.compClrBg = {
            'weapon': 'rgb(255, 127, 0)',
            'block': 'rgb(175, 175, 175)',
            'movement': 'rgb(0, 255, 63)'
        };

        if (args.clickInner) {
            this.clickInner = args.clickInner;
        }

        this.cellSize = 32;
        this.padding = 6;
        this.invWidth = BSWG.game.xpInfo.invWidth;
        this.invHeight = BSWG.game.xpInfo.invHeight;

        this.tabHeight = 36;
        this.curPage = 0;
        this.pageHover = null;

        this.mouseInIt = null;
        this.dragIt = null;
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

        this.cellSize = BSWG.render.viewport.h / 25.0;
        this.padding = BSWG.render.viewport.h / 180.0;

        this.w = this.cellSize * this.invWidth + this.padding*2;
        this.h = this.cellSize * this.invHeight + this.padding*3 + this.tabHeight;

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

            var self = this;

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);

                var ww = Math.abs(H.r(0) - H.l(0));
                var hh = Math.abs(H.b(0) - H.t(0));
                var ux = ww / self.w;
                var uy = hh / self.h;

                var bw = (self.w-self.padding)/4;

                for (var i=0; i<4; i++) {
                    H.plate(H.l(ux*(self.padding+(i*bw))), H.t(uy*self.padding), ux*(bw-self.padding), uy*self.tabHeight, 0.3, 0.25);
                }

                H.plate(H.l(ux*(self.padding)), H.t(uy*(self.padding*2+self.tabHeight)), ux*(self.w-self.padding*2), uy*(self.h-self.padding-(self.padding*2+self.tabHeight)), 0.3, 0.25);

                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                this.hudHM = H;

            });

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
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
            ctx.clearRect(this.p.x, this.p.y, this.w, this.h);
        }

        if (this.p.x > BSWG.render.viewport.w || this.p.y > BSWG.render.viewport.h) {
            return;
        }

        ctx.font = '16px Orbitron';

        ctx.fillStyle = 'rgba(50,50,50,0.5)';

        var x1 = this.padding + this.p.x;
        var y1 = this.padding * 2 + this.tabHeight + this.p.y;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        for (var x=0; x<this.invWidth; x++) {
            for (var y=0; y<this.invHeight; y++) {
                ctx.fillRect(x1 + x * this.cellSize,
                             y1 + y * this.cellSize,
                             this.cellSize-1, this.cellSize-1);
            }
        }

        var page = BSWG.game.xpInfo.inventoryPage(this.curPage);

        for (var i=0; i<page.length; i++) {
            var it = page[i];
            var w = it.w * this.cellSize;
            var h = it.h * this.cellSize;
            if (it.r90) {
                var t = w;
                w = h;
                h = t;
            }
            var xc = it.x * this.cellSize + w * 0.5;
            var yc = it.y * this.cellSize + h * 0.5;
            var clr = this.compClr[BSWG.componentList.getCatKey(it.key)];
            var light = this.mouseInIt === it ? 0.5 : 0.3;
            light *= 1 - (it.damage * 0.5);
            BSWG.renderCompIconRecenter = true;
            if (this.mouseInIt === it) {
                ctx.fillStyle = 'rgba(0, 127, 0, 0.35)';
                ctx.fillRect(x1 + xc - w*0.5 + 1, y1 + yc - h*0.5 + 1, w-2, h-2);
            }
            BSWG.renderCompIcon(ctx, it.key, x1 + xc, y1 + yc, this.cellSize * 0.85, it.r90 ? Math.PI/2 : 0, clr[0]*light, clr[1]*light, clr[2]*light);
            ctx.fillStyle = (BSWG.game.ccblock && Math.floor(it.level) <= BSWG.game.ccblock.level()) ? '#4f4' : '#f44';
            ctx.strokeStyle = '#000';
            ctx.font = (this.tabHeight/3.5)+'px Orbitron';
            ctx.textAlign = 'right';
            ctx.fillTextB("" + it.level, x1 + xc + w * 0.5 - 3, y1 + yc - h * 0.5 + (this.tabHeight/3.5));
            ctx.textAlign = 'left';
        }

        var bw = (this.w-this.padding)/4;
        for (var i=0; i<4; i++) {
            ctx.fillStyle = this.pageHover === i ? 'rgba(192, 192, 192, 1.0)' : 'rgba(127, 127, 127, 0.75)';
            ctx.globalAlpha = this.curPage === i ? 1.0 : 0.65;
            ctx.fillRect(this.padding+(i*bw)+this.p.x+1, this.padding+this.p.y+1, bw-this.padding-2, this.tabHeight-2);

            ctx.fillStyle = '#8f8';
            ctx.strokeStyle = '#000';
            ctx.font = (this.tabHeight/2.5)+'px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillTextB("Page " + (i+1), this.padding+(i*bw)+this.p.x + (bw-this.padding)/2, this.padding+this.p.y + this.tabHeight/1.7);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1.0;
        }

        if (this.mouseInIt) {
            var it = this.mouseInIt;
            var w = it.w * this.cellSize;
            var h = it.h * this.cellSize;
            if (it.r90) {
                var t = w;
                w = h;
                h = t;
            }
            var xc = it.x * this.cellSize;
            var yc = it.y * this.cellSize;
            var cat = BSWG.componentList.getCatKey(it.key);
            var clr = this.compClr[cat];
            var w = 300 + 4;
            var h = 70 + 4;
            var x = (x1 + xc) - (w + 1);
            var y = (y1 + yc) - (h+1);

            ctx.textAlign = 'left';

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.strokeStyle = 'rgba(128, 128, 128, 0.75)';
            ctx.fillRect(x+4, y+4, w, h)
            ctx.fillStyle = 'rgba(64, 64, 64, 0.75)';

            var grd = ctx.createLinearGradient(x, y, x, y+h);
            grd.addColorStop(0, 'rgba(64, 64, 64, 0.75)');
            grd.addColorStop(1, 'rgba(96, 96, 96, 0.75)');
            ctx.fillStyle = grd;
            grd = null;
            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.font = '14px Orbitron';
            ctx.fillTextB(BSWG.componentList.compStrName(it.key), x+9, y+6+14);

            ctx.fillStyle = '#bbb';
            ctx.strokeStyle = '#000';
            ctx.font = '12px Orbitron';
            ctx.fillTextB(it.text || '', x+9, y+6+14+13);

            var clr = this.compClr[cat];
            ctx.fillStyle = 'rgb(' + Math.floor(clr[0]*255) + ',' + Math.floor(clr[1]*255) + ',' + Math.floor(clr[2]*255) + ')';
            ctx.strokeStyle = '#000';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'right';
            ctx.fillTextB('Type: ' + cat.toTitleCase(), x+w-10, y+6+13);

            var damage = it.damage || 0;
            var l = Math.floor(damage * 255);
            ctx.fillStyle = 'rgb(' + l + ', ' + (255-l) + ', 0)';
            ctx.strokeStyle = '#000';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'right';
            ctx.fillTextB("Damage: " + Math.floor(damage * 100) + '%', x+w-10, y+6+13+13);

            if (BSWG.game.map && BSWG.game.xpInfo) {
                if (Math.floor(it.level) > BSWG.game.xpInfo.level) {
                    ctx.fillStyle = '#f44';
                }
                else {
                    ctx.fillStyle = '#4f4';
                }
                ctx.textAlign = 'left';
                ctx.strokeStyle = '#000';
                ctx.font = '12px Orbitron';
                ctx.fillTextB('Level ' + it.level, x+9, y+6+14+14);
            }

            if (BSWG.game.map && BSWG.game.inZone && BSWG.game.inZone.compValLookup) {
                var it2 = BSWG.game.inZone.compValLookup[it.key];
                if (it2) {
                    var text = "Value here: " + Math.floor(it2.value*100)/100;
                    ctx.strokeStyle = '#000';
                    ctx.font = '12px Orbitron';
                    ctx.textAlign = 'right';
                    ctx.fillStyle = 'rgba(255, 64, 0, 1)';
                    if (!it2.rare) {
                        ctx.fillStyle = 'rgba(255, 192, 0, 1)';
                    }
                    else {
                        text += ' (Rare)';
                    }
                    ctx.fillTextB(text, x+w-10, y+6+13+13+13);
                }
            }

            ctx.textAlign = 'left';            
        }

        if (this.mouseIn && this.dragIt) {
            this.drawDragIt(ctx, this.dragIt.mx + this.dragIt.offx + this.p.x, this.dragIt.my + this.dragIt.offy + this.p.y, this.cellSize);
        }

    },

    drawDragIt: function (ctx, xc, yc, scale) {
        if (!this.dragIt) {
            return;
        }
        var it = this.dragIt;
        var w = it.w * this.cellSize;
        var h = it.h * this.cellSize;
        if (it.r90) {
            var t = w;
            w = h;
            h = t;
        }
        var x1 = this.padding + this.p.x;
        var y1 = this.padding * 2 + this.tabHeight + this.p.y;
        var xic = it.x * this.cellSize + w * 0.5;
        var yic = it.y * this.cellSize + h * 0.5;
        var clr = it.canDrop ? [ 0, 1, 0 ] : [ 1, 0, 0 ];
        var light = 0.5;
        light *= 1 - (it.damage * 0.5);
        BSWG.renderCompIconRecenter = true;
        if (it.canDrop) {
            ctx.fillStyle = 'rgba(0, 168, 0, 0.5)';
        }
        else {
            ctx.fillStyle = 'rgba(168, 0, 0, 0.5)';
        }
        if (this.mouseIn) {
            ctx.fillRect(x1 + xic - w*0.5 + 1, y1 + yic - h*0.5 + 1, w-2, h-2);    
        }
        else {
            ctx.beginPath();
            ctx.arc(xc,yc,it.r*scale,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
        }
        
        BSWG.renderCompIcon(ctx, it.key, xc, yc, scale, it.r90 ? Math.PI/2 : 0, clr[0]*light, clr[1]*light, clr[2]*light);
    },

    update: function () {

        var toX = BSWG.render.viewport.w+1;

        if (BSWG.game.scene === BSWG.SCENE_GAME1 && BSWG.game.storeMode) {
            toX = BSWG.render.viewport.w - (this.w-1);
        }

        this.p.x += (toX - this.p.x) * BSWG.render.dt * 4.0;
        this.p.y = BSWG.game.hudBottomY - this.h;

        this.mouseInIt = null;

        this.pageHover = null;
        var bw = (this.w-this.padding)/4;
        var mx = BSWG.input.MOUSE('x') - this.p.x;
        var my = BSWG.input.MOUSE('y') - this.p.y;
        for (var i=0; i<4; i++) {
            if (mx >= (this.padding+(i*bw)+1) && my >= (this.padding+1) && mx < (this.padding+(i*bw)+1+(bw-this.padding-2)) && my < (this.padding+1+(this.tabHeight-2))) {
                this.pageHover = i;
            }
        }

        if (this.dragIt) {
            if (typeof this.pageHover === 'number') {
                this.curPage = this.pageHover;
            }
            if (this.mouseIn) {
                this.dragIt.mx = mx;
                this.dragIt.my = my;
                var x1 = this.padding + this.p.x;
                var y1 = this.padding * 2 + this.tabHeight + this.p.y;
                var w = this.dragIt.w * this.cellSize;
                var h = this.dragIt.h * this.cellSize;
                if (this.dragIt.r90) {
                    var t = w;
                    w = h;
                    h = t;
                }
                var xc = this.dragIt.mx + this.dragIt.offx + this.p.x;
                var yc = this.dragIt.my + this.dragIt.offy + this.p.y;
                this.dragIt.x = Math.round(((xc-w*0.5)-x1) / this.cellSize);
                this.dragIt.y = Math.round(((yc-h*0.5)-y1) / this.cellSize);

                this.dragIt.canDrop = BSWG.game.xpInfo.inventoryBoxEmpty(this.curPage, this.dragIt.x, this.dragIt.y, this.dragIt.w, this.dragIt.h, this.dragIt.r90);
                if (BSWG.input.MOUSE_RELEASED('left')) {
                    if (this.dragIt.canDrop && BSWG.game.xpInfo.addInventoryItAt(this.dragIt, this.curPage, this.dragIt.x, this.dragIt.y, this.dragIt.r90)) {
                        this.dragIt = null;
                    }
                    else {
                        BSWG.game.xpInfo.addInventoryItAt(this.dragIt, this.dragIt.opage, this.dragIt.ox, this.dragIt.oy, this.dragIt.or90);
                        this.dragIt = null;
                    }
                }
                else if (BSWG.input.MOUSE_PRESSED('right')) {
                    this.dragIt.r90 = !this.dragIt.r90;
                }
            }
            else {
                this.dragIt.mx = BSWG.input.MOUSE('x');
                this.dragIt.my = BSWG.input.MOUSE('y');
                this.dragIt.r = Math.sqrt(Math.pow(Math.max(this.dragIt.w, this.dragIt.h)/2, 2.0)*2) * 1.1;
                this.dragIt.wp = BSWG.render.unproject3D(new b2Vec2(this.dragIt.mx, this.dragIt.my), 0.0);
                var tmp = BSWG.componentList.withinRadius(this.dragIt.wp.clone(), this.dragIt.r);
                this.dragIt.canDrop = !tmp || tmp.length === 0;

                if (BSWG.input.MOUSE_RELEASED('left')) {
                    if (this.dragIt.canDrop) {
                        var arr = BSWG.componentList.compStrTypeArgs(this.dragIt.key);
                        var args = arr[1];
                        args.pos = this.dragIt.wp.clone();
                        args.angle = this.dragIt.r90 ? -Math.PI/2 : 0;
                        args.damage = this.dragIt.damage;
                        args.compLevel = this.dragIt.level;
                        var comp = new BSWG.component(arr[2], args);
                        if (self.scene === BSWG.SCENE_GAME1) {
                            self.xpInfo.addStore(comp, -1);
                            new BSWG.soundSample().play('store-2', p.THREE(0.2), 0.85, 0.45);
                        }
                        p = null;
                        comp = null;
                        this.dragIt = null;
                    }
                    else {
                        BSWG.game.xpInfo.addInventoryItAt(this.dragIt, this.dragIt.opage, this.dragIt.ox, this.dragIt.oy, this.dragIt.or90);
                        this.dragIt = null;
                    }
                }
                else if (BSWG.input.MOUSE_PRESSED('right')) {
                    this.dragIt.r90 = !this.dragIt.r90;
                }
            }
        }
        else if (this.mouseIn && (typeof this.pageHover === 'number') && BSWG.input.MOUSE_PRESSED('left')) {
            this.curPage = this.pageHover;
        }
        else if (this.mouseIn) {

            var x0 = this.padding;
            var y0 = this.padding * 2 + this.tabHeight;

            var page = BSWG.game.xpInfo.inventoryPage(this.curPage);

            for (var i=0; i<page.length; i++) {
                var it = page[i];
                var w = it.w * this.cellSize;
                var h = it.h * this.cellSize;
                if (it.r90) {
                    var t = w;
                    w = h;
                    h = t;
                }
                var x1 = it.x * this.cellSize + x0;
                var y1 = it.y * this.cellSize + y0;

                if (mx >= x1 && mx < (x1 + w) && my >= y1 && my < (y1 + h)) {
                    this.mouseInIt = it;
                    if (BSWG.input.MOUSE_PRESSED('left') && !BSWG.input.MOUSE_RELEASED('left')) {
                        BSWG.game.xpInfo.inventoryRemove(it.id);
                        it.ox = it.x;
                        it.oy = it.y;
                        it.or90 = it.r90;
                        it.opage = it.page;
                        this.dragIt = it;
                        this.dragIt.canDrop = BSWG.game.xpInfo.inventoryBoxEmpty(this.curPage, it.x, it.y, it.w, it.h, it.rot90);
                        this.dragIt.offx = (x1+w*0.5) - mx;
                        this.dragIt.offy = (y1+h*0.5) - my;
                        this.dragIt.mx = mx;
                        this.dragIt.my = my;
                    }
                    break;
                }
            }
        }

    },

};


BSWG.control_Dialogue = {

    init: function (args) {

        this.portraitId = args.portrait;
        this.friend = args.friend || false;
        this.modal = true;//args.modal || false;
        this.text = args.text || "";
        this.title = args.title || "";
        this.noEat = false;
        this.textFinished = false;

        if (this.buttons) {
            for (var i=0; i<this.buttons.length; i++) {
                var B = this.buttons[i];
                if (B.btn) {
                    B.btn.remove();
                    B.btn.destroy();
                }
            }
        }

        this.buttons = args.buttons || [];
        
        this.hidden = true;
        this.hiddenTime = Date.timeStamp() - 3.0;
        this.startTime = Date.timeStamp();

        BSWG.ui_DlgBlock = false;

    },

    hide: function () {

        this.hidden = true;
        this.hiddenTime = Date.timeStamp();

        BSWG.ui_DlgBlock = false;

    },

    show: function () {

        this.hidden = false;
        this.startTime = Date.timeStamp();

        BSWG.ui_DlgBlock = true;

    },

    destroy: function () {
        for (var i=0; i<this.buttons.length; i++) {
            var B = this.buttons[i].btn;
            if (B) {
                B.remove();
                B.destroy();
            }
        }
        this.buttons = null;
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

        /*if (this.modal) {
            this.p.x = BSWG.render.viewport.w / 2 - this.w / 2;
            this.p.y = BSWG.render.viewport.h / 2 - this.h / 2;
        }
        else {*/
            this.p.x = BSWG.game.hudX(BSWG.game.hudDlgX1/2);
            this.p.y = BSWG.game.hudY(BSWG.game.hudBottomYT2) - this.h;
            //this.w = BSWG.game.hudX(BSWG.game.hudDlgX2) - this.p.x;
        //}

        if (this.hidden) {
            this.p.y += (1.0 - Math.pow(Math.clamp(((0.5 - (Date.timeStamp() - this.hiddenTime)) / 0.5), 0.0, 1.0), 3.0)) * (BSWG.render.viewport.h - this.p.y);
        }
        else {
            this.p.y += Math.pow(Math.clamp(((0.5 - (Date.timeStamp() - this.startTime)) / 0.5), 0.0, 1.0), 3.0) * (BSWG.render.viewport.h - this.p.y);
        }

        var aw = this.w, ah = this.h;

        if (!this.hudNM || aw !== this.lastAW || ah !== this.lastAH) {

            if (this.hudNM) {
                this.hudNM.destroy();
            }

            var max = Math.max(this.w, this.h);
            var sz = 64;
            while (sz < max && sz < 1024) {
                sz *= 2;
            }

            var self = this;

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var psize = 238, bheight = 48;
                var H = BSWG.ui_HM(w, h, aw, ah);
                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);
                H.plate(H.l(10), H.t(10+bheight+5), H.l(10 + psize) - H.l(10), H.t(10 + psize+bheight+5) - H.t(10+bheight+5), 0.3, 0.25);
                H.plate(H.l(10 + psize + 5), H.t(10+bheight+5), H.r(10) - H.l(10 + psize + 5), H.b(20+bheight) - H.t(10+bheight+5), 0.3, 0.15);
                H.plate(H.l(10), H.t(10), H.r(10) - H.l(10), H.t(10+bheight) - H.t(10), 0.3, 0.25);
                var x = H.r(0);
                for (var i=0; i<3; i++) {
                    x -= 150 + 10;
                }
                for (var i=0; i<3; i++) {
                    var tw = 150;
                    H.plate(x, H.b(20+bheight-4), tw, bheight+5, 0.3, 0.25);
                    x += tw + 10;
                }
                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                self.hudBtn = H.hudBtn;
                self.hudHM = H;

            });

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
                this.p.x, this.p.y, // x, y
                this.w, this.h, // w, h
                0.15, // z
                this.friend ? [.75, .75, 1, 1] : [1,.75,.75,1], // color
                false, // split
                true // moving
            );
        }

        if (this.hudObj) {

            this.hudObj.set_pos(this.p.x, this.p.y);
            this.hudObj.set_size(this.w, this.h);
            this.hudObj.set_clr(this.friend ? [.75, .75, 1, 1] : [1,.75,.75,1]);

            ctx.clearRect(this.p.x, this.p.y, this.w, this.h);

            if (this.hudBtn && this.hudHM && (!this.hidden || this.p.y < BSWG.render.viewport.h)) {
                var self = this;
                var hx = function(v) {
                    var t = (v - self.hudHM.l(0)) / (self.hudHM.r(0) - self.hudHM.l(0));
                    return self.w*t + self.p.x;
                };
                var hy = function(v) {
                    var t = (v - self.hudHM.t(0)) / (self.hudHM.b(0) - self.hudHM.t(0));
                    return self.h*t + self.p.y;
                };

                var img = BSWG.character.getPortrait(this.portraitId, this.friend);

                var x = hx(this.hudBtn[0][0])+6,
                    y = hy(this.hudBtn[0][1])+6;
                var w = hx(this.hudBtn[0][2])-x-3,
                    h = hy(this.hudBtn[0][3])-y-6;

                ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);

                var x = hx(this.hudBtn[1][0])+12,
                    y = hy(this.hudBtn[1][1])+20+8;
                var w = hx(this.hudBtn[1][2])-x-6,
                    h = hy(this.hudBtn[1][3])-y-12;

                var fs = Math.min(~~(h * 0.3), 20);
                ctx.font = fs + 'px Orbitron';
                ctx.textAlign = 'left';
                if (this.friend) {
                    ctx.fillStyle = '#88f';
                    ctx.strokeStyle = '#226';
                }
                else {
                    ctx.fillStyle = '#f88';
                    ctx.strokeStyle = '#622';                   
                }

                var text = this.text.substring(0, Math.min(~~((Date.timeStamp() - this.startTime) * 30), this.text.length));
                this.textFinished = this.text === text;
                if (this.lastText !== text && text.length > 0) {
                    var ch = text.charAt(text.length-1);
                    if (ch !== ' ' && ch !== '\n' && ch !== '\t' && ch !== '.') {
                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                    }
                }
                this.lastText = text;
                var lines = text.split('\n');
                var y1 = y;
                for (var i=0; i<lines.length; i++) {
                    var words = lines[i].split(' ');
                    var csent = new Array();
                    for (var j=0; j<words.length; j++) {
                        var t2 = csent.join(' ');
                        var t3 = t2 + ' ' + words[j];
                        if (ctx.textWidthB(t3) >= w) {
                            ctx.fillTextB(t2, x, y1);
                            y1 += fs + 4;
                            csent.length = 0;
                        }
                        csent.push(words[j]);
                    }
                    if (csent.length) {
                        ctx.fillTextB(csent.join(' '), x, y1);
                    }
                    y1 += fs + 4;
                }

                var x = hx(this.hudBtn[2][0])+6,
                    y = hy(this.hudBtn[2][1])+6;
                var w = hx(this.hudBtn[2][2])-x-3,
                    h = hy(this.hudBtn[2][3])-y-6;

                var fs = Math.min(~~(h), 16);
                ctx.font = fs + 'px Orbitron';
                ctx.fillTextB(this.title, x + 10, y + h*0.5+7);

                for (var i=0; i<this.buttons.length; i++) {
                    var B = this.buttons[i].btn;
                    if (B) {
                        var x = hx(this.hudBtn[6-this.buttons.length+i][0])+3,
                            y = hy(this.hudBtn[6-this.buttons.length+i][1]);
                        var w = hx(this.hudBtn[6-this.buttons.length+i][2])-x-1,
                            h = hy(this.hudBtn[6-this.buttons.length+i][3])-y;
                        B.p.x = x; B.p.y = y;
                        B.w = w; B.h = h;
                    }
                    else {
                        this.buttons[i].btn = new BSWG.uiControl(BSWG.control_Button, {
                            x: -1000, y: -1000,
                            w: 65, h: 65,
                            z: 0.175,
                            text: this.buttons[i].text,
                            click: this.buttons[i].click || function () {}
                        });
                    }
                }
            }
        }

    },

    skipText: function () {
        this.startTime -= 10000;
    },

    update: function () {

    },

};


BSWG.control_CompPalette = {

    noEat: false,

    init: function (args) {

        this.compClr = {
            'weapon': [1, .5, 0],
            'block': [.7, .7, .7],
            'movement': [0, 1, .25]
        };
        this.compClrBg = {
            'weapon': 'rgb(255, 127, 0)',
            'block': 'rgb(175, 175, 175)',
            'movement': 'rgb(0, 255, 63)'
        };

        var CL = BSWG.componentList.sbTypes;
        var buttons = new Array();

        if (args.clickInner) {
            this.clickInner = args.clickInner;
        }

        var bcount = 0;
        for (var i=0; i<CL.length; i++) {
            bcount += CL[i].sbadd.length;
        }

        var bWidth = 6;
        var bSize = Math.min(this.w-20, this.h-20) / bWidth;
        var idx = 0;

        for (var i=0; i<CL.length; i++) {

            var SBL = CL[i].sbadd;
            for (var j=0; j<SBL.length; j++) {
                var key = CL[i].type;
                for (var k=0; CL[i].sbkey && k<CL[i].sbkey.length; k++) {
                    var k2 = CL[i].sbkey[k];
                    if (SBL[j][k2] || SBL[j][k2] == false) {
                        key += ',' + k2 + '=' + SBL[j][k2];
                    }
                }

                var x = 10 + (idx % bWidth) * bSize;
                var y = 10 + Math.floor(idx / bWidth) * bSize;

                buttons.push({
                    args: SBL[j],
                    text: SBL[j].title,
                    key: key,
                    comp: CL[i],
                    x: x+1, y: y+1,
                    w: bSize-2, h: bSize-2,
                    mouseIn: false,
                    mouseDown: false
                });

                idx += 1;
            }

        }

        this.h = 20 + Math.floor((bcount-1) / bWidth) * bSize + bSize;
        this.bSize = bSize;
        this.bWidth = bWidth;
        this.bcount = bcount;

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

            var self = this;

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);
                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);

                var bSize = (H.r(10) - H.l(10)) / self.bWidth;

                for (var i=0; i<self.bcount; i++) {
                    var x = (i % self.bWidth) * bSize;
                    var y = Math.floor(i / self.bWidth) * bSize;
                    H.plate(H.l(10) + x, H.t(10) + y, bSize-1, bSize-1, 0.35, 0.15);
                }

                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                this.hudHM = H;

            });

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
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
            ctx.clearRect(this.p.x, this.p.y, this.w, this.h);
        }

        if (this.p.x > BSWG.render.viewport.w || this.p.y > BSWG.render.viewport.h) {
            return;
        }

        ctx.font = '16px Orbitron';

        ctx.fillStyle = 'rgba(50,50,50,0.5)';
            
        //ctx.lineWidth = 2.0;

        //BSWG.draw3DRect(ctx, this.p.x, this.p.y, this.w, this.h, 4, false, null);

        ctx.lineWidth = 1.0;

        var mouseIn = null;

        for (var i=0; i<this.buttons.length; i++) {
            var B = this.buttons[i];

            ctx.globalAlpha = 1.0;
            
            if (BSWG.game.scene === BSWG.SCENE_GAME1) {
                if (this.buttons[i].args.count < 1) {
                    ctx.globalAlpha = 0.125;
                    B.mouseIn = B.mouseDown = false;
                }
            }

            if (B.mouseIn && !B.mouseDown) {
                mouseIn = B;
            }

            ctx.font = '12px Orbitron';
            ctx.strokeStyle = '#888';
            ctx.fillStyle = 'rgba(50,50,50,1)';
                
            ctx.lineWidth = 2.0;

            ctx.globalAlpha = 0.135;
            ctx.fillStyle = this.compClrBg[B.comp.category];
            ctx.fillRect(this.p.x + B.x, this.p.y + B.y, B.w-1, B.h);
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = B.mouseDown ?
                'rgba(32, 32, 32, 0.9)' :
                (B.mouseIn ?
                    'rgba(128, 128, 128, 0.35)' :
                    'rgba(0, 0, 0, 0.5)'
                );
            ctx.fillRect(this.p.x + B.x, this.p.y + B.y, B.w-1, B.h);

            ctx.lineWidth = 1.0;

            if (BSWG.game.scene === BSWG.SCENE_GAME1) {
                if (this.buttons[i].args.count > 0) {
                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#0f0';
                    ctx.fillText('x' + this.buttons[i].args.count + '', B.x + this.p.x + B.w - 4, B.y + this.p.y + B.h - 4);
                    if (BSWG.game.map && BSWG.game.xpInfo) {
                        if (BSWG.game.map.minLevelComp(this.buttons[i].key) > BSWG.game.xpInfo.level) {
                            ctx.fillStyle = 'rgba(255, 0, 0, .35)';
                            ctx.fillRect(this.p.x + B.x, this.p.y + B.y, B.w-1, B.h);
                        }
                    }
                }
            }

            if (BSWG.game.scene !== BSWG.SCENE_GAME1 || B.args.count > 0 && !B.mouseIn) {
                ctx.globalAlpha = 1.0;
                var light = B.mouseIn ? 0.75 : 0.35;
                BSWG.renderCompIconRecenter = true;
                var clr = this.compClr[B.comp.category];
                BSWG.renderCompIcon(ctx, B.key, B.x + this.p.x + B.w*0.5, B.y + this.p.y + B.h*0.5, B.w/5, 0.2 + (B.mouseIn ? BSWG.render.time : 0.0), clr[0]*light, clr[1]*light, clr[2]*light);
            }

            ctx.textAlign = 'left';

            ctx.globalAlpha = 1.0;
        }

        if (mouseIn) {
            if (BSWG.game.scene !== BSWG.SCENE_GAME1 || mouseIn.args.count > 0) {
                var B = mouseIn;
                ctx.globalAlpha = 1.0;
                var light = B.mouseIn ? 0.75 : 0.35;
                BSWG.renderCompIconRecenter = true;
                var clr = this.compClr[B.comp.category];
                BSWG.renderCompIcon(ctx, B.key, B.x + this.p.x + B.w*0.5, B.y + this.p.y + B.h*0.5, B.w/5*3, 0.2 + (B.mouseIn ? BSWG.render.time : 0.0), clr[0]*light, clr[1]*light, clr[2]*light);
            }

            var w = 300 + 4;
            var h = 70 + 4;
            var x = (this.p.x + mouseIn.x + mouseIn.w) - (w + 1);
            var y = (this.p.y + mouseIn.y) - (h+1);

            ctx.textAlign = 'left';

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.strokeStyle = 'rgba(128, 128, 128, 0.75)';
            ctx.fillRect(x+4, y+4, w, h)
            ctx.fillStyle = 'rgba(64, 64, 64, 0.75)';

            var grd = ctx.createLinearGradient(x, y, x, y+h);
            grd.addColorStop(0, 'rgba(64, 64, 64, 0.75)');
            grd.addColorStop(1, 'rgba(96, 96, 96, 0.75)');
            ctx.fillStyle = grd;
            grd = null;
            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.font = '14px Orbitron';
            ctx.fillTextB(mouseIn.comp.name, x+9, y+6+14);

            ctx.fillStyle = '#bbb';
            ctx.strokeStyle = '#000';
            ctx.font = '12px Orbitron';
            ctx.fillTextB(mouseIn.text, x+9, y+6+14+13);

            var clr = this.compClr[mouseIn.comp.category];
            ctx.fillStyle = 'rgb(' + Math.floor(clr[0]*255) + ',' + Math.floor(clr[1]*255) + ',' + Math.floor(clr[2]*255) + ')';
            ctx.strokeStyle = '#000';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'right';
            ctx.fillTextB('Type: ' + mouseIn.comp.category.toTitleCase(), x+w-10, y+6+13);

            ctx.fillStyle = 'rgb(0, 255, 0)';
            ctx.strokeStyle = '#000';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'right';
            ctx.fillTextB(BSWG.game.scene === BSWG.SCENE_GAME1 ? ('Count: ' + mouseIn.args.count) : ('Count: Inf'), x+w-10, y+6+13+13);

            if (BSWG.game.map && BSWG.game.xpInfo) {
                if (BSWG.game.map.minLevelComp(mouseIn.key) > BSWG.game.xpInfo.level) {
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#f00';
                    ctx.strokeStyle = '#000';
                    ctx.font = '14px Orbitron';
                    ctx.fillTextB('Level ' + BSWG.game.map.minLevelComp(mouseIn.key) + ' required.', x + w*0.5, y + h - 8);
                }
            }

            if (BSWG.game.map && BSWG.game.inZone && BSWG.game.inZone.compValLookup) {
                var it = BSWG.game.inZone.compValLookup[mouseIn.key];
                if (it) {
                    var text = "Value here: " + Math.floor(it.value*100)/100;
                    ctx.strokeStyle = '#000';
                    ctx.font = '12px Orbitron';
                    ctx.textAlign = 'right';
                    ctx.fillStyle = 'rgba(255, 64, 0, 1)';
                    if (!it.rare) {
                        ctx.fillStyle = 'rgba(255, 192, 0, 1)';
                    }
                    else {
                        text += ' (Rare)';
                    }
                    ctx.fillTextB(text, x+w-10, y+6+13+13+13);
                }
            }

            ctx.textAlign = 'left';
        }

    },

    update: function () {

        var toX = BSWG.render.viewport.w+1;

        if ((BSWG.game.scene === BSWG.SCENE_GAME2 && BSWG.game.editMode) || (BSWG.game.scene === BSWG.SCENE_GAME1 && BSWG.game.storeMode && !BSWG.game.battleMode && BSWG.game.saveHealAdded)) {
            toX = BSWG.render.viewport.w - (this.w);
        }

        this.p.x += (toX - this.p.x) * BSWG.render.dt * 4.0;
        this.p.y = BSWG.game.hudBottomY - this.h;

        if (this.buttons && this.mouseIn) {

            var mx = BSWG.input.MOUSE('x') - this.p.x;
            var my = BSWG.input.MOUSE('y') - this.p.y;

            for (var i=0; i<this.buttons.length; i++) {

                var B = this.buttons[i];

                var omousein = B.mouseIn;

                if (mx >= B.x && my >= B.y && mx < (B.x + B.w) && my < (B.y + B.h) && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn)
                    B.mouseIn = true;
                else
                    B.mouseIn = false;
                
                if (B.mouseIn && !omousein && B.args.count >= 1) {
                    new BSWG.soundSample().play('hover', null, 0.125, 1.45+Math.random()*0.05);
                }

                if (BSWG.game.scene === BSWG.SCENE_GAME1) {
                    if (this.buttons[i].args.count < 1) {
                        B.mouseIn = B.mouseDown = false;
                    }
                }

                if (B.mouseIn && this.clickInner && BSWG.input.MOUSE_RELEASED('left') && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn)
                {
                    new BSWG.soundSample().play('click', null, 0.25, 1.45+Math.random()*0.05);
                    this.clickInner(this, B);
                }

                B.mouseDown = B.mouseIn && BSWG.input.MOUSE('left') && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn;

                if (B.mouseDown && BSWG.input.MOUSE_PRESSED('left')) {
                    new BSWG.soundSample().play('click', null, 0.25, 0.95+Math.random()*0.05);
                }

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

BSWG.control_TradeWindow = {

    noEat: false,

    init: function (args) {

    },

    destroy: function () {
        if (this.mtButton) {
            this.mtButton.remove();
            this.mtButton.destroy();
            this.mtButton = null;
        }
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

            var self = this;

            this.hudNM = BSWG.render.proceduralImage(sz, sz, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h, aw, ah);

                var _w = H.r(0) - H.l(0);
                var _h = H.b(0) - H.t(0);

                var bfr = _w * 0.01;
                var topSize = _h * 0.2;
                var bsize = 32;

                H.plate(H.l(0), H.t(0), H.r(0) - H.l(0), H.b(0) - H.t(0), 0.15, 0.35);
                H.plate(H.l(bfr), H.t(bfr), H.l(bfr+topSize) - H.l(bfr), H.t(bfr+topSize)-H.t(bfr), 0.35, 0.15); // 0 (Portrait)
                H.plate(H.l(bfr+topSize), H.t(bfr), H.r(bfr) - H.l(bfr+topSize), H.t(bfr+topSize*2/3)-H.t(bfr), 0.35, 0.2); // 1 (Message box)
                H.plate(H.l(bfr+topSize), H.t(bfr+topSize*2/3), H.r(bfr) - H.l(bfr+topSize), H.t(bfr+topSize)-H.t(bfr+topSize*2/3), 0.35, 0.2); // 2 (Value meter)
                H.plate(H.l(bfr), H.t(bfr+topSize+bfr/2), H.l(_w/2-bfr/2) - H.l(bfr), H.b(bfr+bsize+bfr) - H.t(bfr+topSize+bfr), 0.35, 0.225); // 3 (Left pane)
                H.plate(H.l(_w/2), H.t(bfr+topSize+bfr/2), H.r(bfr) - H.l(_w/2), H.b(bfr+bsize+bfr) - H.t(bfr+topSize+bfr), 0.35, 0.225); // 4 (Right pane)
                H.plate(H.l(_w/2-_w*0.08), H.b(bfr+bsize+bfr+bfr/2), _w*0.16, bsize+bfr+bfr, 0.35, 0.2); // 5 (Make trade button)
                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                self.hudBtn = H.hudBtn;
                self.hudHM = H;

            });

            this.lastAW = aw;
            this.lastAH = ah;

            if (this.hudObj) {
                this.hudObj.set_nm(this.hudNM);
            }
        }

        if (!this.hudObj) {
            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
                this.p.x, this.p.y, // x, y
                this.w, this.h, // w, h
                0.05, // z
                [1.1,1.1,1.1,1], // color
                false, // split
                true // moving
            );
        }

        if (this.hudObj) {
            this.hudObj.set_pos(this.p.x, this.p.y);
            this.hudObj.set_size(this.w, this.h);
            ctx.clearRect(this.p.x, this.p.y, this.w, this.h);
        }

        if (this.hudBtn && this.hudHM && this.compValList && this.compValLookup && this.p.y < BSWG.render.viewport.h) {
            var self = this;
            var hx = function(v) {
                var t = (v - self.hudHM.l(0)) / (self.hudHM.r(0) - self.hudHM.l(0));
                return self.w*t + self.p.x;
            };
            var hy = function(v) {
                var t = (v - self.hudHM.t(0)) / (self.hudHM.b(0) - self.hudHM.t(0));
                return self.h*t + self.p.y;
            };

            if (this.portrait) {
                ctx.drawImage(this.portrait, 0, 0, this.portrait.width, this.portrait.height,
                              hx(this.hudBtn[0][0]) + 6, hy(this.hudBtn[0][1]) + 6,
                              hx(this.hudBtn[0][2]) - hx(this.hudBtn[0][0]) - 12,
                              hy(this.hudBtn[0][3]) - hy(this.hudBtn[0][1]) - 12);
            }


            var x = hx(this.hudBtn[1][0])+12,
                y = hy(this.hudBtn[1][1])+20+8;
            var w = hx(this.hudBtn[1][2])-x-6,
                h = hy(this.hudBtn[1][3])-y-12;

            var fs = Math.min(~~(h * 0.3), 20);
            ctx.font = fs + 'px Orbitron';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#88f';
            ctx.strokeStyle = '#226';

            var text = this.text.substring(0, Math.min(~~((Date.timeStamp() - this.startTime) * 30), this.text.length));
            if (this.lastText !== text && text.length > 0) {
                var ch = text.charAt(text.length-1);
                if (ch !== ' ' && ch !== '\n' && ch !== '\t' && ch !== '.') {
                    new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                }
            }
            this.lastText = text;
            var lines = text.split('\n');
            var y1 = y;
            for (var i=0; i<lines.length; i++) {
                var words = lines[i].split(' ');
                var csent = new Array();
                for (var j=0; j<words.length; j++) {
                    var t2 = csent.join(' ');
                    var t3 = t2 + ' ' + words[j];
                    if (ctx.textWidthB(t3) >= w) {
                        ctx.fillTextB(t2, x, y1);
                        y1 += fs + 4;
                        csent.length = 0;
                    }
                    csent.push(words[j]);
                }
                if (csent.length) {
                    ctx.fillTextB(csent.join(' '), x, y1);
                }
                y1 += fs + 4;
            }

            var x = hx(this.hudBtn[2][0])+4,
                y = hy(this.hudBtn[2][1])+4;
            var w = hx(this.hudBtn[2][2])-x-8,
                h = hy(this.hudBtn[2][3])-y-8;

            this.percent += (this.toPercent - this.percent) * Math.min(1, BSWG.render.dt) * 4.0;

            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.fillRect(x+8, y+8, (w-16) * Math.min(this.percent / 100, 1), h-8);

            var fs = Math.min(~~(h * 0.5), 20);
            ctx.font = fs + 'px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#8f8';
            ctx.strokeStyle = '#666';

            ctx.fillTextB(Math.floor(this.percent*10+0.5)/10 + '%', x + w/2, y + h - fs*0.325);

            var x = hx(this.hudBtn[3][0])+2,
                y = hy(this.hudBtn[3][1])+4;
            var w = hx(this.hudBtn[3][2])-x-4,
                h = hy(this.hudBtn[3][3])-y-8;

            var sh = h / 8;

            if (this.want) {

                var y0 = y + 2;
                for (var i=this.scrollLeft; i<(this.give.length+1) && i<(this.scrollLeft+8); i++) {
                    if (this.hoverLeft === i && this.hoverLeft !== null) {
                        ctx.fillStyle = '#888';
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                    }
                    if ((i === this.scrollLeft && i > 0) || (i === (this.scrollLeft+7) && i<(this.give.length))) {
                        ctx.fillStyle = 'rgba(64, 64, 64, 0.5)';
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        var fs = Math.min(~~(sh * 0.35), 20);
                        ctx.font = fs + 'px Orbitron';
                        ctx.textAlign = 'center';
                        ctx.fillStyle = '#fff';
                        ctx.strokeStyle = '#000';
                        ctx.fillTextB('More', x+w/2, y0 + sh - fs*1.25);
                    }
                    else {
                        var it = i === 0 ? this.want : this.give[i-1];
                        ctx.fillStyle = 'rgba(255, 127, 0, 0.5)';
                        if (!it.rare) {
                            var t = Math.pow(Math.clamp(it.value / 100, 0, 1), 0.135);
                            ctx.fillStyle = 'rgba(' + Math.floor(255*t) + ',0,' + Math.floor(255*(1-t)) + ',0.5)';
                        }
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        var fs = Math.min(~~(sh * 0.35), 20);
                        ctx.font = fs + 'px Orbitron';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#fff';
                        ctx.strokeStyle = '#000';
                        var name = this.compName[it.key];
                        if (BSWG.game.map) {
                            var lvl = BSWG.game.map.minLevelComp(it.key);
                            if (i < 1) {
                                name += ' (L.' + lvl + ')';
                            }
                            if (BSWG.game.xpInfo && lvl > BSWG.game.xpInfo.level) {
                                ctx.fillStyle = '#f00';
                            }
                        }
                        ctx.fillTextB(name, x+24+sh, y0 + sh - fs*1.25);
                        BSWG.renderCompIconRecenter = true;
                        var clr = [.4, .4, .4];
                        BSWG.renderCompIcon(ctx, it.key, x+16+sh*0.5, y0 + sh * 0.5, (sh-8) / 4, 0.2 + (this.hoverLeft === i ? BSWG.render.time : 0.0), clr[0], clr[1], clr[2]);
                        //ctx.fillTextB(this.compName[it.key], x+24, y0 + sh - fs*1.25);
                        ctx.textAlign = 'right';
                        ctx.fillStyle = '#bbb';
                        var count = i === 0 ? this.wantCount : it.count;
                        ctx.fillTextB('' + count + 'x', x+w-18, y0 + sh - fs*1.25)
                        if (i > 0) {
                            ctx.textAlign = 'right';
                            ctx.fillStyle = '#ffb';
                            ctx.fillTextB(Math.clamp(Math.floor(count*100*it.value/this.want.value * 10 + 0.5) / 10, 0, 100*100) + '%', x+w-18-fs*3.5, y0 + sh - fs*1.25);
                        }
                        else {
                            ctx.textAlign = 'right';
                            ctx.fillStyle = '#fbb';
                            ctx.fillTextB('(X)', x+w-18-fs*4+12, y0 + sh - fs*1.25);   
                        }
                        if (count <= 0) {
                            ctx.fillStyle = 'rgba(0,0,0,.35)';
                            ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        }
                        if (i === 0) {
                            ctx.strokeStyle = '#aaa';
                            ctx.beginPath();
                            ctx.moveTo(x+8, y0+sh+2);
                            ctx.lineTo(x+8+w-12, y0+sh+2);
                            ctx.closePath();
                            ctx.stroke();
                        }
                    }
                    y0 += sh;
                }
            }
            else {

                var y0 = y + 2;
                for (var i=this.scrollLeft; i<this.compValList.length && i<(this.scrollLeft+8); i++) {
                    if (this.hoverLeft === i && this.hoverLeft !== null) {
                        ctx.fillStyle = '#888';
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                    }
                    if ((i === this.scrollLeft && i > 0) || (i === (this.scrollLeft+7) && i<(this.compValList.length-1))) {
                        ctx.fillStyle = 'rgba(64, 64, 64, 0.5)';
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        var fs = Math.min(~~(sh * 0.35), 20);
                        ctx.font = fs + 'px Orbitron';
                        ctx.textAlign = 'center';
                        ctx.fillStyle = '#fff';
                        ctx.strokeStyle = '#000';
                        ctx.fillTextB('More', x+w/2, y0 + sh - fs*1.25);
                    }
                    else {
                        var it = this.compValList[i];
                        ctx.fillStyle = 'rgba(255, 127, 0, 0.5)';
                        if (!it.rare) {
                            var t = Math.pow(Math.clamp(it.value / 100, 0, 1), 0.135);
                            ctx.fillStyle = 'rgba(' + Math.floor(255*t) + ',0,' + Math.floor(255*(1-t)) + ',0.5)';
                        }
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        var fs = Math.min(~~(sh * 0.35), 20);
                        ctx.font = fs + 'px Orbitron';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#fff';
                        ctx.strokeStyle = '#000';
                        var name = this.compName[it.key];
                        if (BSWG.game.map) {
                            var lvl = BSWG.game.map.minLevelComp(it.key);
                            name += ' (L.' + lvl + ')';
                            if (BSWG.game.xpInfo && lvl > BSWG.game.xpInfo.level) {
                                ctx.fillStyle = '#f00';
                            }
                        }
                        ctx.fillTextB(name, x+24+sh, y0 + sh - fs*1.25);
                        BSWG.renderCompIconRecenter = true;
                        var clr = [.4, .4, .4];
                        BSWG.renderCompIcon(ctx, it.key, x+16+sh*0.5, y0 + sh * 0.5, (sh-8) / 4, 0.2 + (this.hoverLeft === i ? BSWG.render.time : 0.0), clr[0], clr[1], clr[2]);
                        //ctx.fillTextB(this.compName[it.key], x+24, y0 + sh - fs*1.25);
                    }
                    y0 += sh;
                }
            }

            var x = hx(this.hudBtn[4][0])+2,
                y = hy(this.hudBtn[4][1])+4;
            var w = hx(this.hudBtn[4][2])-x-4,
                h = hy(this.hudBtn[4][3])-y-8;

            var sh = h / 8;

            if (this.want) {

                var y0 = y + 2;
                for (var i=this.scrollRight; i<this.playerCompList.length && i<(this.scrollRight+8); i++) {
                    if (this.hoverRight === i && this.hoverRight !== null) {
                        ctx.fillStyle = '#888';
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                    }
                    if ((i === this.scrollRight && i > 0) || (i === (this.scrollRight+7) && i<(this.playerCompList.length-1))) {
                        ctx.fillStyle = 'rgba(64, 64, 64, 0.5)';
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        var fs = Math.min(~~(sh * 0.35), 20);
                        ctx.font = fs + 'px Orbitron';
                        ctx.textAlign = 'center';
                        ctx.fillStyle = '#fff';
                        ctx.strokeStyle = '#000';
                        ctx.fillTextB('More', x+w/2, y0 + sh - fs*1.25);
                    }
                    else {
                        var it = this.playerCompList[i];
                        ctx.fillStyle = 'rgba(255, 127, 0, 0.5)';
                        if (!it.rare) {
                            var t = Math.pow(Math.clamp(it.value / 100, 0, 1), 0.135);
                            ctx.fillStyle = 'rgba(' + Math.floor(255*t) + ',0,' + Math.floor(255*(1-t)) + ',0.5)';
                        }
                        ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        var fs = Math.min(~~(sh * 0.35), 20);
                        ctx.font = fs + 'px Orbitron';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#fff';
                        ctx.strokeStyle = '#000';
                        ctx.fillTextB(this.compName[it.key], x+24+sh, y0 + sh - fs*1.25);
                        BSWG.renderCompIconRecenter = true;
                        var clr = [.4, .4, .4];
                        BSWG.renderCompIcon(ctx, it.key, x+16+sh*0.5, y0 + sh * 0.5, (sh-8) / 4, 0.2 + (this.hoverRight === i ? BSWG.render.time : 0.0), clr[0], clr[1], clr[2]);
                        //ctx.fillTextB(this.compName[it.key], x+24, y0 + sh - fs*1.25);
                        ctx.textAlign = 'right';
                        ctx.fillStyle = '#bbb';
                        ctx.fillTextB('' + it.count + 'x', x+w-18, y0 + sh - fs*1.25)
                        ctx.textAlign = 'right';
                        ctx.fillStyle = '#ffb';
                        ctx.fillTextB(Math.clamp(Math.floor(100*it.value/this.want.value * 10 + 0.5) / 10, 0, 100*100) + '%', x+w-18-fs*3.5, y0 + sh - fs*1.25);
                        if (it.count <= 0) {
                            ctx.fillStyle = 'rgba(0,0,0,.35)';
                            ctx.fillRect(x+8, y0+4, w-12, sh-8);
                        }
                    }
                    y0 += sh;
                }
            }

        }

        ctx.font = '16px Orbitron';

        ctx.fillStyle = 'rgba(50,50,50,0.5)';

        ctx.lineWidth = 1.0;

        ctx.textAlign = 'left';

        ctx.globalAlpha = 1.0;

    },

    update: function () {

        var self = this;
        if (!this.mtButton) {
            this.mtButton = new BSWG.uiControl(BSWG.control_Button, {
                x: 10, y: 10,
                w: 64, h: 65,
                text: 'Make trade!',
                selected: true,
                click: function (me) {
                    if (self.willTrade && self.wantCount) {
                        self.makeTrade();
                    }
                }
            });
        }

        var toY = 2048;

        if (BSWG.game.scene === BSWG.SCENE_GAME1 && BSWG.game.tradeMode) {
            toY = BSWG.game.hudY(BSWG.game.tradeWindowPos[1]);
        }

        this.p.x = BSWG.game.hudX(BSWG.game.tradeWindowPos[0]);
        this.p.y += (toY - this.p.y) * BSWG.render.dt * 32.0;

        this.w = BSWG.game.hudX(BSWG.game.tradeWindowPos[2]) - BSWG.game.hudX(BSWG.game.tradeWindowPos[0]);
        this.h = BSWG.game.hudY(BSWG.game.tradeWindowPos[3]) - BSWG.game.hudY(BSWG.game.tradeWindowPos[1]);

        this.hoverLeft = this.hoverRight = null;

        if (this.hudBtn && this.hudHM && this.compValList && this.compValLookup) {
            var self = this;
            var hx = function(v) {
                var t = (v - self.hudHM.l(0)) / (self.hudHM.r(0) - self.hudHM.l(0));
                return self.w*t + self.p.x;
            };
            var hy = function(v) {
                var t = (v - self.hudHM.t(0)) / (self.hudHM.b(0) - self.hudHM.t(0));
                return self.h*t + self.p.y;
            };

            this.mtButton.p.x = hx(this.hudBtn[5][0]);
            this.mtButton.p.y = hy(this.hudBtn[5][1]);
            this.mtButton.w = hx(this.hudBtn[5][2]) - this.mtButton.p.x;
            this.mtButton.h = hy(this.hudBtn[5][3]) - this.mtButton.p.y;

            if (this.mouseIn) {

                var mx = BSWG.input.MOUSE('x');// - this.p.x;
                var my = BSWG.input.MOUSE('y');// - this.p.y;

                var x = hx(this.hudBtn[3][0])+2,
                    y = hy(this.hudBtn[3][1])+4;
                var w = hx(this.hudBtn[3][2])-x-4,
                    h = hy(this.hudBtn[3][3])-y-8;

                var sh = h / 8;

                if (this.want) {

                    var y0 = y + 2;
                    for (var i=this.scrollLeft; i<(this.give.length+1) && i<(this.scrollLeft+8); i++) {
                        if (mx >= (x+8) && mx < (x+8+w-12) && my >= (y0+4) && my < (y0+4+sh-8)) {
                            this.hoverLeft = i;
                            if (BSWG.input.MOUSE_RELEASED('left')) {
                                if ((i === this.scrollLeft && i > 0) || (i === (this.scrollLeft+7) && i<(this.give.length))) {
                                    this.lastScrollLeft = Date.timeStamp();
                                    if (i === this.scrollLeft && i > 0) {
                                        this.scrollLeft -= 6;
                                        if (this.scrollLeft < 0)  {
                                            this.scrollLeft = 0;
                                        }
                                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                    }
                                    else {
                                        this.scrollLeft += 6;
                                        if (this.scrollLeft > this.give.length-6) {
                                            this.scrollLeft = Math.max(this.give.length-6, 0);
                                        }
                                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                    }
                                }
                                else if (!this.lastScrollLeft || (Date.timeStamp() - this.lastScrollLeft) > 0.75) {
                                    new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                    if (i === 0) {
                                        this.want = null;
                                        this.scrollLeft = this.lScrollLeft;
                                        this.setPercent(0.0);
                                        this.say(this.initMsgs[(~~(Math.random()*100000)) % this.initMsgs.length]);
                                    }
                                    else {
                                        var it = this.give[i-1];
                                        if (it) {
                                            it.count -= 1;
                                            for (var j=0; j<this.playerCompList.length; j++) {
                                                if (this.playerCompList[j].key === it.key) {
                                                    this.playerCompList[j].count += 1;
                                                    break;
                                                }
                                            }
                                            if (it.count <= 0) {
                                                this.give.splice(i-1, 1);
                                                if (this.scrollLeft > this.give.length-6) {
                                                    this.scrollLeft = Math.max(this.give.length-6, 0);
                                                }
                                                this.updateValue();
                                                break;
                                            }
                                            this.updateValue();
                                        }
                                    }
                                }
                            }
                            break;
                        }
                        y0 += sh;
                    }

                }
                else {

                    var y0 = y + 2;
                    for (var i=this.scrollLeft; i<this.compValList.length && i<(this.scrollLeft+8); i++) {
                        if (mx >= (x+8) && mx < (x+8+w-12) && my >= (y0+4) && my < (y0+4+sh-8)) {
                            this.hoverLeft = i;
                            if (BSWG.input.MOUSE_RELEASED('left')) {
                                if ((i === this.scrollLeft && i > 0) || (i === (this.scrollLeft+7) && i<(this.compValList.length-1))) {
                                    this.lastScrollLeft = Date.timeStamp();
                                    if (i === this.scrollLeft && i > 0) {
                                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                        this.scrollLeft -= 6;
                                        if (this.scrollLeft < 0)  {
                                            this.scrollLeft = 0;
                                        }
                                    }
                                    else {
                                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                        this.scrollLeft += 6;
                                        if (this.scrollLeft > this.compValList.length-7) {
                                            this.scrollLeft = this.compValList.length-7;
                                        }
                                    }
                                }
                                else if (!this.lastScrollLeft || (Date.timeStamp() - this.lastScrollLeft) > 0.75) {
                                    this.want = this.compValList[i];
                                    this.lScrollLeft = this.scrollLeft;
                                    this.scrollLeft = 0;
                                    this.give = [];
                                    this.resetPCL();
                                    var text = (this.want.rare ? "Excellent choice, w" : "W") + "hat are you willing to trade?";
                                    if (BSWG.game.map) {
                                        var lvl = BSWG.game.map.minLevelComp(this.want.key);
                                        if (BSWG.game.xpInfo && lvl > BSWG.game.xpInfo.level) {
                                            text += ' I have to warn you though, you won\'t be able to use this until you get to level ' + lvl + '!';
                                        }
                                    }
                                    this.say(text);
                                    new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                }
                            }
                            break;
                        }
                        y0 += sh;
                    }
                }

                var x = hx(this.hudBtn[4][0])+2,
                    y = hy(this.hudBtn[4][1])+4;
                var w = hx(this.hudBtn[4][2])-x-4,
                    h = hy(this.hudBtn[4][3])-y-8;

                var sh = h / 8;

                if (this.want) {
                    var y0 = y + 2;
                    for (var i=this.scrollRight; i<this.playerCompList.length && i<(this.scrollRight+8); i++) {
                        if (mx >= (x+8) && mx < (x+8+w-12) && my >= (y0+4) && my < (y0+4+sh-8)) {
                            this.hoverRight = i;
                            if (BSWG.input.MOUSE_RELEASED('left')) {
                                if ((i === this.scrollRight && i > 0) || (i === (this.scrollRight+7) && i<(this.playerCompList.length-1))) {
                                    this.lastScrollRight = Date.timeStamp();
                                    if (i === this.scrollRight && i > 0) {
                                        this.scrollRight -= 6;
                                        if (this.scrollRight < 0)  {
                                            this.scrollRight = 0;
                                        }
                                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                    }
                                    else {
                                        this.scrollRight += 6;
                                        if (this.scrollRight > this.playerCompList.length-7) {
                                            this.scrollRight = this.playerCompList.length-7;
                                        }
                                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                    }
                                }
                                else if (!this.lastScrollRight || (Date.timeStamp() - this.lastScrollRight) > 0.75) {
                                    var it = this.playerCompList[i];
                                    if (it && it.count > 0) {
                                        it.count -= 1;
                                        var ob = null;
                                        for (var j=0; j<this.give.length; j++) {
                                            if (this.give[j].key === it.key) {
                                                ob = this.give[j];
                                            }
                                        }
                                        if (!ob) {
                                            ob = deepcopy(it);
                                            this.give.push(ob);
                                            ob.count = 0;
                                        }
                                        ob.count += 1;
                                        new BSWG.soundSample().play('dialog', null, 0.075, (Math.random() * 0.1 + 0.9) * (this.portraitId < 0 ? 2.0 : 1.1));
                                        this.updateValue();
                                    }
                                }
                            }
                            break;
                        }
                        y0 += sh;
                    }             
                }
            }
        }

        if (this.mtButton && this.willTrade) {
            this.mtButton.flashing = true;
        }
        else {
            this.mtButton.p.y = BSWG.render.viewport.h + 2;
            this.mtButton.flashing = false;
        }

    },

    initMsgs: [
        "How can I help you?",
        "Need anything?",
        "I've got just the thing...",
        "Anything you need, we can trade for it!"
    ],

    say: function(text) {

        this.text = text;
        this.startTime = Date.timeStamp();

    },

    setPercent: function(per) {

        this.toPercent = per;

    },

    makeTrade: function () {
        if (this.willTrade && this.wantCount && this.give && this.want && this.give.length && BSWG.game.xpInfo) {
            new BSWG.soundSample().play('trade', null, 0.15, (Math.random() * 0.01 + 0.99));
            BSWG.game.xpInfo.addStoreKey(this.want.key, this.wantCount);
            for (var i=0; i<this.give.length; i++) {
                BSWG.game.xpInfo.inventoryRemoveKey(this.give[i].key, this.give[i].count);
            }
            this.reset("Thank you! Need anything else?");
        }
    },

    updateValue: function () {

        var owt = this.willTrade;
        var lcount = this.wantCount;
        this.willTrade = false;

        var value = 0.0;
        for (var i=0; i<this.give.length; i++) {
            value += this.give[i].count * this.give[i].value;
        }
        if (this.want) {
            var percent = value / this.want.value;
            var count = Math.floor(percent);
            this.wantCount = Math.clamp(count, 1, 100);
            this.setPercent(Math.clamp(percent*100, 0, 100*100));

            if (percent >= 1) {
                this.willTrade = true;
            }

            if (owt !== this.willTrade || lcount !== this.wantCount) {
                if (this.willTrade) {
                    if (count > 1) {
                        this.say("I'll give you " + this.wantCount + '!');
                    }
                    else {
                        this.say("Looks like a good trade to me!");
                    }
                }
                else {
                    this.say("Going to need more than that.");
                }
            }
        }
        else {
            this.setPercent(0);
        }

    },

    resetPCL: function () {
        this.playerCompList = [];
        for (var i=0; i<this.compValList.length; i++) {
            var it = this.compValList[i];
            var count = BSWG.componentList.compStrCount(it.key);
            if (count > 0) {
                var ob = deepcopy(it);
                ob.count = count;
                this.playerCompList.push(ob);
            }
        }
        this.give = [];
        this.setPercent(0.0);
        this.willTrade = false;
    },

    reset: function (msg) {

        this.compValList = (BSWG.game.inZone ? BSWG.game.inZone.compValList : null) || [];
        this.compValLookup = (BSWG.game.inZone ? BSWG.game.inZone.compValLookup : null) || [];
        this.compName = {};
        for (var i=0; i<this.compValList.length; i++) {
            var it = this.compValList[i];
            this.compName[it.key] = BSWG.componentList.compStrName(it.key);
        }
        this.resetPCL();
        this.scrollLeft = this.scrollRight = 0;
        this.hoverLeft = this.hoverRight = null;
        this.want = null;
        this.wantCount = 1;
        this.give = [];
        this.percent = 0;
        this.willTrade = false;
        this.setPercent(0.0);
        this.say(msg ? msg : this.initMsgs[(~~(Math.random()*100000)) % this.initMsgs.length]);

    }

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
                BSWG.ui_3dScreen(this.p, 5.0),
                this.lowDetail,
                0.35
            );
        }
        this.added = true;

        this.noDestroy = args.noDestroy || false;

    },

    hide: function () {
        if (this.textObj) {
            BSWG.render.scene.remove(this.textObj.mesh);
            //BSWG.render.sceneS.remove(this.textObj.shadowMesh);
        }
    },

    show: function () {
        if (this.textObj) {
            BSWG.render.scene.add(this.textObj.mesh);
            //BSWG.render.sceneS.add(this.textObj.shadowMesh);
        }
    },

    render: function (ctx, viewport) {

        var H = BSWG.ui_3dSizeH(this.h, this.p);
        this.textObj.size = H*0.5;
        this.textObj.pos = BSWG.ui_3dScreen(this.p, 5.0);
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
    },

    hoverClickSound: true

};

BSWG.control_KeyConfig = {

    init: function (args) {

        var self = this;
        this.close = function (key, alt) {
            self.key = key;
            args.close(key, alt);
            self.remove();
        };

        this.uiKey = !!args.uiKey;

        this.title = args.title || 'Keybinding';

        this.alt = BSWG.input.KEY_DOWN(BSWG.KEY.SHIFT);

        if (this.alt) {
            this.title += ' (Alternate key)';
        }
        this.key = args.key;
        if (this.alt) {
            if (this.key !== args.altKey) {
                this.okey = this.key;
            }
            this.key = args.altKey;
        }
    },

    render: function (ctx, viewport) {

        if (this.p.x < 0) {
            this.p.x = 0;
        }
        else if ((this.p.x+this.w) > BSWG.render.viewport.w) {
            this.p.x = BSWG.render.viewport.w - this.w;
        }
        if (this.p.y < 0) {
            this.p.y = 0;
        }
        else if ((this.p.y+this.h) > BSWG.render.viewport.h) {
            this.p.y = BSWG.render.viewport.h - this.h;
        }

        ctx.font = '16px Orbitron';

        ctx.strokeStyle = '#aaa';
        ctx.fillStyle = 'rgba(50,50,50,1.0)';

        ctx.lineWidth = 2.0;

        ctx.globalAlpha = 1.0;
        //BSWG.draw3DRect(ctx, this.p.x, this.p.y, this.w, this.h, 5, true, true ? 'rgba(255,255,255,0.45)' : null);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.75)';
        ctx.fillRect(this.p.x+4, this.p.y+4, this.w, this.h);
        ctx.fillStyle = 'rgba(64, 64, 64, 0.75)';

        var grd = ctx.createLinearGradient(this.p.x, this.p.y, this.p.x, this.p.y+this.h);
        grd.addColorStop(0, 'rgba(64, 64, 64, 0.75)');
        grd.addColorStop(1, 'rgba(96, 96, 96, 0.75)');
        ctx.fillStyle = grd;
        grd = null;
        ctx.fillRect(this.p.x, this.p.y, this.w, this.h);
        ctx.strokeRect(this.p.x, this.p.y, this.w, this.h);

        ctx.lineWidth = 2.0;

        ctx.beginPath();
        ctx.moveTo(this.p.x + 16, this.p.y + 30);
        ctx.lineTo(this.p.x + this.w - 16, this.p.y + 30);
        ctx.closePath();
        ctx.strokeStyle = '#aaa';
        ctx.stroke();

        ctx.strokeStyle = '#000';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillTextB(this.title, this.p.x + 16, this.p.y + 25);
        ctx.fillStyle = '#ddd';
        ctx.fillTextB("Bound to ", this.p.x + 16, this.p.y + 25 + 25);
        ctx.fillStyle = '#afa';
        ctx.fillTextB("" + (BSWG.KEY_NAMES[this.key] || '').toTitleCase(), this.p.x + 16 + 93, this.p.y + 25 + 25);
        ctx.fillStyle = '#d8d8f';
        ctx.fillTextB("Press a key to bind" + (this.okey ? ", " + (BSWG.KEY_NAMES[this.okey] || '').toTitleCase() + ' to remove alt.' : ''), this.p.x + 16, this.p.y + 25 + 44);

        ctx.lineWidth = 1.0;

        ctx.textAlign = 'left';

    },

    update: function () {

        var keys = BSWG.input.getKeyMap();
        if (keys[BSWG.KEY.ESC] || BSWG.input.MOUSE_PRESSED('left') || (!BSWG.game.editMode && !BSWG.game.showControls)) {
            BSWG.input.EAT_KEY(BSWG.KEY.ESC);
            BSWG.input.EAT_MOUSE('left');
            this.close(null, this.alt);
            return;
        }

        for (var k in keys) {
            k = parseInt(k);
            if (keys[k] === true && k !== BSWG.KEY.ALT && k !== BSWG.KEY.WINDOWS && k !== BSWG.KEY.SHIFT && k !== BSWG.KEY.CTRL && k !== BSWG.KEY['RIGHT CLICK']) {
                BSWG.input.EAT_KEY(k);
                this.close(parseInt(k), this.alt);
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

    if ('hoverClickSound' in args) {
        this.hoverClickSound = args['hoverClickSound'];
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

    this._added = false;

    this.remove = function () {

        if (this.onremove) {
            this.onremove();
        }

        this._added = false;
        BSWG.ui.remove(this);

    };

    this.add = function () {

        this._added = true;
        BSWG.ui.add(this);

        if (this.onadd) {
            this.onadd();
        }

    };

    this.add();

    this._update = function () {

        if (!this._added) {
            return;
        }

        var mx = BSWG.input.MOUSE('x');
        var my = BSWG.input.MOUSE('y');

        if (this.vpXCenter) {
            this.p.x = BSWG.render.viewport.w * 0.5;
        }

        if (this.xCentered) {
            mx += this.w * 0.5;
        }

        var omousein = this.mouseIn;

        if (mx >= this.p.x && my >= this.p.y && mx < (this.p.x + this.w) && my < (this.p.y + this.h) && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn)
            this.mouseIn = true;
        else
            this.mouseIn = false;

        var KD = this.userKeyBind ? !!BSWG.input.KEY_DOWN(BSWG.game.buttonBinds[this.userKeyBind]) : false
        var KP = this.userKeyBind ? !!BSWG.input.KEY_PRESSED(BSWG.game.buttonBinds[this.userKeyBind]) : false;
        var KR = this.userKeyBind ? !!BSWG.input.KEY_RELEASED(BSWG.game.buttonBinds[this.userKeyBind]) : false;

        if (this.mouseIn && this.userKeyBind && BSWG.game.showControls) {
            BSWG.render.setCustomCursor(true, 3, null, true);
            if (BSWG.input.MOUSE_PRESSED('right')) {
                BSWG.input.EAT_MOUSE('right');
                var self = this;
                if (BSWG.compActiveConfMenu) {
                    BSWG.compActiveConfMenu.remove();
                }
                BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
                    x: this.p.x-150, y: this.p.y-25,
                    w: 450, h: 50+32,
                    key: BSWG.game.buttonBinds[this.userKeyBind],
                    title: 'Change keybinding',
                    uiKey: true,
                    close: function (key) {
                        if (key) {
                            BSWG.game.buttonBinds[self.userKeyBind] = key;
                        }
                    }
                });
            }
        }

        if (KD || KR) {
            this.mouseIn = true;
        }

        if (this.mouseIn && !omousein && this.hoverClickSound && this.click) {
            //new BSWG.soundSample().play('hover', null, 0.1, 1.45+Math.random()*0.05);
        }

        if (this.click && ((this.mouseIn && (BSWG.input.MOUSE_RELEASED('left') || KR)) || (this.clickKey && BSWG.input.KEY_PRESSED(this.clickKey))) && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn)
        {
            if (this.hoverClickSound) {
                new BSWG.soundSample().play('click', null, 0.15, 1.45+Math.random()*0.05);
            }
            this.click(this);
        }

        this.mouseDown = this.mouseIn && BSWG.input.MOUSE('left') && !BSWG.game.grabbedBlock && !BSWG.game.attractorOn;
        if (KD) {
            this.mouseDown = true;
        }

        if ((BSWG.input.MOUSE_PRESSED('left')||KP) && this.mouseDown) {
            if (this.hoverClickSound && this.click) {
                new BSWG.soundSample().play('click', null, 0.15, 0.95+Math.random()*0.05);
            }
        }

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