BSWG.blasterDmg = 3.5;

BSWG.blasterList = new function () {

    this.list = [];
    this.clear = function () {
        this.list.length = 0;
    };

    this.updateRender = function (ctx, cam, dt) {

        for (var i=0; i<this.list.length; i++) {

            var B = this.list[i];
            var ox = B.p.x, oy = B.p.y;
            B.p.x += B.v.x * dt;
            B.p.y += B.v.y * dt;
            B.t -= dt;

            var comp = null;
            if (B.t <= 0.0 || (comp=BSWG.componentList.atPoint(B.p))) {
                if (B.t <= 0.0 || comp !== B.source) {
                    if (comp && comp !== B.source) {
                        comp.takeDamage(BSWG.blasterDmg, comp, true);
                    }
                    if (B.t > 0.0) {
                        BSWG.render.boom.palette = chadaboom3D.blue_bright;
                        BSWG.render.boom.add(
                            new b2Vec2((ox+B.p.x)*0.5, (oy+B.p.y)*0.5).particleWrap(0.2),
                            2.2,
                            32,
                            1.0,
                            1.5,
                            comp.obj.body.GetLinearVelocity().clone().THREE(0.0)
                        );
                    }
                    B.source = null;
                    this.list.splice(i, 1);
                    i -= 1;
                    continue;
                }
            }

            var t = Math.min(B.t * 4.0, 1.0);

            var p = cam.toScreen(BSWG.render.viewport, B.p);

            BSWG.render.boom.palette = chadaboom3D.blue_bright;
            BSWG.render.boom.add(
                new b2Vec2((ox+B.p.x)*0.5, (oy+B.p.y)*0.5).particleWrap(0.2),
                0.75,
                16,
                0.2,
                1.5,
                new b2Vec2(B.v.x*0.65, B.v.y*0.65).THREE(0.0)
            );

            /*ctx.lineWidth = 2.5;
            ctx.globalAlpha = t * 0.75;
            ctx.strokeStyle = Math.random() < 0.5 ? '#fff' : '#f11';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - B.v.x * dt * cam.z * 5000.0, p.y + B.v.y * dt * cam.z * 5000.0);
            ctx.stroke();*/
        }
        //ctx.globalAlpha = 1.0;
        //ctx.lineWidth = 1.0;

    };

    this.add = function (p, v, baseV, source) {

        BSWG.render.boom.palette = chadaboom3D.fire;
        BSWG.render.boom.add(
            p.particleWrap(0.2),
            1.0,
            32,
            0.4,
            1.0,
            baseV.THREE(0.0)
        );

        this.list.push({

            p: p,
            v: v,
            t: 4.0,
            source: source

        });

    };

}();