// BlockShip Wars Component

BSWG.compActiveConfMenu = null;

BSWG.component_minJMatch        = Math.pow(0.15, 2.0);
BSWG.component_jMatchClickRange = Math.pow(0.15, 2.0);

BSWG.componentHoverFn = function(self) {
    if (BSWG.componentList.mouseOver !== self || !BSWG.game.editMode || (self.onCC && self.onCC !== BSWG.game.ccblock)) {
        return false;
    }
    if (self.onCC && !self.hasConfig && !self.canMoveAttached) {
        return false;
    }
    return true;
};

BSWG.updateOnCC = function (a, b) {

    var cc = a.onCC || b.onCC;

    var scan = function(n, u) {

        if (!n)
            return false;

        if (!u) u = {};
        if (u[n.id])
            return false;
        u[n.id] = true;

        if (cc === n) {
            return true;
        }

        if (n.welds) {
            for (var key in n.welds) {
                if (n.welds[key]) {
                    if (scan(n.welds[key].other, u)) {
                        return true;
                    }
                }
            }
        }

        return false;

    };

    var mark = function(n, flag, u) {

        if (!n)
            return false;

        if (!u) u = {};
        if (u[n.id])
            return false;
        u[n.id] = true;

        n.onCC = flag ? cc : null;

        if (n.welds) {
            for (var key in n.welds) {
                if (n.welds[key]) {
                    mark(n.welds[key].other, flag, u);
                }
            }
        }

        return false;

    };

    mark(a, scan(a));
    mark(b, scan(b));

};

