BSWG.maxCCs = 4; // 3 enemies + player

BSWG.grabSlowdownDist      = 0.5;
BSWG.grabSlowdownDistStart = 3.0;
BSWG.maxGrabDistance       = 45.0;
BSWG.mouseLookFactor       = 0.0; // 0 to 0.5
BSWG.camVelLookBfr         = 0.22; // * viewport.w
BSWG.lookRange             = 45.0;
BSWG.grabSpeed             = 3.5;
BSWG.attractorRange        = 4.0;
BSWG.attractorForce        = 6.5;

BSWG.SCENE_TITLE = 1;
BSWG.SCENE_GAME1 = 2;
BSWG.SCENE_GAME2 = 3;

BSWG.selection = function(){

    this.startPos = null;
    this.endPos = null;
    this.sellC = null;
    this.sellR = 0.0;
    this.sellRotC = null;
    this.sellRotR = 0.0;
    this.selected = null;
    this.dragging = false;

};

BSWG.selection.prototype.update = function(dt, mousePos) {

    var sellAdd = BSWG.input.KEY_DOWN(BSWG.KEY.SHIFT);
    var sellRemove = BSWG.input.KEY_DOWN(BSWG.KEY.CTRL);
    var sellRotate = BSWG.input.KEY_DOWN(BSWG.KEY.ALT);

    if (!BSWG.game.editMode || ((this.dragging || this.draggingRot) && (!this.selected || !this.sellC || !this.sellRotC))) {
        this.deselect();
        this.sellC = null;
        this.sellR = 0.0;
        this.sellHover = false;
        this.sellRotHover = false;
        this.sellRotC = null;
        this.sellRotR = 0.0;
        this.dragging = false;
        this.draggingRot = false;
        this.startPos = this.endPos = this.selected = null;
        return;
    }

    if (BSWG.input.KEY_DOWN(BSWG.KEY.ESC) && this.selected) {
        this.deselect();
        this.sellC = null;
        this.sellR = 0.0;
        this.sellHover = false;
        this.sellRotHover = false;
        this.sellRotC = null;
        this.sellRotR = 0.0;
        this.dragging = false;
        this.draggingRot = false;
        BSWG.input.EAT_KEY(BSWG.KEY.ESC);
        return;
    }

    if (!this.startPos) {
        if (!this.draggingRot && !this.dragging && BSWG.input.MOUSE('left') && !sellAdd && !sellRemove && this.sellC && Math.distVec2(this.sellC, mousePos) < this.sellRotR) {
            this.dragging = true;
            this.dragStart = mousePos.clone();
            this.sellCStart = this.sellC.clone();
            var group = [];
            for (var i=0; i<this.selected.length; i++) {
                var C = this.selected[i];
                if (C.type === 'cc' || !C.obj || !C.obj.body) {
                    continue;
                }
                C.dragging = true;
                group.push(C);
            }
            BSWG.componentList.unweldGroup(group);
        } else if (this.dragging && BSWG.input.MOUSE('left')) {
            var delta = mousePos.clone();
            delta.x -= this.dragStart.x + (this.sellC.x - this.sellCStart.x);
            delta.y -= this.dragStart.y + (this.sellC.y - this.sellCStart.y);
            var len = Math.sqrt(delta.x, delta.y);
            if (len > 1) {
                delta.x = (delta.x / len) * 1;
                delta.y = (delta.y / len) * 1;
            }
            for (var i=0; i<this.selected.length; i++) {
                var C = this.selected[i];
                if (C.type === 'cc' || !C.obj || !C.obj.body) {
                    continue;
                }
                C.obj.body.SetLinearVelocity(new b2Vec2(delta.x*10, delta.y*10));
                C.obj.body.SetAngularVelocity(C.obj.body.GetAngularVelocity()*0.85);
            }
        } else if (this.dragging) {
            this.dragging = false;
            var group = [];
            for (var i=0; i<this.selected.length; i++) {
                var C = this.selected[i];
                C.dragging = false;
                if (C.type === 'cc' || !C.obj || !C.obj.body) {
                    continue;
                }
                C.obj.body.SetLinearVelocity(new b2Vec2(0, 0));
                C.obj.body.SetAngularVelocity(0);
                group.push(C);
            }
            BSWG.componentList.weldGroup(group);
        }

        if (!this.dragging && !this.draggingRot && (BSWG.input.MOUSE('left') || sellRotate) && !sellAdd && !sellRemove && this.sellC && this.sellRotC && (Math.distVec2(this.sellRotC, mousePos) < this.sellRotR || sellRotate)) {
            this.draggingRot = true;
            this.sellRotAStart = this.sellRotA;
            this.sellRotTotal = 0.0;
            this.sellCStart = this.sellC.clone();
            var group = [];
            for (var i=0; i<this.selected.length; i++) {
                var C = this.selected[i];
                if (C.type === 'cc' || !C.obj || !C.obj.body) {
                    continue;
                }
                C.dragging = true;
                C._rotStart = C.obj.body.GetWorldCenter().clone();
                C._rotStart.x -= this.sellCStart.x;
                C._rotStart.y -= this.sellCStart.y;
                C._rotStartA = C.obj.body.GetAngle();
                group.push(C);
            }
            BSWG.componentList.unweldGroup(group);
        }
        else if (this.draggingRot && (BSWG.input.MOUSE('left') || sellRotate)) {
            var delta1 = Math.angleDist(this.sellRotA, this.sellRotAStart);
            if (Math.abs(delta1) > Math.PI/8) {
                delta1 = (delta1 / Math.abs(delta1)) * Math.PI/8;
            }
            this.sellRotTotal += delta1;
            for (var i=0; i<this.selected.length; i++) {
                var C = this.selected[i];
                if (C.type === 'cc' || !C.obj || !C.obj.body) {
                    continue;
                }

                var delta = Math.angleDist(C._rotStartA + this.sellRotTotal, C.obj.body.GetAngle());
                var av = delta*10;
                C.obj.body.SetAngularVelocity(av);

                var deltaP = Math.rotVec2(C._rotStart.clone(), this.sellRotTotal);
                deltaP.x += this.sellCStart.x;
                deltaP.y += this.sellCStart.y;
                deltaP.x -= C.obj.body.GetWorldCenter().x;
                deltaP.y -= C.obj.body.GetWorldCenter().y;
                var len = Math.sqrt(deltaP.x, deltaP.y);
                if (len > 1) {
                    deltaP.x = (deltaP.x / len) * 1;
                    deltaP.y = (deltaP.y / len) * 1;
                }
                C.obj.body.SetLinearVelocity(new b2Vec2(deltaP.x*10, deltaP.y*10));
            }
            this.sellRotAStart = this.sellRotA;
        } else if (this.draggingRot) {
            this.draggingRot = false;
            var group = [];
            for (var i=0; i<this.selected.length; i++) {
                var C = this.selected[i];
                C.dragging = false;
                if (C.type === 'cc' || !C.obj || !C.obj.body) {
                    continue;
                }
                C.obj.body.SetLinearVelocity(new b2Vec2(0, 0));
                C.obj.body.SetAngularVelocity(0.0);
                group.push(C);
            }
            BSWG.componentList.weldGroup(group);
        }
    }

    if (!this.dragging && !this.draggingRot) {
        if (BSWG.input.MOUSE_PRESSED('left')) {
            this.startPos = mousePos.clone();
        }

        if (this.startPos) {
            this.endPos = mousePos.clone();
        }

        if (BSWG.input.MOUSE_RELEASED('left') || !BSWG.input.MOUSE('left')) {
            if (this.startPos && this.endPos) {
                var newSel = BSWG.componentList.withinBoxExact(
                    Math.min(this.startPos.x, this.endPos.x),
                    Math.min(this.startPos.y, this.endPos.y),
                    Math.max(this.startPos.x, this.endPos.x),
                    Math.max(this.startPos.y, this.endPos.y)
                );
                for (var i=0; i<newSel.length; i++) {
                    if (newSel[i].onCC && newSel[i].onCC !== BSWG.game.ccblock) {
                        newSel.splice(i, 1); i--; continue;
                    }
                    if (newSel[i].type === 'missile') {
                        newSel.splice(i, 1); i--; continue;
                    }
                }
                this.startPos = this.endPos = null;
                this.select(newSel, sellAdd, sellRemove);
            }
        }
    }

    this.sellC = null;
    this.sellR = 0.0;
    this.sellHover = false;
    this.sellRotHover = false;
    this.sellRotC = null;
    this.sellRotR = 0.0;

    if (this.selected && !this.startPos) {
        var count = 0;
        for (var i=0; i<this.selected.length; i++) {
            var C = this.selected[i];
            var p = C.p();
            if (!p || !C.obj || C.type === 'cc') {
                continue;
            }
            if (!this.sellC) {
                this.sellC = p.clone();
            }
            else {
                this.sellC.x += p.x;
                this.sellC.y += p.y;
            }
            count += 1;
            p = C = null;
        }
        if (this.sellC && count > 0) {
            this.sellC.x /= count;
            this.sellC.y /= count;

            this.sellR = 0.0;
            for (var i=0; i<this.selected.length; i++) {
                var C = this.selected[i];
                var p = C.p();
                if (!p || !C.obj || C.type === 'cc') {
                    continue;
                }
                this.sellR = Math.max(this.sellR, Math.distVec2(this.sellC, p) + C.obj.radius + 1.5);
                count += 1;
                p = C = null;
            }

            var dx = mousePos.x - this.sellC.x, dy = mousePos.y - this.sellC.y;
            var len = Math.sqrt(dx*dx + dy*dy);
            if (len < 0.0001) {
                dx = 1; dy = 0;
            }
            else {
                dx /= len; dy /= len;
            }

            this.sellRotA = Math.atan2(dy, dx);
            this.sellRotC = new b2Vec2(this.sellC.x + dx * this.sellR, this.sellC.y + dy * this.sellR);
            this.sellRotR = 0.75;
            this.sellRotHover = (Math.distVec2(this.sellRotC, mousePos) < this.sellRotR || this.draggingRot) && !this.dragging;
            this.sellHover = (Math.distVec2(this.sellC, mousePos) < this.sellRotR || this.dragging) && !this.draggingRot;

        }
    }

};

BSWG.selection.prototype.deselect = function() {

    if (!this.selected) {
        return;
    }
    for (var i=0; i<this.selected.length; i++) {
        this.selected[i].selected = false;
    }
    this.selected.length = 0;
    this.selected = null;

};

BSWG.selection.prototype.select = function(list, add, remove) {

    if (add && remove) {
        remove = false;
    }

    if (!add && !remove) {
        this.deselect();
    }

    if (list && list.length) {
        if (!this.selected) {
            this.selected = [];
        }
        for (var i=0; i<list.length; i++) {
            list[i].selected = true;
            var found = false;
            for (var j=0; j<this.selected.length; j++) {
                if (this.selected[j] === list[i]) {
                    found = true;
                    if (remove) {
                        this.selected[j].selected = false;
                        this.selected.splice(j, 1);
                    }
                    break;
                }
            }
            if ((!add || !found) && !remove) {
                this.selected.push(list[i]);
            }
        }
    }

};

BSWG.selection.prototype.render = function(ctx, dt) {

    if (!BSWG.game.editMode) {
        return;
    }

    ctx.lineWidth = 2.0;

    if (this.startPos && this.endPos) {
        var p1 = BSWG.render.project3D(this.startPos);
        var p2 = BSWG.render.project3D(this.endPos);
        var w = Math.abs(p2.x - p1.x), h = Math.abs(p2.y - p1.y);
        if (w > 2 && h > 2) {
            var x = Math.min(p1.x, p2.x), y = Math.min(p1.y, p2.y);
            ctx.fillStyle = '#0f0';
            ctx.strokeStyle = ctx.fillStyle;
            ctx.globalAlpha = 0.25;
            ctx.fillRect(x, y, w, h);
            ctx.globalAlpha = 1.0;
            ctx.strokeRect(x, y, w, h);
        }
    }

    ctx.lineWidth = 3.5;

    if (this.sellC && this.sellR) {
        var p = BSWG.render.project3D(this.sellC);
        var p2 = BSWG.render.project3D(new b2Vec2(this.sellC.x+this.sellR, this.sellC.y));
        var p3 = BSWG.render.project3D(new b2Vec2(this.sellC.x+this.sellRotR, this.sellC.y));
        var r = Math.abs(p2.x - p.x);
        var r2 = Math.abs(p3.x - p.x);
        ctx.fillStyle = '#0f0';
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(p.x,p.y,r,0,2*Math.PI);
        ctx.globalAlpha = 0.5;
        ctx.stroke();

        p3 = BSWG.render.project3D(this.sellRotC);
        p2 = BSWG.render.project3D(new b2Vec2(this.sellRotC.x+this.sellRotR, this.sellRotC.y));
        r = Math.abs(p2.x - p3.x);
        
        if (!this.sellHover) {
            ctx.fillStyle = this.draggingRot ? '#08f' : '#0f8';
            ctx.strokeStyle = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(p3.x,p3.y,r*(this.sellRotHover ? 1.0 : 0.5),0,2*Math.PI);
            ctx.globalAlpha = this.sellRotHover ? 0.5 : 0.25;
            ctx.fill();
            ctx.globalAlpha = this.sellRotHover ? 1.0 : 0.5;
            ctx.stroke();
        }

        if (!this.sellRotHover) {
            ctx.fillStyle = this.dragging ? '#08f' : '#0f8';
            ctx.strokeStyle = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(p.x,p.y,r2*(this.sellHover ? 1.0 : 0.5),0,2*Math.PI);
            ctx.globalAlpha = this.sellHover ? 0.5 : 0.25;
            ctx.fill();
            ctx.globalAlpha = this.sellHover ? 1.0 : 0.5;
            ctx.stroke();
        }

        p = p2 = p3 = r = r2 = null;
    }

    ctx.lineWidth = 1.0;

};

