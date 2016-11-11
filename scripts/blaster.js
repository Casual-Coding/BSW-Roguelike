BSWG.blasterDmg = {
    1: 4.5,
    2: 10.0
}
BSWG.minigunDmg = {
    1: 1.25,
    2: 3.0
};
BSWG.railgunDmg = {
    1: 600
};

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
        takeDamage: function () { return 0; },
        combinedHP: function () { return 1000000; }
    };

    this.updateRender = function (ctx, cam, dt) {

        this.idx += 1;

        for (var i=0; i<this.list.length; i++) {

            var B = this.list[i];
            var ox = B.p.x, oy = B.p.y;
            B.p.x += B.v.x * dt;
            B.p.y += B.v.y * dt;
            B.t -= dt;

            for (var j=0; j<Math.floor(B.railgunCharge*40); j++) {
                var pt = Math.pow(Math._random(), 2.0);
                BSWG.render.boom.palette = chadaboom3D.fire;
                BSWG.render.boom.add(
                    new b2Vec2((ox-B.p.x)*pt+B.p.x, (oy-B.p.y)*pt+B.p.y).particleWrap(0.2),
                    (1.0+Math._random()*2.0)/2.0,
                    128,
                    2.5,
                    10.0,
                    new THREE.Vector3(0,0,0),
                    null,
                    Math._random() < 0.01
                );                
            }

            if (B.railgun) {
                var removed = false;
                while (B.rgPower > 0) {
                    var comp = null;
                    var ret = BSWG.componentList.withRay(B.lp.THREE(0.0), new b2Vec2(B.p.x+B.v.x*dt*2, B.p.y+B.v.y*dt*2).THREE(0.0));
                    comp = ret ? ret.comp : null;
                    if (ret && ret.d > Math.sqrt(B.v.x*B.v.x+B.v.y*B.v.y)*dt) {
                        comp = null;
                    }
                    if (!comp && BSWG.game.map && BSWG.game.map.getColMap(B.p)) {
                        comp = static;
                    }
                    if (B.source && comp && comp.type === 'shield' && comp.onCC === B.source.onCC) {
                        comp = null;
                    }
                    if (B.t <= 0.0 || comp) {
                        if (B.t <= 0.0 || comp !== B.source) {
                            var oPower = B.rgPower;
                            if (comp && comp !== B.source) {
                                comp.takeDamage(B.rgPower, B.source, true);
                                B.rgPower /= 2.0;
                            }
                            if (B.t > 0.0) {
                                BSWG.render.boom.palette = chadaboom3D.fire;
                                BSWG.render.boom.add(
                                    new b2Vec2((ox+B.p.x)*0.5, (oy+B.p.y)*0.5).particleWrap(0.2),
                                    4.0*oPower/BSWG.railgunDmg[B.railgun],
                                    128,
                                    0.5,
                                    1.5,
                                    comp.obj ? comp.obj.body.GetLinearVelocity().clone().THREE(0.0) : new THREE.Vector3(0., 0., 0.),
                                    null,
                                    comp && comp !== B.source
                                );
                            }
                            if (comp && comp.combinedHP() > 0) {
                                B.rgPower = 0.0;
                            }
                            if (B.t <= 0.0 || B.rgPower <= 0) {
                                B.source = null;
                                if (B.exaust) {
                                    B.exaust.remove();
                                    B.exaust = null;
                                }
                                this.list.splice(i, 1);
                                i -= 1;
                                removed = true;
                                break;
                            }
                        }
                    }
                    if (!comp || B.rgPower <= 0) {
                        break;
                    }
                }
                if (removed) {
                    continue;
                }
                B.lp.x = B.p.x;
                B.lp.y = B.p.y;
            }
            else {
                var comp = null;
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
                if (B.source && comp && comp.type === 'shield' && comp.onCC === B.source.onCC) {
                    comp = null;
                }
                if (B.t <= 0.0 || comp) {
                    if (B.t <= 0.0 || comp !== B.source) {
                        if (comp && comp !== B.source) {
                            comp.takeDamage(B.minigun ? BSWG.minigunDmg[B.minigun] : BSWG.blasterDmg[B.blasterSize], B.source, true);
                        }
                        if (B.t > 0.0) {
                            BSWG.render.boom.palette = (B.minigun || B.blasterSize === 2) ? chadaboom3D.fire : chadaboom3D.blue_bright;
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
            }

            var t = Math.min(B.t * 4.0, 1.0);

            var p = cam.toScreen(BSWG.render.viewport, B.p);

            if (!B.exaust) {
                B.exaust = new BSWG.exaust(B.p, null, 0.25*(B.minigun||1+(B.railgun||0)*0.5)*B.blasterSize, 0, 0.05, (B.railgun || B.blasterSize === 2) ? BSWG.exaustFire : (B.minigun ? BSWG.exaustWhite : BSWG.exaustBlue), B.minigun, B.blasterSize);
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

    this.add = function (p, v, baseV, source, minigun, railgun, railgunCharge, blasterSize) {

        BSWG.render.boom.palette = chadaboom3D.fire;
        BSWG.render.boom.add(
            p.particleWrap(0.2),
            1.0 * (minigun || 1),
            32,
            0.4,
            1.0,
            baseV.THREE(0.0)
        );

        this.list.push({

            p: p,
            v: v,
            t: minigun ? 0.75 : 1.5,
            lp: p.clone(),
            source: source,
            off: ~~(Math._random() * 3),
            minigun: minigun || null,
            railgun: railgun || null,
            railgunCharge: railgunCharge || null,
            rgPower: railgun ? (BSWG.railgunDmg[railgun]*railgunCharge) : null,
            blasterSize: blasterSize || 1

        });

        if (minigun) {
            new BSWG.soundSample().play('minigun-fire', p.THREE(0.2), 0.5/minigun, (Math._random()*0.1+0.35)*3.0/minigun);
        }
        else if (railgun) {
            new BSWG.soundSample().play('railgun-fire', p.THREE(0.2), 12.5/railgun*railgunCharge, (Math._random()*0.1+0.35)*0.5/railgun);
            BSWG.render.addScreenShake(p.THREE(0.2), 350.0*railgunCharge);
        }
        else {
            new BSWG.soundSample().play('blaster', p.THREE(0.2), 1.0*(blasterSize||1), (Math._random()*0.1+0.35)/((blasterSize||1)*0.5+0.5));
        }

    };

}();