BSWG.nextCompID = 1;
BSWG.component = function (desc, args) {

    this.handleInput = function(key) {};

    for (var key in desc)
        this[key] = desc[key];

    this.id = BSWG.nextCompID++;
    this.jpoints = new Array();
    this.jmatch = new Array();
    this.jmatch = -1;
    this.welds = new Object();
    this.onCC = null;
    if (this.type === 'cc')
        this.onCC = this;

    this.init(args);

    if (this.jpoints && this.jpoints.length && this.obj) {

        for (var i=0; i<this.jpoints.length; i++) {
            this.jpoints[i].x *= 1.0005;
            this.jpoints[i].y *= 1.0005;
        }

        this.jpointsNormals = new Array(this.jpoints.length);
        for (var i=0; i<this.jpointsNormals.length; i++) {
            this.jpointsNormals[i] = BSWG.physics.getNormalAt(this.obj, this.jpoints[i]);
        }

    }

    this.remove = function() {

        BSWG.componentList.remove(this);

    };

    this.removeSafe = function() {

        BSWG.componentList.compRemove.push(this);

    };

    this.baseRenderOver = function(ctx, cam, dt) {

        if (this.renderOver) {
            this.renderOver(ctx, cam, dt);
        }

        if (!this.jpointsw) {
            return;
        }

        if (this.dispKeys && BSWG.game.showControls && this.onCC === BSWG.game.ccblock) {
            for (var key in this.dispKeys) {
                var info = this.dispKeys[key];
                if (info) {
                    var text = info[0];
                    var rot = 0.0;

                    var p = BSWG.render.project3D(BSWG.physics.localToWorld(info[1], this.obj.body), 0.0);
                    var w = Math.floor(8 * 2 + ctx.textWidthB(text)+1.0);
                    ctx.globalAlpha = 0.25;
                    ctx.fillStyle = '#444';
                    BSWG.draw3DRect(ctx, p.x - w * 0.5, p.y - 10, w, 20, 3, info[2] || false);

                    ctx.save();

                    ctx.translate(Math.floor(p.x), Math.floor(p.y));
                    ctx.rotate(rot);
                    ctx.translate(0, 3);

                    ctx.font = '11px Orbitron';
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = info[2] ? '#fff' : '#000';
                    ctx.textAlign = 'center';
                    ctx.fillText(text, 0, 0);
                    ctx.textAlign = 'left';

                    ctx.restore();
                }
            }
        }

    };

    this.cacheJPW = function() {
        if (this.jpointsw) {
            this.jpointsw = null;
        }
        this.jpointsw = BSWG.physics.localToWorld(this.jpoints, this.obj.body);
        for (var i=0; i<this.jpoints.length; i++) {
            this.jpointsw[i].motorType = this.jpoints[i].motorType || 0;
        }
        this.jmhover = -1;
    };

    this.updateJCache = function() {

        if (!BSWG.game.editMode) {
            return;
        }

        if (!this.jpointsw) {
            return;
        }

        this.jmatch = new Array();
        this.jmhover = -1;

        var _p = this.obj.body.GetWorldCenter();
        var p = new b2Vec2(_p.x, _p.y);
        var cl = BSWG.componentList.withinRadius(p, this.obj.radius+0.5);

        var jpw = this.jpointsw;

        var mps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var mp = BSWG.render.unproject3D(mps, 0.0);

        var mind = 10.0;
        for (var i=0; i<jpw.length; i++) {
            var tp = jpw[i];
            var d = Math.pow(tp.x - mp.x, 2.0) +
                    Math.pow(tp.y - mp.y, 2.0);
            if (d < mind)
            {
                this.jmhover = i;
                mind = d;
            }
        }
        if (mind > BSWG.component_jMatchClickRange || BSWG.compActiveConfMenu) {
            this.jmhover = -1;
        }

        for (var i=0; i<cl.length; i++) {
            if (cl[i] !== this && BSWG.physics.bodyDistance(this.obj.body, cl[i].obj.body) < 1.0) {
                var jpw2 = cl[i].jpointsw;

                for (var k1=0; k1<jpw.length; k1++)
                    for (var k2=0; k2<jpw2.length; k2++)
                    {
                        var p1 = jpw[k1];
                        var p2 = jpw2[k2];
                        var d2 = Math.pow(p1.x - p2.x, 2.0) +
                                 Math.pow(p1.y - p2.y, 2.0);
                        if (((p1.motorType && !p2.motorType) || (p2.motorType && !p1.motorType) ||
                            (p1.motorType && p1.motorType === p2.motorType) ||
                            (p1.motorType && (p1.motorType%10) != (p2.motorType%10))) &&
                            !(p1.motorType === 61 && p2.motorType === 61)) {
                            continue;
                        }
                        if (d2 < BSWG.component_minJMatch) {
                            this.jmatch.push([
                                k1, cl[i], k2, p1.motorType || 0, p2.motorType || 0
                            ]);
                            if (cl[i].jmhover === k2) {
                                this.jmhover = k1;
                            }
                            else if (this.jmhover === k1) {
                                cl[i].jmhover = k2;
                            }
                            break;
                        }
                    }
            }
        }       
    }   

    this.baseUpdate = function(dt) {

        if (!BSWG.game.editMode) {
            return;
        }

        if (!this.jpointsw || !this.jmatch) {
            return;
        }

        if (this.jmhover >= 0 && BSWG.input.MOUSE_PRESSED('left') && !BSWG.input.MOUSE('shift')) {
            for (var i=0; i<this.jmatch.length; i++) {
                if (this.jmatch[i][0] === this.jmhover && this.jmatch[i][1].id > this.id) {
                    if (!this.welds[this.jmatch[i][0]]) {
                        var obj = BSWG.physics.createWeld(this.obj.body, this.jmatch[i][1].obj.body,
                                                          this.jpoints[this.jmatch[i][0]],
                                                          this.jmatch[i][1].jpoints[this.jmatch[i][2]],
                                                          true,
                                                          this.jpointsNormals[this.jmatch[i][0]],
                                                          this.jmatch[i][1].jpointsNormals[this.jmatch[i][2]],
                                                          this.jmatch[i][3],
                                                          this.jmatch[i][4],
                                                          [13,14,15,23,24,25,61].indexOf(this.jmatch[i][3]) >= 0
                                                          );

                        if (this.onCC && !this.jmatch[i][1].onCC) {
                            this.jmatch[i][1].onCC = this.onCC;
                        }
                        if (!this.onCC && this.jmatch[i][1].onCC) {
                            this.onCC = this.jmatch[i][1].onCC;
                        }

                        this.welds[this.jmatch[i][0]] = { obj: obj, other: this.jmatch[i][1] };
                        this.jmatch[i][1].welds[this.jmatch[i][2]] = { obj: obj, other: this };

                        BSWG.updateOnCC(this, this.jmatch[i][1]);

                        var p2 = this.jmatch[i][1].jpointsw[this.jmatch[i][2]];
                        var p1 = this.jpointsw[this.jmatch[i][0]];

                        BSWG.render.blueBoom.add(
                            BSWG.game.cam.wrapToScreen(BSWG.render.viewport, {x: (p1.x+p2.x)*0.5, y: (p1.y+p2.y)*0.5}),
                            BSWG.game.cam.wrapToScreenSize(BSWG.render.viewport, 0.75),
                            32,
                            0.4,
                            1.0
                        );

                        BSWG.input.EAT_MOUSE('left');
                    }
                    else {
                        BSWG.physics.removeWeld(this.welds[this.jmatch[i][0]].obj);
                        this.welds[this.jmatch[i][0]].other = null;
                        this.welds[this.jmatch[i][0]] = null;
                        this.jmatch[i][1].welds[this.jmatch[i][2]].other = null;
                        this.jmatch[i][1].welds[this.jmatch[i][2]] = null;  

                        BSWG.updateOnCC(this, this.jmatch[i][1]);

                        BSWG.render.boom.add(
                            BSWG.game.cam.wrapToScreen(BSWG.render.viewport, this.jpointsw[this.jmatch[i][0]]),
                            BSWG.game.cam.wrapToScreenSize(BSWG.render.viewport, 1.25),
                            32,
                            0.4,
                            1.0
                        );

                        BSWG.input.EAT_MOUSE('left');
                    }
                }
            }
        }

        for (var k in this.welds) {
            if (this.welds[k] && this.welds[k].obj.broken) {
                var other = this.welds[k].other;
                var k2;
                for (k2 in other.welds) {
                    if (other.welds[k2] && other.welds[k2].obj === this.welds[k].obj) {
                        BSWG.physics.removeWeld(this.welds[k].obj);
                        this.welds[k].other = null;
                        this.welds[k] = null;
                        other.welds[k2].other = null;
                        other.welds[k2] = null; 
                        BSWG.updateOnCC(this, other);
                        break;
                    }
                }
            }
        }

    };

    this.pointIn = function(p) {

        if (this.obj.type === 'multipoly') {

            for (var i=0; i<this.obj.fixture.length; i++) {
                if (!!this.obj.fixture[i].TestPoint(p)) {
                    return true;
                }
            }
            return false;
        }
        else {
            return !!this.obj.fixture.TestPoint(p);
        }

    };

    this.getLocalPoint = function(p) {

        var p2 = this.obj.body.GetLocalPoint(p);
        return new b2Vec2(p2.x, p2.y);

    };

    this.getWorldPoint = function(p) {

        var p2 = this.obj.body.GetWorldPoint(p);
        return new b2Vec2(p2.x, p2.y);

    };

    this.addForce = function (f, p) {

        if (!p)
            this.obj.body.ApplyForceToCenter(f);
        else
            this.obj.body.ApplyForce(f, p);

    };

    this.distanceTo = function (comp2) {
        return Math.distVec2(this.obj.body.GetWorldCenter(), comp2.obj.body.GetWorldCenter());
    };

    BSWG.componentList.add(this);

};