BSWG.game = new function(){

    this.initComponents = [
        "hingehalf,size=1,motor=true",
        "hingehalf,size=1,motor=false",
        "hingehalf,size=1,motor=true",
        "hingehalf,size=1,motor=false",
        "spikes,size=1,pike=false",
        "spikes,size=1,pike=true",
        "spikes,size=1,pike=false",
        "spikes,size=1,pike=true",
        "thruster,size=1",
        "thruster,size=1",
        "thruster,size=1",
        "thruster,size=1",
        "thruster,size=1",
        "thruster,size=1",
        "blaster,size=1",
        "blaster,size=1",
        "blaster,size=1",
        "minigun,size=1",
        "block,width=2,height=2,armour=false,triangle=0",
        "block,width=2,height=2,armour=false,triangle=0",
        "block,width=1,height=2,armour=false,triangle=0",
        "block,width=1,height=2,armour=false,triangle=0",
        "block,width=1,height=2,armour=false,triangle=1",
        "block,width=1,height=2,armour=false,triangle=1",
        "block,width=2,height=1,armour=false,triangle=1",
        "block,width=2,height=1,armour=false,triangle=1",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=2,height=2,armour=false,triangle=1",
        "block,width=2,height=2,armour=false,triangle=1",
        "block,width=2,height=2,armour=false,triangle=0",
        "block,width=2,height=2,armour=false,triangle=0",
        "block,width=1,height=2,armour=false,triangle=0",
        "block,width=1,height=2,armour=false,triangle=0",
        "block,width=1,height=2,armour=false,triangle=1",
        "block,width=1,height=2,armour=false,triangle=1",
        "block,width=2,height=1,armour=false,triangle=1",
        "block,width=2,height=1,armour=false,triangle=1",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=1,height=1,armour=false,triangle=0",
        "block,width=2,height=2,armour=false,triangle=1",
        "block,width=2,height=2,armour=false,triangle=1",
        "block,width=2,height=2,armour=false,triangle=0",
        "block,width=2,height=2,armour=false,triangle=0",
        "block,width=1,height=1,armour=false,triangle=1",
        "block,width=1,height=1,armour=false,triangle=1",
        "block,width=1,height=1,armour=false,triangle=1",
        "block,width=1,height=1,armour=false,triangle=1"
    ];

    this.curSong = null;
    this.lastSong = null;
    this.hudBtn = new Array();

    this.initHUD = function (scene) {

        if (scene === BSWG.SCENE_GAME1 || scene === BSWG.SCENE_GAME2 || scene === BSWG.SCENE_TITLE) {

            if (this.hudObj) {
                this.hudObj.remove();
                this.hudObj = null;
            }

            if (this.hudNM) {
                this.hudNM.destroy();
                this.hudNM = null;
            }

            this.hudBtn = new Array();
            var self = this;

            this.hudNM = BSWG.render.proceduralImage(2048, 2048, function(ctx, w, h){

                var H = BSWG.ui_HM(w, h);

                var mmsize = 384;
                var off = scene === BSWG.SCENE_GAME1 ? 0 : mmsize;
                var bsz = 92;
                var sc = bsz/96;
                off *= sc;
                var bfr = 16;

                if (scene !== BSWG.SCENE_TITLE) {

                    H.plate(mmsize*sc-off, h-(bfr*2 + bsz), w-mmsize*sc+off, bfr*2 + bsz, 0.25, 0.5);
                    H.plate(0-off, h-mmsize*sc, mmsize*sc, mmsize*sc, 0.15, 0.5);
                    H.plate(7-off, h-mmsize*sc+7, mmsize*sc-14, mmsize*sc-14, 0.5, 0.15); // 0

                    var hh = bfr*2 + bsz*2+bsz/3;

                    self.hudBottomYT = h-(bfr*2 + bsz);
                    self.hudBottomYT2 = h-(bfr*2 + mmsize);
                    self.hudDlgX1 = mmsize*sc;
                    self.hudDlgX2 = w/2-(bfr+bsz*2);

                    self.tradeWindowPos = [
                        mmsize*sc + bfr,
                        48 + bfr,
                        w - (mmsize*sc + bfr),
                        h - hh - bfr
                    ];
                    self.tradeButtonPos = [
                        w/2-(bfr+bsz*2) - bsz,
                        h-(bsz+bfr*2) - bsz,
                        0, 0
                    ];
                    self.tradeButtonPos[2] = self.tradeButtonPos[0] + bsz;
                    self.tradeButtonPos[3] = self.tradeButtonPos[1] + bsz;

                    if (scene === BSWG.SCENE_GAME1) {
                        H.plate(w/2-(bfr+bsz*2), h-hh, bfr*2+bsz*4, hh, 0.25, 0.5);
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 1
                        H.plate(w/2-(bfr+bsz*2)+bfr, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 2
                        H.plate(w/2-(bfr+bsz*2)+bfr+bsz, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 3
                        H.plate(w/2-(bfr+bsz*2)+bfr+bsz*2, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 4
                        H.plate(w/2-(bfr+bsz*2)+bfr+bsz*3, h-(bsz+bfr), bsz, bsz, 0.5, 0.25); // 5
                    }
                    else {
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 1
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 2
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 3
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 4
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 5
                    }

                    if (scene === BSWG.SCENE_GAME2) {
                        H.plate(w/2-(bsz*2.5), h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 6
                        H.plate(w/2-(bsz*2.5)+bsz, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 7
                        H.plate(w/2-(bsz*2.5)+bsz*2, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 8
                        H.plate(w/2-(bsz*2.5)+bsz*3, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 9
                        H.plate(w/2-(bsz*2.5)+bsz*4, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 10
                    }
                    else {
                        H.plate(w/2+(bfr+bsz*2)+bfr, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 6
                        H.plate(w/2+(bfr+bsz*2)+bfr+bsz, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 7
                        H.plate(w/2+(bfr+bsz*2)+bfr+bsz*2, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 8
                        H.plate(w/2+(bfr+bsz*2)+bfr+bsz*3, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 9
                        H.plate(w/2+(bfr+bsz*2)+bfr+bsz*4, h-bfr-bsz, bsz, bsz, 0.5, 0.35); // 10
                    }

                    if (scene === BSWG.SCENE_GAME1) {
                        H.plate(mmsize*sc+bfr, h-(bsz+bfr), w/2-(bfr+bsz*2)-mmsize*sc-bfr*2, bsz, 0.5, 0.15); // 11
                    }
                    else {
                        H.hudBtn.push([-1000, -1000, 10, 10]);
                    }
                }
                else {
                    for (var i=0; i<12; i++) {
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 0..11
                    }
                    H.plate(0, h-48, w, 48, 0.25, 0.5);
                }

                H.plate(0, 0, w, 48, 0.25, 0.5);
                self.hudTopYT = 48;

                H.plate(w-48, (48-40)/2+1, 42, 40, 0.5, 0.35); // 12

                if (scene === BSWG.SCENE_GAME2) {
                    H.plate(7, (48-40)/2, 128, 42, 0.5, 0.35); // 13
                    H.plate(7+128+7, (48-40)/2, 128, 42, 0.5, 0.35); // 14
                    H.plate(7+128+7+128+7, (48-40)/2, 128, 42, 0.5, 0.35); // 15
                    H.plate(7+128+7+128+7+128+7, (48-40)/2, 384, 42, 0.5, 0.15); // 16
                }
                else if (scene !== BSWG.SCENE_GAME2) {
                    for (var i=0; i<4; i++) {
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 13..16
                    }                    
                }

                if (scene === BSWG.SCENE_GAME1) {
                    H.plate(w/2-(bfr+bsz*2)+bfr, h-hh+bfr, (bfr*2+bsz*4)-bfr*2, bsz/3, 0.5, 0.25); // 17 (xp meter)
                    var emH = bsz/3;
                    var sz2 = ((bfr*2+bsz*4)-bfr*2) / 3;
                    H.plate(w/2-(bfr+bsz*2)+bfr, h-hh+bfr+bsz/3+2+bsz/3, sz2, bsz*(2/3)-bfr/2, 0.5, 0.25); // 18 (stats button: bosses beaten, zones discovered, etc)
                    H.plate(w/2-(bfr+bsz*2)+bfr+sz2, h-hh+bfr+bsz/3+2+bsz/3, sz2, bsz*(2/3)-bfr/2, 0.5, 0.25); // 19 (specials button)
                    H.plate(w/2-(bfr+bsz*2)+bfr+sz2*2, h-hh+bfr+bsz/3+2+bsz/3, sz2, bsz*(2/3)-bfr/2, 0.5, 0.25); // 20 (level up/points tree)
                    H.plate(w/2-(bfr+bsz*2)+bfr, h-hh+bfr+1+bsz/3, (bfr*2+bsz*4)-bfr*2, bsz/3, 0.5, 0.25); // 21 (energy meter)
                }
                else {
                    for (var i=0; i<5; i++) {
                        H.hudBtn.push([-1000, -1000, 10, 10]); // 17..21
                    }                   
                }

                BSWG.render.heightMapToNormalMap(H.H, ctx, w, h);

                self.hudBtn = H.hudBtn;
                self.hudHM = H;
                self.hudHM.hx = self.hudX;
                self.hudHM.hy = self.hudY;

            });

            this.hudObj = new BSWG.uiPlate3D(
                this.hudNM,
                this.hudHM,
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
        //this.curSong = new BSWG.song(3, bpm, 0.0, settings);
        //this.curSong.start();
        //this.curSong.setVolume(vol || 0.25, fadeIn || 3.0);
    };
    this.setSongCache = function(song, vol, fadeIn) {
        if (this.curSong) {
            this.curSong.fadeOutStop(1.0);
        }
        this.curSong = song;
        //this.curSong.start();
        //this.curSong.setVolume(vol || 0.25, fadeIn || 3.0);
    };
    this.repeatSong = function() {
        if (this.curSong) {
            //this.curSong.start();
        }
    };

    this.stopMusic = function(t) {
        if (this.curSong) {
            //this.curSong.fadeOutStop(t||1.0);
        }
        this.curSong = null;
    };

    this.test = function ()
    {
        console.log('a');
    };

    this.scene = null;
    this.switchScene = null;

    this.buttonBinds = {};

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

    this.spawnCount = 0;

    this.spawnEnemies = function (list, boss) {

        if (boss && BSWG.componentList.allCCs().length > 1) {
            return;
        }

        if (this.scene !== BSWG.SCENE_TITLE && (!this.ccblock || this.ccblock.destroyed)) {
            return;
        }

        var p = this.scene !== BSWG.SCENE_TITLE ? this.ccblock.obj.body.GetWorldCenter().clone() : new b2Vec2(0, 0);
        var arange = Math.PI / 4;
        var minr = 40.0, maxr = 67.5;

        if (boss) {
            minr *= 1.5;
            maxr *= 1.5;
        }

        if (this.scene === BSWG.SCENE_TITLE) {
            minr = maxr = 0;
        }
        var v = this.scene !== BSWG.SCENE_TITLE ? this.ccblock.obj.body.GetLinearVelocity().clone() : new b2Vec2(0, 0);
        var a = Math.atan2(v.y, v.x);

        var self = this;

        this.spawnCount += list.length;

        for (var _i=0; _i<list.length; _i++) {
            window.setTimeout(function(i){
                return function () {
                    self.spawnCount -= 1;
                    if (BSWG.componentList.allCCs().length >= BSWG.maxCCs) {
                        return;
                    }
                    var aiship = null;
                    var k = 32;
                    while (!aiship && (k--) > 0) {

                        var ta = Math.random() * 2 - 1;
                        var tr = Math.random();
                        var p2 = new b2Vec2(
                            p.x + Math.cos(a + arange * ta) * ((maxr-minr)*tr + minr),
                            p.y + Math.sin(a + arange * ta) * ((maxr-minr)*tr + minr)
                        );

                        if (self.map && self.map.getZone(p2) !== self.inZone) {
                            continue;
                        }

                        if (self.scene === BSWG.SCENE_TITLE) {
                            var _a = (i/1) * Math.PI;
                            p2 = new b2Vec2(Math.cos(_a) * 32, Math.sin(_a) * 32);
                        }

                        aiship = BSWG.componentList.load(list[i][0], {p: p2});
                        if (aiship) {
                            aiship.enemyLevel = list[i][1];
                            aiship.title = list[i][0].title;
                            window.setTimeout(function(ais){
                                return function() {
                                    ais.reloadAI();
                                };
                            }(aiship), 111);
                        }
                    }
                };
            }(_i), 67*_i);
        }

    };

    var wheelStart = 0;

    this.lastSave = -1000;

    this.saveGame = function () {

        if (this.scene === BSWG.SCENE_GAME1 && window.localStorage && this.ccblock && !this.ccblock.destroyed) {

            // SAVE

            var obj = new Object();
            obj.map = this.map.serialize();
            obj.comp = BSWG.componentList.serialize(BSWG.game.ccblock, false, null, true);
            obj.xpInfo = this.xpInfo.serialize();
            obj.specials = BSWG.specialList.serialize();
            obj.buttonBinds = this.buttonBinds;

            localStorage.game_save = JSON.stringify(obj);

            this.lastSave = Date.timeStamp();

            this.berrorMsg('Game saved.');

        }

    };

    this.dialogObj = null;
    this.dialogBtnHighlight = null;

    this.linearDialog = function (desc, anchor) {

        BSWG.input.EAT_ALL();

        var self = this;

        this.dialogPause = !!anchor;

        var desc2 = {};

        for (var i=0; i<desc.text.length; i++) {
            var text = desc.text[i];
            var obj = null;
            if (typeof text === 'object') {
                obj = text;
            }
            if (obj) {
                text = obj.text;
                if (i === 0) {
                    this.dialogBtnHighlight = obj.btnHighlight || null;
                }
            }
            desc2[i] = {
                who: desc.who,
                text: text,
                friend: !!desc.friend,
                buttons: [
                    {
                        text: 'Ok',
                        click: function (idx, ob) {
                            return function (fns) {
                                if ((idx+1) < desc.text.length) {
                                    self.dialogBtnHighlight = desc.text[idx+1].btnHighlight || null;
                                    fns.change(idx+1);
                                }
                                else {
                                    fns.close();
                                    self.dialogPause = false;
                                    self.dialogBtnHighlight = null;
                                }
                            };
                        }(i, obj)
                    }
                ]
            }
        }

        this.openDialog(desc2, 0);

    };

    this.openDialog = function (desc, start) {

        if (!this.dialogObj) {
            return;
        }

        this.closeDialog();
        var tdesc = desc[start];

        var title = tdesc.who < 0 ? 'Mom' : ((tdesc.friend ? 'Clerk ' : '') + 'Zef #' + (tdesc.who+1));
        var buttons = new Array(tdesc.buttons.length);

        var self = this;
        var fns = new Object();
        fns.current = start;
        fns.desc = desc;
        fns.change = function(name) {
            if (self.dialogObj.textFinished) {
                self.openDialog(this.desc, name);
            }
            else {
                self.dialogObj.skipText();
            }
        };
        fns.close = function () {
            if (self.dialogObj.textFinished) {
                self.closeDialog();
            }
            else {
                self.dialogObj.skipText();
            }
        };

        for (var i=0; i<tdesc.buttons.length; i++) {
            var click = tdesc.buttons[i].click;
            tdesc.buttons[i].click = null;
            buttons[i] = deepcopy(tdesc.buttons[i]);
            tdesc.buttons[i].click = click;
            buttons[i].click = function(cbk) {
                return function() {
                    if (cbk) {
                        cbk(fns);
                    }
                }
            }(click);
        }
        
        this.dialogObj.init({
            portrait: tdesc.who,
            title: title,
            friend: tdesc.friend || false,
            modal: true,//tdesc.modal || false,
            text: tdesc.text,
            buttons: buttons
        });

        this.dialogObj.show();

    };

    this.closeDialog = function () {

        if (!this.dialogObj) {
            return;
        }
        this.dialogObj.hide();

    };

    this.pushMode = function (mode) {

        this.removeMode(mode);
        this.modeHistory.push(mode);

    };

    this.removeMode = function (mode) {

        for (var i=0; i<this.modeHistory.length; i++) {
            if (this.modeHistory[i] === mode) {
                this.modeHistory.splice(i, 1);
                break;
            }
        }

    };

    this.popMode = function () {

        if (!this.modeHistory.length) {
            return null;
        }

        var ret = this.modeHistory[this.modeHistory.length-1];
        this.modeHistory.splice(this.modeHistory.length-1, 1);
        return ret;

    };

    this.berrorMsg = function (text) {
        this.beMsg = text || null;
        this.beMsgTime = Date.timeStamp();
    };

    this.initScene = function (scene, args)
    {
        // Init game state

        args = args || {};
        this.scene = scene;

        if (this.dialogObj) {
            this.dialogObj.remove();
            this.dialogObj = null;
        }

        this.spawnCount = 0;
        this.xpInfo = null;

        this.cam = new BSWG.camera();

        this._mmMinx = null;
        this._mmMaxx = null;
        this._mmMiny = null;
        this._mmMaxy = null;

        this.buttonBinds = {
            'build': BSWG.KEY.B,
            'power': BSWG.KEY.P,
            'store': BSWG.KEY.V,
            'anchor': BSWG.KEY.N,
            'controls': BSWG.KEY.M,
            'trade': BSWG.KEY.H,
            'points': BSWG.KEY.J,
            'specials': BSWG.KEY.TICK,
            'special1': BSWG.KEY[1],
            'special2': BSWG.KEY[2],
            'special3': BSWG.KEY[3],
            'special4': BSWG.KEY[4],
            'escmenu': BSWG.KEY.F1
        }

        BSWG.render.envMap = BSWG.render.envMap2 = BSWG.render.images['env-map-1'];

        if (scene === BSWG.SCENE_TITLE) {
            BSWG.render.envMap = BSWG.render.envMap2 = BSWG.render.images['env-map-2'];
            BSWG.render.cloudColor.set(1.0, 0, 0, 1.0);
            BSWG.cloudMap.noClouds = false;
            BSWG.cloudMap.cloudZOffset = 5;
        }
        else if (scene === BSWG.SCENE_GAME2) {
            BSWG.render.envMap = BSWG.render.envMap2 = BSWG.render.images['env-map-4'];
            BSWG.render.cloudColor.set(0.0, 0.1, 1.0, 1.0);
            BSWG.cloudMap.noClouds = false;
            BSWG.cloudMap.cloudZOffset = 5;
        }
        else {
            BSWG.render.envMap = BSWG.render.images['env-map-1'];
            BSWG.render.envMap2 = BSWG.render.images['env-map-4'];
            BSWG.render.cloudColor.set(0.95, 0.95, 1.0, 1.0);
            BSWG.cloudMap.noClouds = false;
            BSWG.cloudMap.cloudZOffset = 5;
        }

        this.dialogPause = false;
        
        BSWG.specProjList.clear();
        BSWG.render.clearScene();
        BSWG.jpointRenderer.readd();
        BSWG.physics.reset();
        BSWG.componentList.clear();
        BSWG.componentList.clearStatic();
        BSWG.blasterList.clear();
        BSWG.laserList.clear();
        BSWG.planets.init();
        BSWG.ui.clear();
        BSWG.ai.init();
        BSWG.xpDisplay.clear();
        BSWG.render.weather.clear();
        BSWG.exaustList.init();
        BSWG.orbList.init();
        BSWG.specialList.init();
        BSWG.cloudMap.init();
        this.selection = new BSWG.selection();

        this.modeHistory = [];
        this.minimapZoom = true;
        
        this.aiBtn = null;
        this.beMsg = null;

        this.removeHUD();

        this.map = null;
        this.mapImage = null;
        this.ccblock = null;
        this.cam = new BSWG.camera();
        BSWG.render.updateCam3D(this.cam);
        this.editMode = false;
        this.unlockMode = false;
        this.specialMode = false;
        this.storeMode = false;
        this.tradeMode = false;
        this.showControls = false;
        this.powerMode = false;
        this.modeBtns = null;
        this.specBtns = null;
        this.needsSave = true;
        this.saveAt = null;
        this.lastSave = Date.timeStamp() - 6.0;

        if (this.tileMap) {
            this.tileMap.destroy();
        }
        this.tileMap = null;

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
            //this.stars = new BSWG.starfield();
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

                this.cam.z *= 1.0;

                Math.seedrandom();

                this.titleSpawn = false;

                if (this.title1) {
                    this.title1.add();
                    this.title2.add();
                    this.newGameBtn.add();
                    this.loadGameBtn.add();
                    this.sandBoxBtn.add();
                    this.loadGameBtn.color = localStorage.game_save ? [0.35, 0.6, 1., 1.0] : [0.35*0.5, 0.6*0.5, 1.*0.5, 1.0];
                    this.loadGameBtn.hoverColor = localStorage.game_save ? [0.95, 0.95, 0.95, 1.0] : [0.3, 0.3, 0.3, 1.0];
                }
                else {
                    var yoff = 42/(BSWG.render.viewport.h/1080);
                    this.title1 = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 80+42+yoff,
                        w: 800, h: 100,
                        vpXCenter: true,
                        text: "BlockShip Wars",
                        color: [1, 1, 1, 1],
                        hoverColor: [1, 1, 1, 1],
                        noDestroy: true,
                        click: function (me) {
                        }
                    });
                    this.title2 = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 145+42+yoff,
                        w: 800, h: 100,
                        vpXCenter: true,
                        text: "r o g u e l i k e",
                        color: [1, 0.2, 0.2, 1.0],
                        hoverColor: [1, 0.2, 0.2, 1.0],
                        noDestroy: true,
                        click: function (me) {
                        }
                    });

                    this.newGameBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 350+yoff,
                        w: 400, h: 70,
                        vpXCenter: true,
                        text: "New Game",
                        color: [0.35, 0.6, 1., 1.0],
                        hoverColor: [0.95, 0.95, 0.95, 1.0],
                        noDestroy: true,
                        click: function (me) {
                            self.changeScene(BSWG.SCENE_GAME1, {}, '#000');
                        }
                    });
                    this.loadGameBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 350+70+yoff,
                        w: 400, h: 70,
                        vpXCenter: true,
                        text: "Load Game",
                        color: localStorage.game_save ? [0.35, 0.6, 1., 1.0] : [0.35*0.5, 0.6*0.5, 1.*0.5, 1.0],
                        hoverColor: localStorage.game_save ? [0.95, 0.95, 0.95, 1.0] : [0.3, 0.3, 0.3, 1.0],
                        noDestroy: true,
                        click: function (me) {
                            if (localStorage.game_save) {
                                self.changeScene(BSWG.SCENE_GAME1, {load: JSON.parse(localStorage.game_save)}, '#000', 0.75);
                            }
                        }
                    });
                    this.sandBoxBtn = new BSWG.uiControl(BSWG.control_3DTextButton, {
                        x: BSWG.render.viewport.w*0.5, y: 350+140+yoff,
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
                    //BSWG.planets.add({pos: pos, type: t});
                }
                this.curPanPos = 0;
                this.panPosTime = this.panPosStartTime = 20.0;

                var sx = Math.floor(Math.random()*256),
                    sy = Math.floor(Math.random()*256);

                var desc = {
                    /*'tileset-mountain': {
                        map: function(x,y) {
                            return BSWG.mapPerlinSparse(x+100,y+414);
                        },
                        color: [1.0, 1.0, 1.0]
                    },*/
                    'city-tiles': {
                        decals: BSWG.makeCityTiles(1),
                        normalMap: BSWG.render.images['test_nm'].texture,
                        normalMapScale: 24.0,
                        normalMapAmp: 5.0,
                        map: function(x, y) {
                            if (!BSWG.mapPerlinSparse(x+100+sx,y+414+sy) &&
                                BSWG.mapPerlinSparse(x-100+sx,y-414+sy)) {
                                return ~~(Math.random2d(x, y) * 9) + 1;
                            }
                            else {
                                return 0;
                            }
                        },
                        color: [0.5, 0.5, 1.5],
                        flashColor: [1.1, 1.1, 1.5],
                        reflect: 0.75
                    },
                    'tileset-mountain': {
                        map: function(x,y) {
                            return BSWG.mapPerlin(x+sx, y+sy);
                        },
                        normalMap: BSWG.render.images['rock_nm'].texture,
                        color: [0.5, 0.0, 0.0],
                        reflect: 0.0,
                        normalMapAmp: 1.0,
                        normalMapScale: 1.0
                    },
                    'tileset-below': {
                        map: function(x,y) {
                            return true
                        },
                        color: [0.6, 0.0, 0.0],
                        normalMap: BSWG.render.images['rock_nm'].texture,
                        normalMapAmp: 0.75,
                        normalMapScale: 0.5,
                        isBelow: true
                    },
                    'water': {
                        color: [0.05, 0, 0, 0.95],
                        map: function(x,y) {
                            return true;
                        },
                        level: 0.15,
                        normalMapScale: 0.5,
                        isWater: true
                    }
                };
                this.tileMap = new BSWG.tileMap(desc, -8);
                BSWG.render.weather.transition({
                    density:        1,
                    size:           0.15,
                    color:          new THREE.Vector4(1, 1, 0, .6),
                    speed:          0.1,
                    lightning:      new THREE.Vector4(1, 1, 1, 1),
                    lightningFreq:  0.01,
                    wet:            0.25,
                    tint:           new THREE.Vector4(1, 0, 0, .125),
                    swirl:          5.0,
                    dark:           0.5
                }, 5);

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

                if (args.load) {
                    this.map = BSWG.genMap(args.load.map);
                    this.tileMap = new BSWG.tileMap(this.map.tm_desc, -8);
                    for (var i=0; i<this.initComponents.length; i++) {
                        this.map.updateMinLevelComp(BSWG.componentList.fixKey(this.initComponents[i]), 0);
                    }
                    this.xpInfo = new BSWG.playerStats(args.load.xpInfo);
                    this.ccblock = BSWG.componentList.load(args.load.comp, null, null, null, null, true);
                    this.buttonBinds = {} || this.buttonBinds;
                    var tmp = args.load.buttonBinds;
                    for (var key in tmp) {
                        this.buttonBinds[key] = tmp[key];
                    }
                    var p = this.ccblock.obj.body.GetWorldCenter();
                    this.cam.x = p.x;
                    this.cam.y = p.y;
                    BSWG.specialList.load(args.load.specials || null);
                    this.noDefault = true;
                }
                else {
                    Math.seedrandom();
                    this.noDefault = false;
                    this.map = BSWG.genMap(145, 5*5, 8);
                    this.tileMap = new BSWG.tileMap(this.map.tm_desc, -8);
                    this.xpInfo = new BSWG.playerStats();
                    startPos = this.map.planets[0].worldP.clone();
                }
                for (var i=0; i<this.initComponents.length; i++) {
                    this.map.updateMinLevelComp(BSWG.componentList.fixKey(this.initComponents[i]), 0);
                }
                BSWG.xpDisplay.xpInfo = this.xpInfo;
                this.mapImage = this.tileMap.minimap.image;
                this.tileMap.addCollision(0, 0, this.map.size, this.map.size);
                for (var i=0; i<this.map.zones.length; i++) {
                    var zone = this.map.zones[i];
                    zone.orb = new BSWG.orb(new b2Vec2(zone.p.x * this.map.gridSize, zone.p.y * this.map.gridSize), zone);
                }

            case BSWG.SCENE_GAME2:

                if (scene === BSWG.SCENE_GAME2) {
                    this.noDefault = false;
                }
                this.editBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['build-mode'],
                    selected: this.editMode,
                    userKeyBind: 'build',
                    click: function (me) {
                        me.selected = !me.selected;
                        self.editMode = me.selected;
                        if (self.editMode) {
                            self.showControls = false;
                            self.showControlsBtn.selected = false;
                            self.pushMode('edit');
                        }
                        else {
                            self.removeMode('edit');
                        }
                    }
                });
                this.anchorBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 65 + 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['anchor'],
                    selected: false,
                    userKeyBind: 'anchor',
                    click: function (me) {
                        if (self.ccblock) {
                            self.ccblock.anchored = !self.ccblock.anchored;
                            me.selected = self.ccblock.anchored;
                            if (self.ccblock.anchored) {
                                self.pushMode('anchor');
                            }
                            else {
                                self.removeMode('anchor');
                            }
                        }
                    }
                });
                this.showControlsBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 65 + 10 + 65 + 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['show-controls'],
                    selected: this.showControls,
                    userKeyBind: 'controls',
                    click: function (me) {
                        me.selected = !me.selected;
                        self.showControls = me.selected;
                        if (self.showControls) {
                            self.editMode = false;
                            self.editBtn.selected = false;
                            self.pushMode('controls');
                        }
                        else {
                            self.removeMode('controls');
                        }
                    }
                });
                this.powerBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10 + 65 + 10 + 65 + 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['power'],
                    selected: this.powerMode,
                    userKeyBind: 'power',
                    click: function (me) {
                        me.selected = !me.selected;
                        self.powerMode = me.selected;
                        if (self.showControls) {
                            self.pushMode('power');
                        }
                        else {
                            self.removeMode('power');
                        }
                    }
                });
                if (scene === BSWG.SCENE_GAME1) {
                    this.storeBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: 10,
                        w: 65, h: 65,
                        text: BSWG.render.images['store-mode'],
                        selected: this.storeMode,
                        userKeyBind: 'store',
                        click: function (me) {
                            me.selected = !me.selected;
                            self.storeMode = me.selected;
                            if (self.storeMode && self.tradeMode) {
                                self.tradeMode = false;
                                self.tradeBtn.selected = false;
                                if (self.tradeWin) {
                                    self.tradeWin.reset();
                                }
                            }
                            if (self.storeMode) {
                                self.pushMode('store');
                            }
                            else {
                                self.removeMode('store');
                            }
                        }
                    });
                    this.tradeBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: 10,
                        w: 64, h: 65,
                        text: '',
                        selected: this.tradeMode,
                        userKeyBind: 'trade',
                        click: function (me) {
                            if (self.bossFight || self.dialogPause) {
                                me.selected = false;
                            }
                            else {
                                me.selected = !me.selected;
                            }
                            self.tradeMode = me.selected;
                            if (self.tradeMode) {
                                self.storeBtn.selected = self.storeMode = false;
                                if (self.tradeWin) {
                                    self.tradeWin.reset();
                                }
                            }
                            if (self.tradeMode) {
                                self.pushMode('trade');
                            }
                            else {
                                self.removeMode('trade');
                            }
                        }
                    });
                    this.statsBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: 10,
                        w: 65, h: 65,
                        text: 'Stats',
                        click: function (me) {
                        }
                    });
                    this.specialsBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: 10,
                        w: 65, h: 65,
                        text: 'Specials',
                        selected: self.specialMode,
                        userKeyBind: 'specials',
                        click: function (me) {
                            self.specialMode = !self.specialMode;
                            me.selected = self.specialMode;
                            if (self.specialMode) {
                                self.unlockMode = false;
                                self.levelUpBtn.selected = false;
                                self.removeMode('unlock');
                                self.pushMode('specials');
                            }
                            else {
                                self.removeMode('specials');
                            }
                        }
                    });
                    this.levelUpBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: 10,
                        w: 65, h: 65,
                        text: 'Points',
                        selected: self.unlockMode,
                        userKeyBind: 'points',
                        click: function (me) {
                            self.unlockMode = !self.unlockMode;
                            me.selected = self.unlockMode;
                            if (self.unlockMode) {
                                self.specialMode = false;
                                self.specialsBtn.selected = false;
                                self.removeMode('specials');
                                self.pushMode('unlock');
                            }
                            else {
                                self.removeMode('unlock');
                            }                            
                        }
                    });
                }
                else {
                    this.storeBtn = null;
                    this.statsBtn = null;
                    this.specialsBtn = null;
                    this.levelUpBtn = null;
                    this.tradeBtn = null;
                }

                /*this.healBtn = new BSWG.uiControl(BSWG.control_Button, {
                    x: 10, y: 10,
                    w: 65, h: 65,
                    text: BSWG.render.images['repair'],
                    selected: false,
                    click: function (me) {
                    }
                });*/

                if (scene === BSWG.SCENE_GAME1 || scene === BSWG.SCENE_GAME2) {
                    this.compPal = new BSWG.uiControl(BSWG.control_CompPalette, {
                        x: 2048, y: 70,
                        w: 128 * 3,
                        h: 650,
                        clickInner: function (me, B) {
                            var vr = 2;
                            for (var k=1000; k>=0; k--) {
                                var p = self.ccblock.obj.body.GetWorldCenter();
                                var a = Math.random() * Math.PI * 2.0;
                                var r = 3 + Math.pow(Math.random(), 2.0) * vr;
                                p = new b2Vec2(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
                                var any = false;
                                for (var i=0; i<BSWG.componentList.compList.length && !any; i++) {
                                    var C = BSWG.componentList.compList[i];
                                    if (BSWG.physics.bodyDistancePoint(C.obj.body, p, 3.5) <= 0.0) {
                                        any = true;
                                    }
                                }
                                if (any) {
                                    vr += 0.1;
                                    p = null;
                                    continue;
                                }
                                var args = {};
                                for (var key in B.args) {
                                    if (key !== 'title' && key !== 'count') {
                                        args[key] = B.args[key];
                                    }
                                }
                                args.pos = p;
                                args.angle = Math.random()*Math.PI*2.0;
                                var comp = new BSWG.component(B.comp, args);
                                if (self.scene === BSWG.SCENE_GAME1) {
                                    self.xpInfo.addStore(comp, -1);
                                    new BSWG.soundSample().play('store-2', p.THREE(0.2), 0.85, 0.45);
                                }
                                p = null;
                                comp = null;
                                break;
                            }
                        }
                    });
                }

                if (scene === BSWG.SCENE_GAME1) {
                    this.unlockMenu = new BSWG.uiControl(BSWG.control_UnlockTree, {
                        x: 3000, y: -2000,
                        w: 128 * 3,
                        h: 650
                    });
                }

                if (scene === BSWG.SCENE_GAME1) {
                    if (!this.tradeWindowPos) {
                        this.tradeWindowPos = [];
                    }
                    this.tradeWin = new BSWG.uiControl(BSWG.control_TradeWindow, {
                        x: this.hudX(this.tradeWindowPos[0] || 0), y: BSWG.render.viewport.y+1,
                        w: this.hudX(this.tradeWindowPos[2] || 1024) - this.hudX(this.tradeWindowPos[0] || 0),
                        h: this.hudY(this.tradeWindowPos[3] || 512) - this.hudY(this.tradeWindowPos[1] || 0)
                    });                    
                }

                if (scene === BSWG.SCENE_GAME2) {
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

                        self.dragStart = null;

                        var backup = BSWG.componentList.serialize(null, true);

                        try {
                            self.ccblock = null;
                            self.exportFN = data.filename;
                            var obj = JSON.parse(data.data);
                            if (self.tileMap) {
                                self.tileMap.clear();
                            }
                            BSWG.componentList.clear();
                            self.ccblock = BSWG.componentList.load(obj);
                            if (!self.ccblock) {
                                throw "no cc";
                            }
                            var p = self.ccblock.obj.body.GetWorldCenter();
                            self.cam.x = p.x;
                            self.cam.y = p.y;
                        } catch (err) {
                            if (self.tileMap) {
                                self.tileMap.clear();
                            }
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
                            BSWG.ai.aiTestLevel = 0;
                            BSWG.ai.playerTestLevel = 0;
                            try {
                                self.ccblock = null;
                                self.tileMap.clear();
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
                                self.battleMode = true;
                            } catch (err) {
                                console.log(err, err.stack);
                                self.tileMap.clear();
                                BSWG.componentList.clear();
                                self.ccblock = BSWG.componentList.load(backup);
                            }
                        }
                        else {
                            self.tileMap.clear();
                            BSWG.componentList.clear();
                            BSWG.blasterList.clear();
                            BSWG.laserList.clear();
                            self.ccblock = BSWG.componentList.load(this.backup);
                            self.aiship = null;
                            self.battleMode = false;
                            BSWG.ai.aiTestLevel = 0;
                            BSWG.ai.playerTestLevel = 0;
                            //window.gc();
                        }

                    };
                }

                if (self.scene === BSWG.SCENE_GAME2) {
                    this.saveBtn = new BSWG.uiControl(BSWG.control_Button, {
                        x: 10 + 65 + 10 + 65 + 10, y: 10,
                        w: 65, h: 65,
                        text: self.scene === BSWG.SCENE_GAME1 ? BSWG.render.images['save'] : 'Export',
                        selected: false,
                        click: function (me) {
                            if (self.scene === BSWG.SCENE_GAME2) {
                                setExportFN();
                                JSON.saveAs(
                                    BSWG.componentList.serialize(null, true),
                                    self.exportFN
                                );
                            }
                            else {
                                if (!self.battleMode && self.saveHealAdded) {
                                    self.saveGame();
                                }
                            }
                        }
                    });
                }

                this.specBtns = [];
                for (var i=0; i<4; i++) {
                    this.specBtns.push(
                        new BSWG.uiControl(BSWG.control_Button, {
                            x: 10 + 65 + 10 + 65 + 10, y: 10,
                            w: 65, h: 65,
                            text: function(idx){
                                return function(ctx, x, y, w, h, hover) {
                                    if (self.ccblock) {
                                        var key = self.ccblock.equippedSpecialNo(idx);
                                        if (key) {
                                            var scale = Math.min(w, h) * 0.95;
                                            BSWG.renderSpecialIcon(ctx, key, x+w/2, y+h/2, scale, 0.0 + ((hover && self.ccblock.canUseSpecial(key)) || BSWG.specialList.curCont() === key ? BSWG.render.time : 0.0), self.ccblock);
                                            ctx.fillStyle = self.ccblock.canUseSpecial(key) ? '#99f' : '#45458f';
                                            ctx.strokeStyle = '#000';
                                            ctx.font = '12px Orbitron';
                                            ctx.textAlign = 'right';
                                            ctx.fillTextB(BSWG.specialsInfo[key].energy + '', x+w-7, y+h-7);
                                            ctx.textAlign = 'left';
                                        }
                                    }
                                };
                            }(i),
                            selected: false,
                            userKeyBind: 'special' + (i+1),
                            click: function (me) {
                                if (self.ccblock && !self.ccblock.destroyed) {
                                    var idx = me._idx;
                                    var key = self.ccblock.equippedSpecialNo(idx);
                                    if (BSWG.specialList.contActive(self.curSpecial)) {
                                        self.curSpecial.destroy();
                                        self.curSpecial = null;
                                    }
                                    else if (key) {
                                        self.curSpecial = BSWG.startSpecial(key, self.ccblock, me);
                                    }
                                }
                            }
                        })
                    );
                    this.specBtns[this.specBtns.length-1]._idx = i;
                    this.specBtns[this.specBtns.length-1]._added = true;
                }

                this.modeBtns = {
                    'edit': this.editBtn,
                    'anchor': this.anchorBtn,
                    'controls': this.showControlsBtn,
                    'power': this.powerBtn,
                    'store': this.storeBtn,
                    'trade': this.tradeBtn,
                    'unlock': this.levelUpBtn,
                    'specials': this.specialsBtn
                };

                this.saveHealAdded = false;

                if (!this.noDefault) {

                    if (scene === BSWG.SCENE_GAME2) {
                        var desc = {
                            'city-tiles': {
                                decals: BSWG.makeCityTiles(1),
                                normalMap: BSWG.render.images['test_nm'].texture,
                                normalMapScale: 24.0,
                                normalMapAmp: 1.0,
                                map: function(x, y) {
                                    if (!BSWG.mapPerlinSparse(x+100,y+414) &&
                                        BSWG.mapPerlinSparse(x-100,y-414)) {
                                        return ~~(Math.random2d(x, y) * 9) + 1;
                                    }
                                    else {
                                        return 0;
                                    }
                                },
                                color: [1.5, 0.5, 0.5],
                                flashColor: [1.5, 1.1, 1.0],
                                reflect: 0.75
                            },
                            'tileset-mountain': {
                                map: BSWG.mapPerlinSparse,
                                normalMap: BSWG.render.images['rock_nm'].texture,
                                color: [0.0, 0.05, 0.2],
                                reflect: 0.0,
                                normalMapAmp: 1.0,
                                normalMapScale: 1.0
                            },
                            'tileset-below': {
                                map: function(x,y) {
                                    return true
                                },
                                color: [0.0, 0.1, 0.3],
                                normalMap: BSWG.render.images['rock_nm'].texture,
                                normalMapAmp: 0.75,
                                normalMapScale: 0.5,
                                isBelow: true
                            },
                            'water': {
                                color: [0, 0, 0, 0.65],
                                map: function(x,y) {
                                    return true;
                                },
                                level: 0.15,
                                normalMapScale: 0.5,
                                isWater: true
                            }
                        };
                        this.tileMap = new BSWG.tileMap(desc, -10);
                        //this.tileMap.addCollision(-14, -14, 28, 28);

                        BSWG.render.weather.transition({
                            density:        1,
                            size:           0.15,
                            color:          new THREE.Vector4(.5, .5, .1, .6),
                            speed:          0.05,
                            lightning:      new THREE.Vector4(1, 1, 1, 1),
                            lightningFreq:  0.001,
                            wet:            0.175,
                            tint:           new THREE.Vector4(0, 0, 1, .125),
                            swirl:          5.0,
                            dark:           0.0
                        }, 5);
                    }

                    if (this.xpInfo) {
                        for (var i=0; i<this.initComponents.length; i++) {
                            this.xpInfo.addStoreKey(BSWG.componentList.fixKey(this.initComponents[i]), 1);
                        }
                    }

                    this.ccblock = new BSWG.component(BSWG.component_CommandCenter, {

                        pos: startPos.clone(),
                        angle: -Math.PI/3.5

                    });

                    self.cam.x = startPos.x;
                    self.cam.y = startPos.y;
                }

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
            userKeyBind: 'escmenu',
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
                            var fs = !win.isFullscreen;
                            win.toggleFullscreen();
                            BSWG.options.fullscreen = fs;
                            BSWG.saveOptions();
                        }
                    }),
                    new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: -1000,
                        w: 250, h: 32,
                        text: 'VSync ' + (!BSWG.options.vsync ? ' Off' : 'On'),
                        selected: false,
                        click: function (me) {
                            BSWG.options.vsync = !BSWG.options.vsync;
                            BSWG.saveOptions();
                            me.text = 'VSync ' + (!BSWG.options.vsync ? ' Off' : 'On');
                        }
                    }),
                    new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: -1000,
                        w: 250, h: 32,
                        text: 'Shadows ' + (!BSWG.options.shadows ? ' Off' : 'On'),
                        selected: false,
                        click: function (me) {
                            BSWG.options.shadows = !BSWG.options.shadows;
                            BSWG.saveOptions();
                            me.text = 'Shadows ' + (!BSWG.options.shadows ? ' Off' : 'On');
                        }
                    }),
                    new BSWG.uiControl(BSWG.control_Button, {
                        x: 10, y: -1000,
                        w: 250, h: 32,
                        text: 'Post FX ' + (!BSWG.options.postProc ? ' Off' : 'On'),
                        selected: false,
                        click: function (me) {
                            BSWG.options.postProc = !BSWG.options.postProc;
                            BSWG.saveOptions();
                            me.text = 'Post FX ' + (!BSWG.options.postProc ? ' Off' : 'On');
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
                                if (self.saveHealAdded && self.scene === BSWG.SCENE_GAME1) {
                                    self.saveGame();
                                }
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

        if (scene === BSWG.SCENE_GAME1 || scene === BSWG.SCENE_GAME2) {
            this.dialogObj = new BSWG.uiControl(BSWG.control_Dialogue, {
                x: -1000, y: -1000,
                w: 600, h: 300
            });
        }

        BSWG.render.resetl60();
        window.gc();

    };

    this.shipTest = null;
    this.emodeTint = 0.0;
    this.bmodeTint = 0.0;
    this.lastGC = Date.timeStamp();
    this.musicBPM = 60.0;
    this.lastNote = 0.0;
    this.noteIndex = 0;

    this.start = function ()
    {
        var self = this;

        var grabbedBlock = null;
        var grabbedLocal = null;
        var grabbedRot = false;

        BSWG.render.setCustomCursor(true);
        BSWG.input.emulateMouseWheel([BSWG.KEY['-'], BSWG.KEY['NUMPAD -']], [BSWG.KEY['='], BSWG.KEY['NUMPAD +']], 2);

        BSWG.render.startRenderer(function(dt, time){

            if (self.inZone && self.inZone.bossDefeated) {
                self.inZone.safe = true;
            }

            if (self.scene === BSWG.SCENE_GAME1 && !(self.map.introNext > self.map.areaNo)) {
                self.map.introNext = self.map.areaNo + 1;
                self.linearDialog(BSWG.enemySettings[self.map.areaNo].intro, true);
            }

            // hacked together real time music generator
            self.musicBPM = (self.scene === BSWG.SCENE_TITLE || self.battleMode) ? 30 : 15;
            //if (self.bossFight) {
                //self.musicBPM = ~~(self.musicBPM * 1.5);
            //}
            var musicHappy = (self.scene === BSWG.SCENE_GAME2 || (self.inZone && self.inZone.safe)) && !self.bossFight;
            var audioCtx = BSWG.music.audioCtx;
            var ctime = audioCtx.currentTime;
            var nextBeat = Math.ceil(ctime/(60/self.musicBPM)) * (60/self.musicBPM);
            if ((ctime - self.lastNote) > (60/self.musicBPM)*0.5) {
                Math.seedrandom(Math.floor((self.noteIndex%8)/4) + Math.floor(time/(60/self.musicBPM*16)));
                if (self.scene === BSWG.SCENE_TITLE || (self.ccblock && !self.ccblock.destroyed)) {
                    new BSWG.noteSample().play((self.scene === BSWG.SCENE_TITLE || self.bossFight ? 0.01 : 0.0035) * 3.25, Math.floor(Math.random()*8) + 3 * (self.noteIndex%3), 1, musicHappy, nextBeat, ((self.inZone ? self.inZone.id : 0) % 12) - 12);
                }
                new BSWG.noteSample().play((self.scene === BSWG.SCENE_TITLE || self.bossFight ? 0.01 : 0.0035) * 3.25, 0, 1, musicHappy, nextBeat, 0, 'kick');
                new BSWG.noteSample().play((self.scene === BSWG.SCENE_TITLE || self.bossFight ? 0.01 : 0.0035) * 3.25, 0, 1, musicHappy, nextBeat + (15/2)/self.musicBPM, 0, 'kick');
                if (self.scene === BSWG.SCENE_TITLE || self.battleMode) {
                    new BSWG.noteSample().play((self.scene === BSWG.SCENE_TITLE || self.bossFight ? 0.01 : 0.0035) * 3.25, 0, 1, musicHappy, nextBeat + (15)/self.musicBPM, 0, 'kick');
                }
                //new BSWG.noteSample().play((self.scene === BSWG.SCENE_TITLE || self.bossFight ? 0.01 : 0.0035) * 3.25, 8 + self.noteIndex%2, 1, musicHappy, nextBeat + 30/self.musicBPM, -6, 'kick');
                //new BSWG.noteSample().play((self.scene === BSWG.SCENE_TITLE || self.bossFight ? 0.01 : 0.0035) * 3.25, 8 + self.noteIndex%2, 1, musicHappy, nextBeat + 30/self.musicBPM + (15/4)/self.musicBPM, -6, 'kick');
                //new BSWG.noteSample().play((self.scene === BSWG.SCENE_TITLE || self.bossFight ? 0.01 : 0.0035) * 3.25, 8 + self.noteIndex%2, 1, musicHappy, nextBeat + 30/self.musicBPM + (15/2)/self.musicBPM, -6, 'crash-snare');
                self.lastNote = nextBeat;
                self.noteIndex += 1;
                Math.seedrandom();
            }
            ////

            if (!self.battleMode && self.ccblock && self.ccblock.obj && self.ccblock.obj.body && Math.lenVec2(self.ccblock.obj.body.GetLinearVelocity()) < 0.01) {
                if ((Date.timeStamp() - self.lastGC) > (2.5*60)) {
                    //window.gc();
                    self.lastGC = Date.timeStamp();
                }
            }

            self.hudBottomY = self.hudY(self.hudBottomYT);
            self.hudTopY = self.hudY(self.hudTopYT);

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
                    var t =  Math.sin(Date.timeStamp()*Math.PI*2.0) * 0.25 + 0.25;
                    self.hudObj.set_clr([0.85+(1-t)*0.05 + self.bmodeTint * t, 0.85+(1-t)*0.05 - self.bmodeTint * t, 1.0+(t)*0.1 - self.bmodeTint * t, 1]);
                }
            }

            if (self.curSong) {
                if (self.curSong.timeIndex() > (3 * 60 + 3)) {
                    self.repeatSong();
                }
            }

            var ctx = BSWG.render.ctx;
            var viewport = BSWG.render.viewport;

            var mx = BSWG.input.MOUSE('x');
            var my = BSWG.input.MOUSE('y');
            var mps = new b2Vec2(mx, my);
            var mp = BSWG.render.unproject3D(mps, 0.0);

            if (self.scene === BSWG.SCENE_GAME1 || self.scene === BSWG.SCENE_GAME2) {
                if (!self.grabbedBlock && self.ccblock && !self.editMode && self.storeMode && !BSWG.ui.mouseBlock) {
                    if (self.attractorOn && self.attractorOn.obj && self.attractorOn.obj.body && BSWG.input.MOUSE('left') && !BSWG.ui.mouseBlock) {
                        /*var vec = mp.clone();
                        var vec2 = self.attractorOn.obj.body.GetWorldCenter();
                        vec.x -= vec2.x;
                        vec.y -= vec2.y;
                        var len = Math.lenVec2(vec);
                        vec.x /= len;
                        vec.y /= len;
                        var f = BSWG.attractorForce * self.attractorOn.obj.body.GetMass();
                        vec.x *= f;
                        vec.y *= f;
                        self.attractorOn.obj.body.ApplyForceToCenter(vec);*/
                    }
                    else {
                        self.attractorShowing = false;
                        self.attractorOn = null;
                        self.attractorHover = null;
                        var cl = BSWG.componentList.withinRadius(mp.clone(), BSWG.attractorRange);
                        var minC = null, minLen = 1000;
                        for (var i=0; i<cl.length; i++) {
                            var C = cl[i];
                            if (C && C.obj && C.obj.body) {
                                var vec = mp.clone();
                                var vec2 = C.obj.body.GetWorldCenter();
                                vec.x -= vec2.x;
                                vec.y -= vec2.y;
                                var len = Math.lenVec2(vec);
                                if (!minC || len < minLen) {
                                    minC = C;
                                    minLen = len;
                                }
                            }
                        }
                        if (minC && !minC.onCC && !minC.noGrab) {
                            if (minLen > 0.05 && BSWG.input.MOUSE('left')) {
                                var vec = mp.clone();
                                var vec2 = minC.obj.body.GetWorldCenter();
                                vec.x -= vec2.x;
                                vec.y -= vec2.y;
                                vec.x /= minLen;
                                vec.y /= minLen;
                                var f = BSWG.attractorForce * minC.obj.body.GetMass();
                                vec.x *= f;
                                vec.y *= f;
                                minC.obj.body.ApplyForceToCenter(vec);
                                self.attractorOn = minC;
                                self.attractorShowing = true;
                                self.attractorHover = minC;
                            }
                            else if (minLen > 0.05) {
                                self.attractorShowing = true;
                                self.attractorHover = minC;
                            }
                        }
                    }
                }
                else {
                    self.attractorShowing = false;
                    self.attractorOn = null;
                    self.attractorHover = null;
                }
            }
            else {
                self.attractorShowing = false;
                self.attractorOn = null;
                self.attractorHover = null;               
            }

            if (self.battleMode) {
                if (!self.battleTime) {
                    self.battleTime = 0.0;
                }
                self.battleTime += dt;
            }

            switch (self.scene) {
                case BSWG.SCENE_TITLE:

                    if (BSWG.componentList.allCCs().length === 0 && !self.titleSpawn) {
                        var e = BSWG.getEnemy("heavy-fighter");
                        if (e && e.obj) {
                            self.titleSpawn = true;
                            self.spawnEnemies([[e.obj, 8], [e.obj, 8]]);
                            self.battleMode = true;
                        }
                    }

                    self.panPosTime -= dt;
                    var ret = BSWG.componentList.allCCs();
                    if (ret.length === 2) {
                        var p = ret[0].p().clone();
                        p.x += ret[1].p().x;// + ret[2].p().x;
                        p.y += ret[1].p().y;// + ret[2].p().y;
                        p.x /= 2;//3.0;
                        p.y /= 2;//3.0;
                        self.cam.panTo(dt*10.0, p);
                    }

                    var h = (350+140+80) - 42;
                    var yoff = BSWG.render.viewport.h*0.125;//BSWG.render.viewport.h*0.5 - h*0.5;
                    self.title1.p.x = BSWG.render.viewport.w*0.5;
                    self.title1.p.y = 80+42+yoff-80;
                    self.title2.p.x = BSWG.render.viewport.w*0.5;
                    self.title2.p.y = 145+42+yoff-80;
                    self.newGameBtn.p.x = BSWG.render.viewport.w*0.5;
                    self.newGameBtn.p.y = 350+yoff-80;
                    self.loadGameBtn.p.x = BSWG.render.viewport.w*0.5
                    self.loadGameBtn.p.y = 350+70+yoff-80;
                    self.sandBoxBtn.p.x = BSWG.render.viewport.w*0.5;
                    self.sandBoxBtn.p.y = 350+140+yoff-80;

                    self.dragStart = null;
                    self.editCam = false;
                    break;

                case BSWG.SCENE_GAME1:
                case BSWG.SCENE_GAME2:
                    self.editCam = self.ccblock && (self.editMode || self.storeMode);
                    if (self.ccblock && !self.ccblock.destroyed && !(self.bossFight && self.dialogPause)) {
                        var wheel = BSWG.input.MOUSE_WHEEL_ABS() - wheelStart;
                        var toZ = Math.clamp(0.1 * Math.pow(1.25, wheel), 0.01, 0.25);

                        if (!self.editCam) {

                            var ccs = self.battleMode ? BSWG.componentList.allCCs() : [self.ccblock];
                            var avgDist = 0.0;
                            var avgP = new b2Vec2(0, 0);
                            var w = 0;
                            avgP.x *= w;
                            avgP.y *= w;
                            for (var i=0; i<ccs.length; i++) {
                                var dist = Math.distVec2(ccs[i].p(), self.ccblock.p());
                                if (dist < 1) {
                                    dist = 1;
                                }
                                avgDist += dist;
                                var tw = 1;
                                if (dist > 20) {
                                    tw = 1 / ((1+dist-20)/5);
                                }
                                avgP.x += ccs[i].p().x * tw + ccs[i].obj.body.GetLinearVelocity().x * (self.battleMode ? 2 : 3) * tw;
                                avgP.y += ccs[i].p().y * tw + ccs[i].obj.body.GetLinearVelocity().y * (self.battleMode ? 2 : 3) * tw;
                                w += tw;
                            }

                            if (w>0.1) {
                                avgP.x /= w;
                                avgP.y /= w;
                                avgDist = Math.clamp(avgDist/ccs.length, 0.0, BSWG.lookRange);
                                toZ /= Math.max(Math.log(avgDist), 1.0);
                                toZ = Math.max(toZ, 0.009);
                                self.cam.panTo(0.75*dt*(self.ccblock.anchored ? 0.15 : 1.0), avgP);
                            }

                            ccs = null;

                            self.cam.zoomTo(dt*1.25*2, toZ);
                            self.cam.zoomTo(dt*0.15*2, toZ / Math.min(1.0+0.5*self.ccblock.obj.body.GetLinearVelocity().Length()*(self.battleMode ? 0.14 : 0.15), 1.15));

                            var ccp = self.ccblock.obj.body.GetWorldCenter().clone();

                            var bfr = BSWG.camVelLookBfr * viewport.w;
                            var p1 = BSWG.render.unproject3D(new b2Vec2(bfr, bfr));
                            var pc = BSWG.render.unproject3D(new b2Vec2(viewport.w*0.5, viewport.h*0.5));
                            var p2 = BSWG.render.unproject3D(new b2Vec2(viewport.w-bfr, viewport.h-bfr));
                            var w = Math.abs(Math.max(p1.x, p2.x) - pc.x);
                            var h = Math.abs(Math.max(p1.y, p2.y) - pc.y);

                            var tx = Math.clamp(self.cam.x, ccp.x - w, ccp.x + w);
                            var ty = Math.clamp(self.cam.y, ccp.y - h, ccp.y + h);

                            self.cam.panTo(16.*dt, new b2Vec2(tx, ty));

                            p = p1 = pc = p2 = null;

                            self.dragStart = null;
                        }
                        else {

                            self.cam.zoomTo(dt*1.5*2, toZ);

                            var p = new b2Vec2(self.cam.x, self.cam.y);

                            if (BSWG.input.MOUSE_PRESSED('middle') && !BSWG.componentList.mouseOver) {
                                self.dragStart = {
                                    mx: BSWG.input.MOUSE('x'),
                                    my: BSWG.input.MOUSE('y'),
                                    camx: self.cam.x,
                                    camy: self.cam.y,
                                    lp: null
                                }
                            }

                            if (self.dragStart && BSWG.input.MOUSE('middle')) {
                                self.dragStart.lp = p = new b2Vec2(
                                    self.dragStart.camx - self.cam.toWorldSize(viewport, BSWG.input.MOUSE('x') - self.dragStart.mx),
                                    self.dragStart.camy + self.cam.toWorldSize(viewport, BSWG.input.MOUSE('y') - self.dragStart.my)
                                );
                            }
                            else if (self.dragStart && self.dragStart.lp) {
                                p = self.dragStart.lp;
                            }

                            var ccp = self.ccblock.obj.body.GetWorldCenter().clone();

                            var p1 = new b2Vec2(ccp.x - BSWG.maxGrabDistance, ccp.y - BSWG.maxGrabDistance);
                            var pc = p;
                            var p2 = new b2Vec2(ccp.x + BSWG.maxGrabDistance, ccp.y + BSWG.maxGrabDistance);

                            var tx = Math.clamp(p.x, Math.min(p1.x, p2.x), Math.max(p1.x, p2.x));
                            var ty = Math.clamp(p.y, Math.min(p1.y, p2.y), Math.max(p1.y, p2.y));

                            self.cam.panTo(8.*dt, new b2Vec2(tx, ty));

                            p = p1 = pc = p2 = null;
                        }
                    }
                    else if (self.bossFight && self.dialogPause) {

                        var ccs = BSWG.componentList.allCCs();

                        for (var i=0; i<ccs.length; i++) {
                            if (ccs[i] !== self.ccblock && ccs[i].obj && ccs[i].obj.body) {
                                self.cam.panTo(4.5*dt, ccs[i].obj.body.GetWorldCenter().clone());
                                self.cam.zoomTo(dt*0.5*2, 0.015);
                                break;
                            }
                        }

                        ccs = null;

                        self.dragStart = null;

                    }

                    break;

                default:
                    break;
            }

            var offset = null;
            /*var cc = self.ccblock || BSWG.componentList.allCCs()[0];
            if (cc) {
                var offset = cc.obj.body.GetLinearVelocity().THREE(0.0);  
                offset.x = -offset.x * 0.2;
                offset.y = -offset.y * 0.2;
            }*/
            BSWG.render.updateCam3D(self.cam, offset);
            
            BSWG.specialList.updateRender(ctx, dt);

            BSWG.ui.update();

            BSWG.physics.update(dt);
            BSWG.componentList.update(dt);

            self.selection.update(dt, BSWG.render.unproject3D(new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y')), 0.0));

            if (BSWG.input.KEY_PRESSED(BSWG.KEY['ESC'])) {
                var mode = self.popMode();
                if (mode && self.modeBtns && self.modeBtns[mode] && self.modeBtns[mode].click) {
                    self.modeBtns[mode].click(self.modeBtns[mode]);
                }
            }

            //BSWG.planets.render(dt);

            switch (self.scene) {
                case BSWG.SCENE_TITLE:
                    break;

                case BSWG.SCENE_GAME1:
                case BSWG.SCENE_GAME2:

                    if (self.storeMode && !self.editMode && BSWG.input.MOUSE_PRESSED('left') && self.attractorHover) {
                        var comp = self.attractorHover;
                        if (!comp.onCC && !comp.salvaged) {
                            if (comp.obj && comp.obj.body) {
                                new BSWG.soundSample().play('levelup', comp.obj.body.GetWorldCenter().THREE(0.2), 0.125*comp.obj.body.GetMass(), 1.5);
                            }
                            comp.salvaged = true;
                            self.xpInfo.addStore(comp, 1);
                            comp.takeDamage(1000000, null, true, true);
                        }
                        comp = null;
                    }

                    /*if (self.editMode && !self.ccblock.destroyed) {

                        if (BSWG.input.MOUSE_PRESSED('left') && !BSWG.ui.mouseBlock && !grabbedBlock) {
                            if (BSWG.componentList.mouseOver) {
                                grabbedBlock = BSWG.componentList.mouseOver;
                                if (grabbedBlock.type === 'cc' || (grabbedBlock.onCC && (!grabbedBlock.canMoveAttached || grabbedBlock.onCC !== self.ccblock)) || grabbedBlock.distanceTo(self.ccblock) > BSWG.maxGrabDistance) {
                                    grabbedBlock = null;
                                }
                                else {
                                    grabbedLocal = grabbedBlock.getLocalPoint(mp);
                                    BSWG.physics.startMouseDrag(grabbedBlock.obj.body, grabbedBlock.obj.body.GetMass()*BSWG.grabSpeed);
                                    grabbedBlock.obj.body.SetLinearDamping(0.5);
                                    grabbedBlock.obj.body.SetAngularDamping(0.25);
                                }
                            }
                        }

                        if (grabbedBlock && (grabbedBlock.destroyed || !grabbedBlock.obj || !grabbedBlock.obj.body || !BSWG.input.MOUSE('left'))) {
                            grabbedBlock = null;
                            grabbedLocal = null;
                            BSWG.physics.endMouseDrag();
                        }

                        if (grabbedBlock && (BSWG.input.MOUSE_RELEASED('left') || grabbedBlock.distanceTo(self.ccblock) > BSWG.maxGrabDistance)) {
                            grabbedBlock.obj.body.SetLinearDamping(BSWG.physics.baseDamping);
                            grabbedBlock.obj.body.SetAngularDamping(BSWG.physics.baseDamping);
                            grabbedBlock = null;
                            grabbedLocal = null;
                            BSWG.physics.endMouseDrag();
                            BSWG.input.EAT_MOUSE('left');
                        }

                        if (grabbedBlock && BSWG.input.KEY_DOWN(BSWG.KEY.SHIFT)) {
                            grabbedBlock.obj.body.SetAngularDamping(BSWG.physics.baseDamping);
                            grabbedBlock.obj.body.SetLinearDamping(10.0);
                        } else if (grabbedBlock) {
                            grabbedBlock.obj.body.SetAngularDamping(BSWG.physics.baseDamping);
                            grabbedBlock.obj.body.SetLinearDamping(BSWG.physics.baseDamping);
                            
                            var dist = Math.distVec2(grabbedBlock.getWorldPoint(grabbedLocal), BSWG.physics.mousePosWorld());
                            if (dist < BSWG.grabSlowdownDistStart) {
                                var t = Math.pow(1.0 - Math.clamp((dist - BSWG.grabSlowdownDist) / (BSWG.grabSlowdownDistStart - BSWG.grabSlowdownDist), 0, 1), 2.0);
                                BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*BSWG.grabSpeed*(1.0+t*0.5));
                                grabbedBlock.obj.body.SetLinearDamping(BSWG.physics.baseDamping + 2.0*t);
                                grabbedBlock.obj.body.SetAngularDamping(BSWG.physics.baseDamping + 2.0*t);
                            }
                            else {
                                BSWG.physics.mouseDragSetMaxForce(grabbedBlock.obj.body.GetMass()*BSWG.grabSpeed);
                            }
                        }
                    }
                    else if (grabbedBlock) {
                        grabbedBlock.obj.body.SetLinearDamping(BSWG.physics.baseDamping);
                        grabbedBlock.obj.body.SetAngularDamping(BSWG.physics.baseDamping);
                        grabbedBlock = null;
                        grabbedLocal = null;
                        BSWG.physics.endMouseDrag();
                    }

                    self.grabbedBlock = grabbedBlock;*/

                    if (self.ccblock && !self.ccblock.ai && !BSWG.ui_DlgBlock) {
                        if (!self.dialogPause) {
                            BSWG.componentList.handleInput(self.ccblock, BSWG.input.getKeyMap());
                        }
                    }
                    break;

                default:
                    break;
            }

            //self.stars.render(ctx, self.cam, viewport);
            if (self.nebulas) {
                self.nebulas.render(ctx, self.cam, viewport);
            }
            BSWG.componentList.render(ctx, self.cam, dt);
            BSWG.blasterList.updateRender(ctx, self.cam, dt);
            BSWG.specProjList.updateRender(ctx, self.cam, dt);
            BSWG.laserList.updateRender(ctx, self.cam, dt);
            BSWG.render.boom.render(dt);
            BSWG.render.weather.render(dt);
            BSWG.xpDisplay.updateRender(ctx, self.cam, dt);
            BSWG.exaustList.render(dt);
            BSWG.orbList.updateRender(dt);
            BSWG.cloudMap.updateRender(dt);

            if (self.tileMap) {
                self.tileMap.update(dt);
            }

            switch (self.scene) {
                case BSWG.SCENE_TITLE:
                    self.exitBtn.p.x = self.hudX(self.hudBtn[12][0]) + 2;
                    self.exitBtn.p.y = self.hudY(self.hudBtn[12][1]) + 2;
                    self.exitBtn.w = self.hudX(self.hudBtn[12][2]) - self.exitBtn.p.x - 4;
                    self.exitBtn.h = self.hudY(self.hudBtn[12][3]) - self.exitBtn.p.y - 4;
                    break;

                case BSWG.SCENE_GAME1:
                case BSWG.SCENE_GAME2:

                    if (!grabbedBlock && BSWG.componentList.mouseOver && BSWG.componentList.mouseOver.obj && BSWG.componentList.mouseOver.obj.body) {

                        var comp = BSWG.componentList.mouseOver;

                        if (comp.type !== 'cc' && !(comp.onCC && (!comp.canMoveAttached || comp.onCC !== self.ccblock)) || comp.distanceTo(self.ccblock) > BSWG.maxGrabDistance) {
                            var gpc = BSWG.render.project3D(comp.obj.body.GetWorldCenter());
                            ctx.fillStyle = 'rgba(192, 192, 255, 0.75)';
                            ctx.beginPath();
                            ctx.arc(gpc.x, gpc.y, 5, 0, 2*Math.PI);
                            ctx.fill();
                            gpc = null;
                        }

                        comp = null;
                    }

                    if (grabbedBlock && grabbedBlock.obj && grabbedBlock.obj.body) {

                        self.ccblock.grabT = 0.19;

                        var gpw = grabbedBlock.getWorldPoint(grabbedLocal);
                        var gpc = BSWG.render.project3D(grabbedBlock.obj.body.GetWorldCenter());
                        var gp = BSWG.render.project3D(gpw);

                        var ccl = new b2Vec2(0.0, 0.6);
                        var ccw = self.ccblock.getWorldPoint(ccl);
                        var cc = BSWG.render.project3D(ccw);

                        ctx.lineWidth = 2.0;
                        ctx.strokeStyle = 'rgba(192, 192, 255, ' + (BSWG.input.MOUSE('shift') ? 0.3 : 0.75) + ')';
                        ctx.beginPath();
                        ctx.moveTo(cc.x, cc.y);
                        ctx.lineTo(gpc.x, gpc.y);
                        ctx.lineTo(gp.x, gp.y);
                        ctx.lineTo(mps.x, mps.y);
                        ctx.stroke();
                        
                        ctx.fillStyle = ctx.strokeStyle;

                        ctx.beginPath();
                        ctx.arc(gpc.x, gpc.y, 5, 0, 2*Math.PI);
                        ctx.fill();

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
                    else if (self.attractorOn) {

                        var gpw = self.attractorOn.p();
                        if (gpw && self.ccblock.obj && self.ccblock.obj.body) {
                            var gp = BSWG.render.project3D(gpw);

                            var ccl = new b2Vec2(0.0, 0.6);
                            var ccw = self.ccblock.getWorldPoint(ccl);
                            var cc = BSWG.render.project3D(ccw);

                            ctx.lineWidth = 2.0;
                            ctx.strokeStyle = 'rgba(192, 255, 192, 0.75)';
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
                    else if (self.scene === BSWG.SCENE_GAME1 && self.saveBtn) {
                        self.saveBtn.p.x = self.hudX(self.hudBtn[9][0]) + 1;
                        self.saveBtn.p.y = self.hudY(self.hudBtn[9][1]) + 1;
                        self.saveBtn.w = self.hudX(self.hudBtn[9][2]) - self.saveBtn.p.x - 2;
                        self.saveBtn.h = self.hudY(self.hudBtn[9][3]) - self.saveBtn.p.y - 2;
                    }

                default:
                    break;
            }

            if (self.ccblock && !self.ccblock.destroyed && !self.battleMode /*&& (Date.timeStamp()-self.lastSave) > 3*/ && BSWG.componentList.allCCs().length === 1 && (BSWG.orbList.atSafe() || (self.inZone && self.inZone.safe))) {
                if (!self.saveHealAdded) {
                    self.needsSave = true;
                    self.saveAt = Date.timeStamp() + 3.0;
                    //self.saveBtn.add();
                    //self.saveBtn.flashing = true;
                    self.saveHealAdded = true;
                    if (self.map) {
                        self.map.resetTickSpawner(self.inZone);
                    }
                }
            }
            else {
                if (self.saveHealAdded) {
                    //self.saveBtn.remove();
                    if (!self.battleMode) {
                        self.needsSave = true;
                        self.saveAt = Date.timeStamp() + 1.5;
                        if (self.map) {
                            self.map.resetTickSpawner(self.inZone);
                        }
                    }
                    self.saveHealAdded = false;
                }
            }

            for (var i=0; self.specBtns && i<self.specBtns.length; i++) {
                var btn = self.specBtns[i];
                if (BSWG.game.scene === BSWG.SCENE_GAME1 && self.ccblock && self.ccblock.equippedSpecialNo(i)) {
                    if (!btn._added) {
                        btn.add();
                        btn._added = true;
                    }
                    btn.p.x = self.hudX(self.hudBtn[2+i][0]) + 1;
                    btn.p.y = self.hudY(self.hudBtn[2+i][1]) + 1;
                    btn.w = self.hudX(self.hudBtn[2+i][2]) - btn.p.x - 2;
                    btn.h = self.hudY(self.hudBtn[2+i][3]) - btn.p.y - 2;
                    btn.flashing = self.ccblock.canUseSpecial(self.ccblock.equippedSpecialNo(i));
                }
                else {
                    btn.flashing = false;
                    if (btn._added) {
                        btn.remove();
                        btn._added = false;
                    }
                } 
            }          

            if (self.storeBtn) {
                self.storeBtn.text = !self.battleMode && (self.saveHealAdded || self.scene !== BSWG.SCENE_GAME1) ? BSWG.render.images['store-mode-safe'] : BSWG.render.images['store-mode'];
            }

            if (self.saveBtn) {
                self.saveBtn.flashing = (self.dialogBtnHighlight === 'save') || true;
            }
            if (self.storeBtn) {
                self.storeBtn.flashing = self.dialogBtnHighlight === 'store';
            }
            if (self.editBtn) {
                self.editBtn.flashing = self.dialogBtnHighlight === 'build';
            }
            if (self.tradeBtn) {
                self.tradeBtn.flashing = !self.tradeBtn.selected;//self.dialogBtnHighlight === 'trade';
            }
            if (self.showControlsBtn) {
                self.showControlsBtn.flashing = self.dialogBtnHighlight === 'keys';
            }
            if (self.powerBtn) {
                self.powerBtn.flashing = self.dialogBtnHighlight === 'power';
            }

            if (self.scene === BSWG.SCENE_GAME2) {
                //self.healBtn.p.x = self.showControlsBtn.p.x + self.showControlsBtn.w + 10;
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
                            color: [1, 1, 1.5, 1],
                            hoverColor: [1, 1, 1.5, 1],
                            lowDetail: true,
                            click: function (me) {},
                            hoverClickSound: false
                        });
                        zones[i].zoneTitle.hide();
                    }
                }
                self.inZone = self.map.getZone(self.ccblock.obj.body.GetWorldCenter());
                self.safeZone = self.inZone.safe && Math.distVec2(self.inZone.worldP, self.ccblock.obj.body.GetWorldCenter()) < (5 * self.map.gridSize);
                if (!self.zSwitchTime) {
                    self.zSwitchTime = Date.timeStamp() - 5;
                }
                if (!self.lastWeatherChange) {
                    self.lastWeatherChange = -1000.0;
                }
                if (self.inZone && (Date.timeStamp() - self.lastWeatherChange) > 60.0) {
                    var B = self.inZone.biome;
                    var desc = {
                        density:        0.0,
                        size:           0.15,
                        color:          new THREE.Vector4(0, .3, 1, .6),
                        speed:          2.5,
                        lightning:      new THREE.Vector4(1, 1, 1, 1),
                        lightningFreq:  0.0,
                        wet:            0.0,
                        tint:           new THREE.Vector4(0, .5, 1, 0),
                        swirl:          0.0,
                        tintSpeed:      1
                    }

                    if (B.heat > 0 && (B.wet < 0 || desc.density < 0.3)) {
                        desc.tint.x = Math.clamp(desc.tint.x + B.heat * 1.6, 0., 1.);
                        desc.tint.y = Math.clamp(desc.tint.y + B.heat * 0.5, 0., 1.);
                    }
                    else {
                        desc.tint.x = Math.clamp(desc.tint.x + -B.heat, 0., 1.);
                        desc.tint.y = Math.clamp(desc.tint.y + -B.heat, 0., 1.);
                        desc.tint.z = Math.clamp(desc.tint.z + -B.heat, 0., 1.);
                        desc.tint.w *= (1 + B.heat) * 0.5 + 0.5;
                        desc.speed = 0.1;
                        desc.size *= 1.35;
                        desc.color.w *= 0.65;
                        desc.color.x = desc.color.y = desc.color.z = 1.0;
                    }

                    var t = Math.pow(B.grassF, 0.3);
                    desc.tint.r = t * 0.0 + (1.0 - t) * desc.tint.r;
                    desc.tint.g = t * 1.0 + (1.0 - t) * desc.tint.g;
                    desc.tint.b = t * 0.0 + (1.0 - t) * desc.tint.b;
                    var t = Math.pow(B.sandF, 0.3);
                    desc.tint.r = t * 1.0 + (1.0 - t) * desc.tint.r;
                    desc.tint.g = t * 0.7 + (1.0 - t) * desc.tint.g;
                    desc.tint.b = t * 0.0 + (1.0 - t) * desc.tint.b;
                    var t = Math.pow(B.snowF, 0.3);
                    desc.tint.r = t * 0.5 + (1.0 - t) * desc.tint.r;
                    desc.tint.g = t * 0.7 + (1.0 - t) * desc.tint.g;
                    desc.tint.b = t * 1.0 + (1.0 - t) * desc.tint.b;
                    var t = Math.pow(B.rockF, 0.3);
                    desc.tint.r = t * 0.5 + (1.0 - t) * desc.tint.r;
                    desc.tint.g = t * 0.5 + (1.0 - t) * desc.tint.g;
                    desc.tint.b = t * 0.0 + (1.0 - t) * desc.tint.b;

                    if (B.wet > 0) {
                        desc.density = Math.pow(Math.clamp(B.wet*Math.random()*(Math.sin(Date.timeStamp()/(Math.PI*3*60))*0.5+0.5), 0, 1), 2.5);
                        if (desc.density < 0.1) {
                            desc.density = 0.0;
                        }
                        if (desc.density > 0.85 && B.heat > 0) {
                            desc.lightningFreq = 0.015*0.2;
                        }
                        else if (desc.density > 0.5 && B.heat > 0) {
                            desc.lightningFreq = 0.01*0.2;
                        }
                        desc.density *= 0.4;
                        desc.color.w = Math.clamp(desc.color.w * desc.density * 2.0, 0., 1.);
                        if (desc.density > 0.2) {
                            desc.tint.set(.3, .3, .3, Math.clamp(desc.density*20, 0., 0.9));
                        }
                        desc.wet = Math.clamp(B.wet, 0., 1.) * 0.1;
                        desc.tint.z = Math.clamp(desc.tint.z + desc.wet * 0.25, 0., 1.);
                    }
                    else {
                        desc.density = Math.pow(Math.clamp(-B.wet*Math.random()*5.0, 0, 1), 2.0);
                        if (desc.density < 0.1) {
                            desc.density = 0.0;
                        }
                        desc.color.set(.6, .3, .1, .7);
                        desc.swirl = 5.0 * Math.random();
                        desc.speed = -0.1;
                        desc.wet = -0.1;
                    }

                    if (desc.color.w > 0.65) {
                        desc.color.w = 0.65;
                    }

                    var dark = Math.pow(Math.clamp(B.dark * (Math.random()*0.5+0.5) + B.wet*0.15, 0., 1.), 2.5) * 0.5;

                    if (dark < 0.35) {
                        dark = Math.pow(dark, 2.0);
                    }
                    else {
                        dark = Math.pow(dark, 0.25);
                    }

                    desc.envMapT = dark;
                    desc.dark = desc.envMapT;

                    desc.tint.w = Math.clamp(desc.tint.w, 0., 1.);

                    BSWG.render.weather.transition(desc, 0.5);

                    self.lastWeatherChange = Date.timeStamp();
                }
                if (self.lastZone !== self.inZone && (Date.timeStamp() - self.zSwitchTime)>3.0) {
                    self.zSwitchTime = Date.timeStamp();
                    if (self.lastZone) {
                        //self.lastZone.zoneTitle.remove();
                        //self.lastZone.zoneTitle.hoverColor[3] = self.lastZone.zoneTitle.textColor[3] = 0.0;
                        self.lastZone.zoneTitle.hide();
                    }
                    //self.inZone.zoneTitle.hoverColor[3] = self.inZone.zoneTitle.textColor[3] = 1.0;
                    //self.inZone.zoneTitle.add();
                    self.inZone.zoneTitle.show();
                    self.needsSave = true;
                    self.saveAt = Date.timeStamp() + 1.5;
                    if (self.map) {
                        self.map.resetTickSpawner(self.inZone);
                    }
                    self.lastZone = self.inZone;

                    self.lastWeatherChange = Date.timeStamp() - 55.0;

                    self.zoneChangeT = 6.0;

                    self.inZone.discovered = true;
                    /*var ctx2 = self.mapImage.getContext('2d');

                    ctx2.globalAlpha = 1.0;
                    self.map.renderZoneMap(ctx2, '#002', true, 4, true);
                    self.map.renderEdgeMap(ctx2, '#00f', true, 4, true);

                    for (var i=0; i<self.map.planets.length; i++) {
                        if (self.map.planets[i].zone.discovered) {
                            var p = self.map.worldToMap(self.map.planets[i].worldP);
                            ctx2.fillStyle = '#0f0';
                            ctx2.fillRect(p.x*4-6, p.y*4-6, 12, 12);
                        }
                    }*/

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
                        self.inZone.zoneTitle.hide();
                    }
                }
            }
            
            if (self.editBtn) {
                self.editBtn.p.x = self.hudX(self.hudBtn[6][0]) + 2;
                self.editBtn.p.y = self.hudY(self.hudBtn[6][1]) + 2;
                self.editBtn.w = self.hudX(self.hudBtn[6][2]) - self.editBtn.p.x - 4;
                self.editBtn.h = self.hudY(self.hudBtn[6][3]) - self.editBtn.p.y - 4;
            }

            if (self.storeBtn) {
                self.storeBtn.p.x = self.hudX(self.hudBtn[9][0]) + 2;
                self.storeBtn.p.y = self.hudY(self.hudBtn[9][1]) + 2;
                self.storeBtn.w = self.hudX(self.hudBtn[9][2]) - self.storeBtn.p.x - 4;
                self.storeBtn.h = self.hudY(self.hudBtn[9][3]) - self.storeBtn.p.y - 4;
            }

            if (self.tradeWin && self.tradeBtn && self.inZone && self.inZone.safe && self.inZone.compValList && self.inZone.compValList.length && (!self.dialogPause || self.dialogBtnHighlight === 'trade')) {
                if (self.tradeBtn.text === '') {
                    self.tradeBtn.text = BSWG.character.getPortrait(self.inZone.boss ? self.inZone.boss.who : -1, true);
                }
                self.tradeWin.portrait = self.tradeBtn.text;
                self.tradeBtn.p.x = self.hudX(self.tradeButtonPos[0]) + 2;
                self.tradeBtn.p.y = self.hudY(self.tradeButtonPos[1]) + 2;
                self.tradeBtn.w = self.hudX(self.tradeButtonPos[2]) - self.tradeBtn.p.x - 4;
                self.tradeBtn.h = self.hudY(self.tradeButtonPos[3]) - self.tradeBtn.p.y - 4;
            }
            else if (self.tradeBtn) {
                self.tradeBtn.text = '';
                self.tradeBtn.selected = false;
                self.tradeMode = false;
                self.tradeBtn.p.y = 1000000;
            }

            if (self.anchorBtn) {
                self.anchorBtn.p.x = self.hudX(self.hudBtn[8][0]) + 2;
                self.anchorBtn.p.y = self.hudY(self.hudBtn[8][1]) + 2;
                self.anchorBtn.w = self.hudX(self.hudBtn[8][2]) - self.anchorBtn.p.x - 4;
                self.anchorBtn.h = self.hudY(self.hudBtn[8][3]) - self.anchorBtn.p.y - 4;
            }

            if (self.showControlsBtn) {
                self.showControlsBtn.p.x = self.hudX(self.hudBtn[7][0]) + 2;
                self.showControlsBtn.p.y = self.hudY(self.hudBtn[7][1]) + 2;
                self.showControlsBtn.w = self.hudX(self.hudBtn[7][2]) - self.showControlsBtn.p.x - 4;
                self.showControlsBtn.h = self.hudY(self.hudBtn[7][3]) - self.showControlsBtn.p.y - 4;
            }

            if (self.powerBtn) {
                self.powerBtn.p.x = self.hudX(self.hudBtn[10][0]) + 2;
                self.powerBtn.p.y = self.hudY(self.hudBtn[10][1]) + 2;
                self.powerBtn.w = self.hudX(self.hudBtn[10][2]) - self.powerBtn.p.x - 4;
                self.powerBtn.h = self.hudY(self.hudBtn[10][3]) - self.powerBtn.p.y - 4;
            }

            if (self.statsBtn) {
                self.statsBtn.p.x = self.hudX(self.hudBtn[18][0]) + 2;
                self.statsBtn.p.y = self.hudY(self.hudBtn[18][1]) + 2;
                self.statsBtn.w = self.hudX(self.hudBtn[18][2]) - self.statsBtn.p.x - 4;
                self.statsBtn.h = self.hudY(self.hudBtn[18][3]) - self.statsBtn.p.y - 4;
            }

            if (self.specialsBtn) {
                self.specialsBtn.p.x = self.hudX(self.hudBtn[19][0]) + 2;
                self.specialsBtn.p.y = self.hudY(self.hudBtn[19][1]) + 2;
                self.specialsBtn.w = self.hudX(self.hudBtn[19][2]) - self.specialsBtn.p.x - 4;
                self.specialsBtn.h = self.hudY(self.hudBtn[19][3]) - self.specialsBtn.p.y - 4;
            }

            if (self.levelUpBtn) {
                self.levelUpBtn.p.x = self.hudX(self.hudBtn[20][0]) + 2;
                self.levelUpBtn.p.y = self.hudY(self.hudBtn[20][1]) + 2;
                self.levelUpBtn.w = self.hudX(self.hudBtn[20][2]) - self.levelUpBtn.p.x - 4;
                self.levelUpBtn.h = self.hudY(self.hudBtn[20][3]) - self.levelUpBtn.p.y - 4;
            }

            self.selection.render(ctx, dt);
            self.updateHUD(dt);

            BSWG.ai.update(ctx, dt);

            if (self.map && self.ccblock && !self.ccblock.destroyed) {
                var p = self.ccblock.obj.body.GetWorldCenter().clone();
                var v = self.ccblock.obj.body.GetLinearVelocity().clone();

                if (self.spawnCount === 0) {
                    var ccs = BSWG.componentList.allCCs();
                    if (self.battleMode) {
                        if ((ccs.length - (self.ccblock && !self.ccblock.destroyed ? 1 : 0)) === 0) {
                            if (self.bossFight && self.inZone === self.bossZone) {
                                self.bossZone.bossDefeated = true;
                                if (self.inZone.boss.wdialog) {
                                    BSWG.game.linearDialog(self.inZone.boss.wdialog, false);
                                }
                            }
                            self.battleMode = false;
                            self.bossFight = false;
                        }
                    }

                    if (!self.bossFight) {
                        var escapeDistance = self.map.gridSize * 4.0 / 1.35;
                        /*if (!self.battleMode) {
                            escapeDistance /= 1.1;
                        }*/
                        for (var i=0; i<ccs.length; i++) {
                            if (self.ccblock && self.ccblock.id !== ccs[i].id && (ccs[i].obj && ccs[i].obj.body && Math.distVec2(ccs[i].obj.body.GetWorldCenter(), self.ccblock.obj.body.GetWorldCenter()) > escapeDistance)) {
                                ccs[i].warpOut();
                            }
                        }
                    }
                    ccs = null;
                }

                var ret = self.map.tickSpawner(dt, p, v);

                if (ret === -1) {
                    var ccs = BSWG.componentList.allCCs();
                    for (var i=0; i<ccs.length; i++) {
                        if (self.ccblock && self.ccblock.id !== ccs[i].id) {
                            ccs[i].warpOut(true);
                        }
                    }
                }
                else if (ret === 1) {
                    var enemies = self.map.getEnemyForPos(p);
                    if (enemies && enemies.length) {
                        if (self.inZone.boss) {
                            self.bossFight = true;
                            self.bossZone = self.inZone;
                            self.spawnEnemies(enemies, true);
                        }
                        else {
                            self.bossFight = false;
                            self.spawnEnemies(enemies, false);
                        }
                    }
                }
            }

            if (self.hudObj) {
                self.hudObj.clear_bg(ctx);
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

            if (self.hudBtn[17] && self.xpInfo) {
                var X = self.hudX(self.hudBtn[17][0]) + 2;
                var Y = self.hudY(self.hudBtn[17][1]) + 2;
                var W = self.hudX(self.hudBtn[17][2]) - X - 4;
                var H = self.hudY(self.hudBtn[17][3]) - Y - 4;

                var lstat = self.xpInfo.levelProgress();

                ctx.fillStyle = '#002';
                ctx.globalAlpha = 0.75;
                ctx.fillRect(X, Y, W, H);
                ctx.globalAlpha = 1.0;

                var img = BSWG.render.procImageCache(self, '_lvlBar', W, H, null, function(ctx, w, h){
                    var grd = ctx.createLinearGradient(0, 0, w, 0);
                    grd.addColorStop(0,"#000");
                    grd.addColorStop(1,'#0b0');
                    ctx.fillStyle = grd;
                    ctx.globalAlpha = 0.75;
                    ctx.fillRect(0+1, 0+1, w-2, h-2);
                    ctx.globalAlpha = 1.0;
                    var grd = ctx.createLinearGradient(0, 0, 0, h);
                    grd.addColorStop(0,"rgba(127, 127, 127, 0.125)");
                    grd.addColorStop(0.5,"rgba(255, 255, 255, 0.35)");
                    grd.addColorStop(1,"rgba(0, 0, 0, 0.125)");
                    ctx.fillStyle = grd;
                    ctx.fillRect(0+1, 0+1, w-2, h-2);
                });
                ctx.drawImage(img, 0, 0, W*lstat.t, H, X, Y, W*lstat.t, H);

                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#00f';
                ctx.font = (~~(H*0.65)) + 'px Orbitron';
                ctx.textAlign = 'left';
                ctx.fillTextB('Lvl. ' + self.xpInfo.level, X + W * 0.01, Y + H * 0.4 + (H*0.65*0.5), true);

                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#00f';
                ctx.font = (~~(H*0.65)) + 'px Orbitron';
                ctx.textAlign = 'right';
                ctx.fillTextB('' + lstat.current + '/' + lstat.next + ' XP', X + W - W * 0.01, Y + H * 0.4 + (H*0.65*0.5), true);
            }

            if (self.hudBtn[21] && self.ccblock) {
                var X = self.hudX(self.hudBtn[21][0]) + 2;
                var Y = self.hudY(self.hudBtn[21][1]) + 2;
                var W = self.hudX(self.hudBtn[21][2]) - X - 4;
                var H = self.hudY(self.hudBtn[21][3]) - Y - 4;

                var t = self.ccblock.energy / self.ccblock.maxEnergy;

                ctx.fillStyle = '#020';
                ctx.globalAlpha = 0.75;
                ctx.fillRect(X, Y, W, H);
                ctx.globalAlpha = 1.0;

                if (self.ccblock.energyCritical) {
                    ctx.globalAlpha = (Math.sin(BSWG.render.time*Math.PI*3.0) * 0.5 + 0.5) * 0.5;
                    ctx.fillStyle = '#F00';
                    ctx.fillRect(X, Y, W, H);
                    ctx.globalAlpha = 1.0;
                }

                var img = BSWG.render.procImageCache(self, '_spBar', W, H, null, function(ctx, w, h){
                    var grd = ctx.createLinearGradient(0, 0, w, 0);
                    grd.addColorStop(0,"#000");
                    grd.addColorStop(1,'#00b');
                    ctx.fillStyle = grd;
                    ctx.globalAlpha = 0.75;
                    ctx.fillRect(0+1, 0+1, w-2, h-2);
                    ctx.globalAlpha = 1.0;
                    var grd = ctx.createLinearGradient(0, 0, 0, h);
                    grd.addColorStop(0,"rgba(127, 127, 127, 0.0)");
                    grd.addColorStop(0.5,"rgba(255, 255, 255, 0.25)");
                    grd.addColorStop(1,"rgba(0, 0, 0, 0.0)");
                    ctx.fillStyle = grd;
                    ctx.fillRect(0+1, 0+1, w-2, h-2);
                });
                ctx.drawImage(img, 0, 0, W*t, H, X, Y, W*t, H);

                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#00f';
                ctx.font = (~~(H*0.65)) + 'px Orbitron';
                ctx.textAlign = 'left';
                ctx.fillTextB('Energy', X + W * 0.01, Y + H * 0.4 + (H*0.65*0.5), true);
                //var img = BSWG.render.images['power'];
                //ctx.drawImage(img, 0, 0, img.width, img.height, X + W * 0.01, Y + H * 0.01, H * 0.98, H * 0.98);

                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#00f';
                ctx.font = (~~(H*0.65)) + 'px Orbitron';
                ctx.textAlign = 'right';
                var eUse = Math.round(self.ccblock.energyUse);
                ctx.fillTextB('(' + (eUse > 0 ? '+' : '') + eUse + '/s) ' + Math.round(self.ccblock.energy) + '/' + Math.round(self.ccblock.maxEnergy), X + W - W * 0.01, Y + H * 0.4 + (H*0.65*0.5), true);
            }

            if (self.xpInfo && self.levelUpBtn) {
                var points = self.xpInfo.pointsLeft();
                self.levelUpBtn.flashing = points > 0;
                if (points > 0) {
                    self.levelUpBtn.text = 'Points (' + points + ')';
                }
                else {
                    self.levelUpBtn.text = 'Points';
                }
            }

            if (self.mapImage) {
                var x = self.hudX(self.hudBtn[0][0])+1,
                    y = self.hudY(self.hudBtn[0][1])+1;
                var w = self.hudX(self.hudBtn[0][2])-x-2,
                    h = self.hudY(self.hudBtn[0][3])-y-2;

                if (BSWG.input.MOUSE_RELEASED('left')) {
                    if (BSWG.input.MOUSE('x') >= x && BSWG.input.MOUSE('x') <= (x+w) &&
                        BSWG.input.MOUSE('y') >= y && BSWG.input.MOUSE('y') <= (y+h)) {
                        self.minimapZoom = !self.minimapZoom;
                    }
                }

                var minx = 0, miny = 0, maxx = self.map.size-1, maxy = self.map.size-1, sz = self.map.size;

                if (self.minimapZoom && self.inZone) {
                    minx = -1 + self.inZone.rmin.x;
                    miny = -1 + self.map.size - self.inZone.rmax.y;
                    maxx = 1 + self.inZone.rmax.x;
                    maxy = 1 + self.map.size - self.inZone.rmin.y;
                    if ((maxx - minx) < 18) {
                        var p0 = (maxx + minx) * 0.5;
                        minx = p0 - 9; maxx = p0 + 9;
                    }
                    if ((maxy - miny) < 18) {
                        var p0 = (maxy + miny) * 0.5;
                        miny = p0 - 9; maxy = p0 + 9;
                    }
                    if ((maxx - minx) > (maxy - miny)) {
                        sz = (maxx - minx);
                        var p0 = (maxy + miny) * 0.5;
                        miny = Math.floor(p0 - sz/2);
                        maxy = Math.ceil(p0 + sz/2);
                    }
                    else {
                        sz = (maxy - miny);
                        var p0 = (maxx + minx) * 0.5;
                        minx = Math.floor(p0 - sz/2);
                        maxx = Math.ceil(p0 + sz/2);                       
                    }
                }

                if (minx < 0) {
                    maxx -= minx;
                    minx = 0;
                }
                if (miny < 0) {
                    maxy -= miny;
                    miny = 0;
                }
                if (maxx > self.map.size) {
                    minx -= (maxx - self.map.size);
                    maxx = self.map.size;
                }
                if (maxy > self.map.size) {
                    miny -= (maxy - self.map.size);
                    maxy = self.map.size;
                }

                if (self._mmMinx !== null) {
                    minx = (self._mmMinx*0.95 + minx*0.05);
                    maxx = (self._mmMaxx*0.95 + maxx*0.05);
                    miny = (self._mmMiny*0.95 + miny*0.05);
                    maxy = (self._mmMaxy*0.95 + maxy*0.05);
                }

                self._mmMinx = minx;
                self._mmMaxx = maxx;
                self._mmMiny = miny;
                self._mmMaxy = maxy;

                var iscx = self.mapImage.width / self.map.size;
                var iscy = self.mapImage.height / self.map.size;

                var TX = function(X) {
                    return (((((X-x) / w) * self.map.size) - minx) / (maxx - minx)) * w + x;
                };
                var TY = function(Y) {
                    return (((((Y-y) / h) * self.map.size) - miny) / (maxy - miny)) * h + y;
                };

                ctx.drawImage(self.mapImage, (minx * iscx) + BSWG.minimapTileSize/2, (miny * iscy) + BSWG.minimapTileSize/2,
                                             ((maxx-minx) * iscx), ((maxy-miny) * iscy),
                                             x, y, w, h);
                ctx.save();
                ctx.rect(x, y, w, h);
                ctx.clip();

                for (var i=0; i<self.map.zones.length; i++) {
                    var zone = self.map.zones[i];
                    if (zone.discovered) {
                        var p = zone.p;
                        var X = Math.floor(p.x), Y = Math.floor(p.y);
                        if (self.map.disMap[X] && self.map.disMap[X][Y]) {
                            ctx.fillStyle = '#000';
                            ctx.globalAlpha = Math.sin(Date.timeStamp() * Math.PI * 1.5) * 0.5 + 0.5;
                            ctx.fillRect(TX(x + p.x/self.map.size * w-1), TY(y + (1-p.y/self.map.size) * h-1), 3, 3);
                            ctx.fillStyle = '#ff0';
                            ctx.globalAlpha = Math.sin(Date.timeStamp() * Math.PI * 1.5 + Math.PI*0.5) * 0.5 + 0.5;
                            ctx.fillRect(TX(x + p.x/self.map.size * w-1), TY(y + (1-p.y/self.map.size) * h-1), 3, 3);
                            ctx.globalAlpha = 1.0;
                        }
                    }
                }

                if (self.ccblock && !self.ccblock.destroyed) {
                    var p = self.map.worldToMap(self.ccblock.obj.body.GetWorldCenter());
                    ctx.fillStyle = '#000';
                    ctx.globalAlpha = Math.sin(Date.timeStamp() * Math.PI * 5) * 0.5 + 0.5;
                    ctx.fillRect(TX(x + p.x/self.map.size * w-1), TY(y + (p.y+1)/self.map.size * h-1), 3, 3);
                    ctx.fillStyle = '#fff';
                    ctx.globalAlpha = Math.sin(Date.timeStamp() * Math.PI * 5 + Math.PI*0.5) * 0.5 + 0.5;
                    ctx.fillRect(TX(x + p.x/self.map.size * w-1), TY(y + (p.y+1)/self.map.size * h-1), 3, 3);
                    ctx.globalAlpha = 1.0;
                }

                var ccs = BSWG.componentList.allCCs();
                for (var i=0; i<ccs.length; i++) {
                    if (ccs[i] !== self.ccblock && !ccs[i].destroyed && self.battleMode) {
                        var p = self.map.worldToMap(ccs[i].obj.body.GetWorldCenter());
                        ctx.fillStyle = '#000';
                        ctx.globalAlpha = Math.sin(Date.timeStamp() * Math.PI * 7) * 0.5 + 0.5;
                        ctx.fillRect(TX(x + p.x/self.map.size * w-1), TY(y + (p.y+1)/self.map.size * h-1), 3, 3);
                        ctx.fillStyle = '#f00';
                        ctx.globalAlpha = Math.sin(Date.timeStamp() * Math.PI * 7 + Math.PI*0.5) * 0.5 + 0.5;
                        ctx.fillRect(TX(x + p.x/self.map.size * w-1), TY(y + (p.y+1)/self.map.size * h-1), 3, 3);
                        ctx.globalAlpha = 1.0;                        
                    }
                }
                ccs = null;

                ctx.restore();

                if (self.inZone) {
                    var x = self.hudX(self.hudBtn[11][0])+1,
                        y = self.hudY(self.hudBtn[11][1])+1;
                    var w = self.hudX(self.hudBtn[11][2])-x-2,
                        h = self.hudY(self.hudBtn[11][3])-y-2;
                    ctx.fillStyle = '#88f';
                    ctx.strokeStyle = '#226';
                    ctx.font = '18px Orbitron';
                    ctx.textAlign = 'left';
                    if (self.battleMode) {
                        var fs = (~~(h/6)) - 1;
                        ctx.font = fs + 'px Orbitron';
                        ctx.fillStyle = '#f88';
                        ctx.strokeStyle = '#622';
                        var ccs = BSWG.componentList.allCCs();
                        var idx = 0;
                        for (var i=0; i<ccs.length; i++) {
                            if (!self.ccblock || ccs[i].id !== self.ccblock.id) {
                                if (idx >= 8) {
                                    break;
                                }
                                var xx = idx % 2;
                                var yy = (idx-xx) / 2;

                                xx *= (w-15) / 2;
                                yy *= fs + 1;

                                ctx.fillTextB((ccs[i].title || 'Unkown Enemy') + ' - Lvl. ' + Math.floor((ccs[i].enemyLevel||0)*10)/10, x + 15 + xx, y + 10 + fs + yy);
                                idx ++;
                            }
                        }
                    }
                    else {
                        var lStr = Math.floor(self.inZone.minLevel*10)/10 + '-' + Math.floor(self.inZone.maxLevel*10)/10;
                        if (self.inZone.minLevel === self.inZone.maxLevel) {
                            lStr = '' + Math.floor(self.inZone.minLevel*10)/10;
                        }
                        if (self.inZone.boss) {
                            lStr = '' + Math.floor((self.inZone.maxLevel + 1)*10)/10;
                        }
                        ctx.fillTextB(self.inZone.name + ' - Lvl. ' + lStr, x + 15, y + 10 + 18);
                    }
                }
            }

            ctx.globalAlpha = 1.0;

            BSWG.ui.render(ctx, viewport);
            var statusTxt = Math.floor(1/BSWG.render.actualDt) + " fps (" + Math.floor(1/BSWG.render.dt) + " fps), CL: " + BSWG.componentList.compList.length + ', SC: ' + BSWG.curSounds + '/' + BSWG.maxSounds + (BSWG.options.vsync ? ', VSYNC' : '');
            ctx.fillStyle = '#ccc';
            ctx.textAlign = 'left'
            ctx.font = '12px Orbitron';
            ctx.fillText(statusTxt, viewport.w - 10*Math.ceil(statusTxt.length/8)*8 - 32, self.hudY(self.hudTopYT)/2+6);
            if (self.beMsg && (self.beMsgTime + 3) > Date.timeStamp()) {
                ctx.fillStyle = '#f00';
                ctx.strokeStyle = '#000';
                ctx.textAlign = 'center';
                ctx.font = '26px Orbitron';
                ctx.fillTextB(self.beMsg, viewport.w/2, self.hudY(self.hudBottomYT2));
                ctx.textAlign = 'left';
            }

            if (BSWG.game.scene === BSWG.SCENE_GAME1 && (!self.ccblock || self.ccblock.destroyed)) {
                var time = Date.timeStamp();
                if (!self.deathTime) {
                    self.deathTime = time;
                    self.deathDone = false;
                }

                var t = Math.clamp(((time - self.deathTime) - 1.0) / 3.0, 0., 2.);
                if (t >= 2 && !self.deathDone) {
                    self.deathDone = true;
                    if (localStorage.game_save) {
                        self.changeScene(BSWG.SCENE_GAME1, {load: JSON.parse(localStorage.game_save)}, '#000', 0.75);
                    }
                    else {
                        self.changeScene(BSWG.SCENE_TITLE, {}, '#000', 0.75);
                    }
                }

                ctx.globalAlpha = Math.min(t, 1);

                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, BSWG.render.viewport.w, BSWG.render.viewport.h);
                ctx.textAlign = 'center';
                ctx.fillStyle = '#f00';
                ctx.strokeStyle = '#000';
                ctx.font = '64px Orbitron';
                ctx.fillTextB("Annihilated ...", viewport.w/2, viewport.h/2+32);
                ctx.textAlign = 'left';

                ctx.globalAlpha = 1.0;
            }
            else {
                self.deathTime = null;
                self.deathDone = false;
            }

            ctx.globalAlpha = 1.0;

            if (self.switchScene) {

                var ss = self.switchScene;
                var t = 0.0;
                if (ss.timeOut > 0) {
                    ss.timeOut -= dt;
                    t = 1.0 - (ss.timeOut / ss.fadeTime);
                    if (ss.timeOut < 0) {
                        ss.timeOut = 0;
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, BSWG.render.viewport.w, BSWG.render.viewport.h);
                        ctx.font = '48px Orbitron';
                        ctx.strokeStyle = '#000';
                        ctx.fillStyle = '#aaf';
                        ctx.textAlign = 'center';
                        ctx.fillTextB('Loading ...', BSWG.render.viewport.w/2, BSWG.render.viewport.h - 48, true);
                        ctx.drawImage(BSWG.titleImage, 0, 0, BSWG.titleImage.width, BSWG.titleImage.height, BSWG.render.viewport.w/2 - BSWG.titleImage.width/3.0, 48, BSWG.titleImage.width/1.5, BSWG.titleImage.height/1.5);
                        ctx.textAlign = 'left';
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
            else {
                if (self.scene === BSWG.SCENE_GAME1) {
                    if (!self.saveAt) {
                        self.saveAt = Date.timeStamp() + 3.0;
                    }
                    if (self.needsSave && !self.battleMode && (Date.timeStamp() >= self.saveAt)) {
                        self.needsSave = false;
                        if (Date.timeStamp() > (self.lastSave+4)) {
                            self.saveGame();
                            self.lastSave = Date.timeStamp();
                        }
                    }
                }
            }

        });
    };

}();