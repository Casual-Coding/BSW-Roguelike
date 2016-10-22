BSWG.xpDisplay = new (function(){

    this.list = new Array();
    this.luText = null;

    this.clear = function () {
        this.list.length = 0;
        this.xpInfo = null;

        if (this.luText) {
            this.luText.remove();
            this.luText.destroy();
        }

        this.luT = 0.0;

        this.luText = new BSWG.uiControl(BSWG.control_3DTextButton, {
            x: BSWG.render.viewport.w*0.5, y: BSWG.render.viewport.h * 0.55,
            w: 800, h: 100,
            vpXCenter: true,
            text: 'Level Up',
            color: [1.5, 1.5, 0, 1],
            hoverColor: [1.5, 1.5, 0, 1],
            lowDetail: true,
            hoverClickSound: false,
            click: function (me) {}
        });
        this.luText.hide();
    };

    this.xpInfo = null;

    this.updateRender = function (ctx, cam, dt) {

        if (!this.xpInfo) {
            return;
        }

        if (this.luText) {
            this.luText.p.y = BSWG.render.viewport.h * 0.55;
        }

        for (var i=0; i<this.list.length; i++) {
            var L = this.list[i];
            var p = BSWG.render.project3D(L.p);
            var sz = Math.floor(Math.max(BSWG.render.viewport.w, BSWG.render.viewport.h) * 0.0075);

            L.given += L.amt * dt / 1.5;
            if (L.given >= 1 && L.tgiven < L.amt) {
                var give = Math.floor(L.given);
                L.tgiven += give;
                if (L.tgiven >= L.amt) {
                    give -= L.tgiven - L.amt;
                    give = Math.max(Math.floor(give), 0);
                    L.tgiven = L.amt;
                }
                if (give > 0) {
                    this.xpInfo.giveXP(give);
                    L.given -= give;
                    if (L.given < 0) {
                        L.given = 0;
                    }
                }
            }

            L.t -= dt;

            ctx.globalAlpha = Math.clamp(L.t, 0, 1);
            ctx.fillStyle = '#ff0';
            ctx.strokeStyle = '#fff';
            ctx.font = sz + 'px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillTextB('+' + L.amt + ' XP', p.x, p.y + (sz*0.5), true);
            ctx.globalAlpha = 1.0;

            p = null;

            if (L.t <= 0) {
                this.list.splice(i, 1);
                i -= 1;
                L = null;
                continue;
            }

            L = null;
        }

        if (this.luText && this.xpInfo.levelUp) {
            this.luText.show();
            this.luT = 5.0;
            new BSWG.soundSample().play('levelup', null, 0.65, 1.0);
            this.xpInfo.levelUp = false;
        }

        if (this.luT > 0) {
            this.luT -= dt;
            if (this.luT <= 0) {
                this.luT = 0.0;
                this.luText.hide();
            }
            else {
                this.luText.textColor[3] = this.luText.hoverColor[3] = Math.min(this.luT, 1.0);
            }
        }

    };

    this.giveXP = function (amt, p) {

        if (!this.xpInfo) {
            return;
        }

        amt = Math.max(1, Math.floor(amt));
        if (!amt) {
            return;
        }

        this.list.push({
            p: p,
            amt: amt,
            given: 0,
            tgiven: 0,
            t: 3.0
        });

    };

})();