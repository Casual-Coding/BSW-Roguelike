BSWG.draw3DRect = function(ctx, x1, y1, w, h, insz, pressedIn, outline) {

    ctx.save();

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
    ctx.fillStyle = '#aaf';

    for (var i=0; i<len; i++) {
        var j = (i+1) % len;

        var a = overts[i], b = overts[j],
            c = iverts[j], d = iverts[i];

        var angle = Math.atan2(b.y - a.y, b.x - a.x);
        var alpha = Math.sin(angle + Math.PI/4.0) * 0.5 + 0.5;
        ctx.globalAlpha = oAlpha * alpha * 0.6;

        var grad = ctx.createLinearGradient(a.x,a.y, c.x,c.y);
        grad.addColorStop(0,"#aaf");
        grad.addColorStop(1,"#668");

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
        grad.addColorStop(1,"#223");
    }
    else
    {
        grad.addColorStop(0,"#aaf");
        grad.addColorStop(1,"#779");        
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

    ctx.restore();

};

BSWG.control_Button = {

    render: function (ctx, viewport) {

        ctx.font = '16px Orbitron';

        if (this.selected) {
            ctx.strokeStyle = '#484';
        }
        else {
            ctx.strokeStyle = '#888';
        }

        if (this.selected) {
            ctx.fillStyle = 'rgba(60,60,100,1)';
        }
        else {
            ctx.fillStyle = 'rgba(35,35,50,1)';
        }
            
        ctx.lineWidth = 2.0;

        BSWG.draw3DRect(ctx, this.p.x, this.p.y, this.w, this.h, 10, this.selected, this.mouseIn ? 'rgba(255,255,255,0.45)' : null);

        ctx.lineWidth = 1.0;

        ctx.textAlign = 'center';
        if (this.selected) {
            ctx.fillStyle = '#ddf';
        }
        else {
            ctx.fillStyle = '#fff';
        }

        ctx.strokeStyle = '#111';
        ctx.fillTextB(this.text, this.p.x + this.w*0.5, this.p.y + this.h*0.5+6);

        ctx.textAlign = 'left';

    },

    update: function () {

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
            this.textObj.destroy();
            this.textObj = null;
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

        ctx.strokeStyle = '#8f8';
        ctx.fillStyle = 'rgba(25,50,25,1.0)';

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

    this.init(args);

    this.remove = function () {

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

        if (mx >= this.p.x && my >= this.p.y && mx < (this.p.x + this.w) && my < (this.p.y + this.h))
            this.mouseIn = true;
        else
            this.mouseIn = false;

        if (this.mouseIn && this.click && BSWG.input.MOUSE_PRESSED('left'))
        {
            this.click(this);
        }

        this.update();

        if (this.mouseIn && !this.noEat) {
            BSWG.input.EAT_MOUSE('left');
            BSWG.input.EAT_MOUSE('right');
            BSWG.input.EAT_MOUSE('middle');
        }

    };

};

BSWG.ui = new function () {

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