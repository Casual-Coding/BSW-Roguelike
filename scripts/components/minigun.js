// BSWR - Minigun component

BSWG.component_Minigun = {

    type: 'minigun',
    name: 'Minigun',

    maxHP: 40,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'size',
        'fireKey', 'fireKeyAlt'
    ],

    sbkey: [
        'size'
    ],

    sbadd: [
        { title: 'Size 1', size: 1, value: 25 },
        { title: 'Size 2', size: 2, value: 50 }
    ],

    frontOffset: Math.PI/2 + Math.PI,

    category: 'weapon',

    getIconPoly: function (args) {
        var ret = [];
        var size = args.size || 1;
        ret.push(Math.smoothPoly([
            new b2Vec2(size * -0.30 * 1.5, size * -0.125 * 1.5),
            new b2Vec2(size *  0.0  * 1.5, size * -0.125  * 1.5),
            new b2Vec2(size *  0.6  * 1.5, size * -0.05  * 1.5),
            new b2Vec2(size *  0.6  * 1.5, size *  0.05  * 1.5),
            new b2Vec2(size *  0.0  * 1.5, size *  0.125  * 1.5),
            new b2Vec2(size * -0.30 * 1.5, size *  0.125 * 1.5)
        ], 0.02));
        var circle = [];
        var nPoints = [12, 18][size-1];
        var c = new b2Vec2(0.15 * size, 0.0);
        var r = 0.35 * size;
        for (var  i=0; i<nPoints; i++) {
            var a = i/nPoints * Math.PI * 2.0;
            circle.push(new b2Vec2(
                c.x + r * Math.cos(a) * 0.95,
                c.y + r * Math.sin(a)
            ));
        }
        ret.push(circle);
        return ret;
    },

    init: function(args) {

        var offsetAngle = this.offsetAngle = 0.0;

        var size = this.size = args.size || 1;

        var overs = null;
        var verts = Math.smoothPoly(overts = [
            new b2Vec2(size * -0.30 * 1.5, size * -0.125 * 1.5),
            new b2Vec2(size *  0.0  * 1.5, size * -0.125  * 1.5),
            new b2Vec2(size *  0.6  * 1.5, size * -0.05  * 1.5),
            new b2Vec2(size *  0.6  * 1.5, size *  0.05  * 1.5),
            new b2Vec2(size *  0.0  * 1.5, size *  0.125  * 1.5),
            new b2Vec2(size * -0.30 * 1.5, size *  0.125 * 1.5)
        ], 0.02);

        this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
            verts: verts
        });

        this.maxHP = [40, 120][size-1];

        this.fireKey = args.fireKey || BSWG.KEY.SPACE;
        this.fireKeyAlt = args.fireKeyAlt || this.fireKey;
        this.dispKeys = {
            'fire': [ '', new b2Vec2(0.0, 0.0) ],
        };

        var circle = [];
        var nPoints = [12, 18][size-1];
        var c = new b2Vec2(0.15 * size, 0.0);
        var r = 0.35 * size;
        for (var  i=0; i<nPoints; i++) {
            var a = i/nPoints * Math.PI * 2.0;
            circle.push(new b2Vec2(
                r * Math.cos(a) * 0.95,
                r * Math.sin(a)
            ));
        }
        this.circleOffset = c;

        this.jpoints = BSWG.createPolyJPoints(overts, [1, 2, 3], false);

        this.thrustT = 0.0;
        this.kickBack = 0.0;

        BSWG.bpmReflect = 0.5;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.4 * size, new b2Vec2(-.35*size, 0));
        BSWG.bpmReflect = 0.75;
        //BSWG.bpmSmoothNormals = true;
        BSWG.bpmRotating = true;
        this.meshObj2 = BSWG.generateBlockPolyMesh({body: this.obj.body, verts: circle, comp: this}, 0.4, new b2Vec2(0, 0), -0.1);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.xpBase = 0.025 * Math.pow(size, 2);

        this.wheelRot = 0.0;
        this.wheelSpeed = 0.0;

    },

    destroy: function() {

        this.meshObj.destroy();
        this.meshObj2.destroy();
        this.selMeshObj.destroy();
        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }

    },

    render: function(ctx, cam, dt) {

        ctx.fillStyle = '#600';

        if (this.kickBack > 0.0) {
            BSWG.drawBlockPolyOffset = Math.rotVec2(new b2Vec2(0.0, -this.kickBack*0.2), this.obj.body.GetAngle() - Math.PI/2);
            this.kickBack *= 0.9;
        }
        else {
            this.kickBack = 0.0;
        }

        this.meshObj.update([1.0, 0.3, 0.1, 1], 4, BSWG.compAnchored(this));
        this.meshObj2.update([0.75, 0.75, 0.75, 1], 3, BSWG.compAnchored(this), this.wheelRot, this.circleOffset);
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);
        BSWG.drawBlockPolyOffset = null;
        
        //BSWG.drawBlockPoly(ctx, this.obj, 0.5, null, BSWG.componentHoverFn(this));

    },

    update: function(dt) {

        if (!this.sound) {
            this.sound = new BSWG.soundSample();
            this.sound.play('minigun', this.obj.body.GetWorldCenter().THREE(0.2), 1.0, Math._random()*0.1+0.5/this.size, true);
        }

        if (this.dispKeys) {
            if (this.fireKey !== this.fireKeyAlt) {
                this.dispKeys['fire'][0] = BSWG.KEY_NAMES[this.fireKey].toTitleCase() + ' / ' + BSWG.KEY_NAMES[this.fireKeyAlt].toTitleCase();
            }
            else {
                this.dispKeys['fire'][0] = BSWG.KEY_NAMES[this.fireKey].toTitleCase();
            }
            this.dispKeys['fire'][2] = BSWG.input.KEY_DOWN(this.fireKey) || BSWG.input.KEY_DOWN(this.fireKeyAlt);
        }

        if (this.firing && this.onCC) {
            this.wheelSpeed += BSWG.render.dt * 0.8*25/this.size;
            if (this.wheelSpeed > 3*18) {
                this.wheelSpeed = 3*18;
            }
        }
        else {
            this.firing = false;
            this.wheelSpeed -= BSWG.render.dt * 0.6*25/this.size;
            if (this.wheelSpeed < 0) {
                this.wheelSpeed = 0.0;
            }
        }
        var owt = Math.atan2(Math.sin(this.wheelRot), Math.cos(this.wheelRot));
        this.wheelRot += this.wheelSpeed * dt;
        var wt = Math.atan2(Math.sin(this.wheelRot), Math.cos(this.wheelRot));

        if (owt < 0 && wt >= 0 && this.firing) {

            var accel = 0;

            var pl = new b2Vec2(this.size * 0.6 * 1.5);
            var a = this.obj.body.GetAngle() - Math.PI;
            var v = this.obj.body.GetLinearVelocityFromLocalPoint(pl);
            var p = BSWG.physics.localToWorld([pl], this.obj.body);
            p[0].x -= v.x*0.01;
            p[0].y -= v.y*0.01;

            BSWG.blasterList.add(p[0], new b2Vec2(-Math.cos(a)*90.0 + v.x, -Math.sin(a)*90.0 + v.y), v, this, this.size);
            accel = 1;

            this.fireT = 1.15 / 2;
            this.kickBack = 1.0;

            p[0] = null;
            p = null;
        
            if (accel)
            {
                var a = this.obj.body.GetAngle();
                accel *= 4.0;
                this.obj.body.SetAwake(true);
                var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
                this.obj.body.ApplyForceToCenter(force);    
                this.thrustT = 0.3;
                force = null;
            }

        }

        this.sound.volume(Math.clamp(this.wheelSpeed/100,0,1) * (this.size/2) * 2.0);
        this.sound.rate(Math.clamp(this.wheelSpeed/200,0.05,1) / (this.size/2) * 8.0);
        this.sound.position(this.obj.body.GetWorldCenter().THREE(0.2));

        if (this.fireT) {
            this.fireT -= dt;
            if (this.fireT <= 0)
                this.fireT = 0.0;
        }

    },

    openConfigMenu: function() {

        if (BSWG.compActiveConfMenu)
            BSWG.compActiveConfMenu.remove();

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 450, h: 50+32,
            key: this.fireKey,
            altKey: this.fireKeyAlt,
            title: 'Minigun fire',
            close: function (key, alt) {
                if (key) {
                    if (alt) {
                        self.fireKeyAlt = key;
                    }
                    else {
                        if (self.fireKey === self.fireKeyAlt) {
                            self.fireKeyAlt = key;
                        }
                        self.fireKey = key;
                    }
                }
            }
        });

    },

    closeConfigMenu: function() {

    },

    handleInput: function(keys) {

        var accel = 0;

        this.firing = false;
        if (keys[this.fireKey] || keys[this.fireKeyAlt]) {
            this.firing = true;
        }
        
        if (accel)
        {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= -8.0;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);    
            this.thrustT = 0.3;
            force = null;
        }

    },

};