BSWG.componentList = new function () {

    this.compList = new Array();
    this.compRemove = new Array();

    this.clear = function () {

        while (this.compList.length) {
            this.compList[0].remove();
        }

        this.compRemove.length = 0;

    };

    this.add = function (comp) {

        this.compList.push(comp);
        this.compList.sort(function(a,b){

            return a.sortOrder - b.sortOrder;

        });
        return true;

    };

    this.remove = function (comp) {

        for (var i=0; i<this.compList.length; i++)
            if (this.compList[i] === comp) {
                this.compList.splice(i, 1);
                return true;
            }
        return false;

    };

    this.handleInput = function (cc, keys) {

        var len = this.compList.length;
        for (var i=0; i<len; i++) {
            if (!cc || this.compList[i].onCC === cc) {
                this.compList[i].handleInput(keys);
            }
        }

        if (this.mouseOver && this.mouseOver.openConfigMenu && this.mouseOver.onCC && BSWG.game.editMode) {
            if (BSWG.input.MOUSE_PRESSED('left') && BSWG.input.MOUSE('shift')) {
                BSWG.input.EAT_MOUSE('left');
                this.mouseOver.openConfigMenu();
            }
            else if (BSWG.input.MOUSE_PRESSED('right')) {
                BSWG.input.EAT_MOUSE('right');
                this.mouseOver.openConfigMenu();
            }

        }

    };

    this.update = function (dt) {

        var len = this.compList.length;
        for (var i=0; i<len; i++) {
            this.compList[i].cacheJPW();
        }
        for (var i=0; i<len; i++) {
            this.compList[i].updateJCache();
        }
        for (var i=0; i<len; i++) {
            this.compList[i].baseUpdate(dt);
            this.compList[i].update(dt);
        }

        len = this.compRemove.length;
        for (var i=0; i<len; i++) {
            this.remove(this.compRemove[i]);
        }
        this.compRemove.length = 0;

    };

    this.render = function (ctx, cam, dt) {

        var p = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var pw = BSWG.render.unproject3D(p, 0.0);
        var len = this.compList.length;

        this.mouseOver = null;
        for (var i=0; i<len; i++) {
            if (this.compList[i].confm && this.compList[i].confm === BSWG.compActiveConfMenu) {
                this.mouseOver = this.compList[i];
                break;
            }
            if (BSWG.game.grabbedBlock === this.compList[i]) {
                this.mouseOver = this.compList[i];
                break;
            }
        }
        if (!this.mouseOver) {
            this.mouseOver = this.atPoint(pw);
        }

        for (var i=0; i<len; i++) {
            this.compList[i].render(ctx, cam, dt);
        }
        for (var i=0; i<len; i++) {
            this.compList[i].baseRenderOver(ctx, cam, dt);
        }

        BSWG.jpointRenderer.render();
    };

    this.atPoint = function (p) {

        var raycaster = BSWG.render.raycaster;

        raycaster.set(new THREE.Vector3(p.x, p.y, 0.4), new THREE.Vector3(0.0, 0.0, -1.0));

        var len = this.compList.length;
        for (var i=0; i<len; i++) {
            if (raycaster.intersectObjects(this.compList[i].queryMeshes).length > 0) {
                return this.compList[i];
            }
        }
        return null;

    };

    this.makeQueryable = function (comp, mesh) {

        mesh.__compid = comp.id;
        comp.queryMeshes = comp.queryMeshes || new Array();
        comp.queryMeshes.push(mesh);
        return true;

    };

    this.removeQueryable = function (comp, mesh) {

        if (!comp.queryMeshes) {
            return false;
        }
        for (var i=0; i<comp.queryMeshes.length; i++) {
            if (comp.queryMeshes[i].__compid === comp.id) {
                comp.queryMeshes.splice(i, 1);
                return true;
            }
        }
        return false;

    };

    this.withinRadius = function (p, r) {
        var ret = new Array();
        var len = this.compList.length;
        for (var i=0; i<len; i++) {
            var p2 = this.compList[i].obj.body.GetWorldCenter();
            var dist = Math.pow(p2.x - p.x, 2.0) +
                       Math.pow(p2.y - p.y, 2.0);
            if (dist < Math.pow(r+this.compList[i].obj.radius, 2.0))
                ret.push(this.compList[i]);
        }
        return ret;
    }

}();