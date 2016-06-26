BSWG.blasterDmg = 3.0;

BSWG.blasterList = new function () {

    this.list = [];
    this.clear = function () {
        while (this.list.length > 0) {
            if (this.list[0].exaust) {
                this.list[0].exaust.remove();
                this.list[0].exaust = null;
            }
            this.list.splice(0, 1);
        }
        this.list.length = 0;
    };

    this.idx = 0;

    var static = {
        takeDamage: function () {}
    };

    this.updateRender = function (ctx, cam, dt) {

        this.idx += 1;

        for (var i=0; i<this.list.length; i++) {

            var B = this.list[i];
            var ox = B.p.x, oy = B.p.y;
            B.p.x += B.v.x * dt;
            B.p.y += B.v.y * dt;
            B.t -= dt;
            var comp = null;
            //if ((this.idx % 3) === B.off) {
                var ret = BSWG.componentList.withRay(B.lp.THREE(0.0), new b2Vec2(B.p.x+B.v.x*dt*2, B.p.y+B.v.y*dt*2).THREE(0.0));
                B.lp.x = B.p.x;
                B.lp.y = B.p.y;
                comp = ret ? ret.comp : null;
                if (ret && ret.d > Math.sqrt(B.v.x*B.v.x+B.v.y*B.v.y)*dt) {
                    comp = null;
                }
                if (!comp && BSWG.game.map && BSWG.game.map.getColMap(B.p)) {
                    comp = static;
                }
            //}
            if (B.t <= 0.0 || comp) {
                if (B.t <= 0.0 || comp !== B.source) {
                    if (comp && comp !== B.source) {
                        comp.takeDamage(BSWG.blasterDmg, B.source, true);
                    }
                    if (B.t > 0.0) {
                        BSWG.render.boom.palette = chadaboom3D.blue_bright;
                        BSWG.render.boom.add(
                            new b2Vec2((ox+B.p.x)*0.5, (oy+B.p.y)*0.5).particleWrap(0.2),
                            2.0,
                            32,
                            0.5,
                            1.5,
                            comp.obj ? comp.obj.body.GetLinearVelocity().clone().THREE(0.0) : new THREE.Vector3(0., 0., 0.),
                            null,
                            comp && comp !== B.source
                        );
                    }
                    B.source = null;
                    if (B.exaust) {
                        B.exaust.remove();
                        B.exaust = null;
                    }
                    this.list.splice(i, 1);
                    i -= 1;
                    continue;
                }
            }

            var t = Math.min(B.t * 4.0, 1.0);

            var p = cam.toScreen(BSWG.render.viewport, B.p);

            if (!B.exaust) {
                B.exaust = new BSWG.exaust(B.p, null, 0.25, 0, 0.05, BSWG.exaustBlue);
            }

            B.exaust.strength = Math.clamp(t * 3.0, 0., 1.);
            B.exaust.angle = Math.atan2(B.p.y - oy, B.p.x - ox) + Math.PI;

            /*BSWG.render.boom.palette = chadaboom3D.blue_bright;
            BSWG.render.boom.add(
                new b2Vec2((ox+B.p.x)*0.5, (oy+B.p.y)*0.5).particleWrap(0.2),
                1.5,
                16,
                0.125,
                1.5,
                new b2Vec2(B.v.x*0.85, B.v.y*0.85).THREE(0.0)
            );*/

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
            t: 1.5,
            lp: p.clone(),
            source: source,
            off: ~~(Math._random() * 3)

        });

        new BSWG.soundSample().play('blaster', p.THREE(0.2), 1.0, Math._random()*0.1+0.35);

    };

}();