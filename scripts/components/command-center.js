// BSWR - Command Center component

BSWG.component_CommandCenter = {

    type: 'cc',

    sortOrder: 2,

    hasConfig: false,

    init: function(args) {

        this.width  = 2;
        this.height = 3;

        this.moveT = 0.0;

        this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
            width:  this.width,
            height: this.height,
            smooth: 0.02
        });

        this.dispKeys = {
            'left': [ 'Left', new b2Vec2(-0.3 * this.width, 0.0) ],
            'right': [ 'Right', new b2Vec2(0.3 * this.width, 0.0) ],
            'forward': [ 'Up', new b2Vec2(0.0, -this.height * 0.4) ],
            'reverse': [ 'Down', new b2Vec2(0.0, this.height * 0.4) ]
        };

        this.jpoints = BSWG.createBoxJPoints(this.width, this.height);

        //BSWG.blockPolySmooth = 0.02;

        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.8);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        BSWG.blockPolySmooth = 0.1;

        var poly = [
            new b2Vec2(-this.width * 0.5 * 0.75, -this.height * 0.5 * 0.0),
            new b2Vec2( this.width * 0.5 * 0.75, -this.height * 0.5 * 0.0),
            new b2Vec2( this.width * 0.3 * 0.75, -this.height * 0.5 * 0.75),
            new b2Vec2(-this.width * 0.3 * 0.75, -this.height * 0.5 * 0.75)
        ].reverse();
        this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body }, 0.8, new b2Vec2(0, -this.height * 0.5 * 0.75 * 0.5), 0.7);
        BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);
        
        var poly = [
            new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
            new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
            new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.05),
            new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.05)
        ].reverse();

        this.meshObj3 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body }, 0.8, new b2Vec2(0, this.height * 0.5 * 0.8 * 0.5), 0.7);
        BSWG.componentList.makeQueryable(this, this.meshObj3.mesh);

        BSWG.blockPolySmooth = null;
    },

    render: function(ctx, cam, dt) {

        if (this.moveT >= 0) {
            this.moveT -= dt;
        }
        else {
            this.moveT = 0.0;
        }

        if (this.grabT >= 0) {
            this.grabT -= dt;
        }
        else {
            this.grabT = 0.0;
        }

        this.meshObj.update([0.85, 0.85, 0.85, 1]);
        var l = (this.grabT/0.3) * 0.25 + 0.5;
        this.meshObj3.update([l, l, 0.68, 1], 3.0);
        var l = (this.moveT/0.3) * 0.25 + 0.35;
        this.meshObj2.update([l, 0.8, 0.9, 1], 3.0);

        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
    },

    update: function(dt) {

        this.dispKeys['left'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.LEFT);
        this.dispKeys['right'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.RIGHT);
        this.dispKeys['forward'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.UP);
        this.dispKeys['reverse'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.DOWN);

    },

    handleInput: function(keys) {

        var rot = 0;
        var accel = 0;

        if (keys[BSWG.KEY.LEFT]) rot -= 1;
        if (keys[BSWG.KEY.RIGHT]) rot += 1;

        if (keys[BSWG.KEY.UP]) accel -= 1;
        if (keys[BSWG.KEY.DOWN]) accel += 1;

        if (rot) {
            this.obj.body.SetAwake(true);
            this.obj.body.ApplyTorque(-rot*7.0);
            this.moveT = 0.21;
        }
        
        if (accel) {
            var a = this.obj.body.GetAngle() + Math.PI/2.0;
            accel *= 5.0;
            this.obj.body.SetAwake(true);
            var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
            this.obj.body.ApplyForceToCenter(force);
            this.moveT = 0.21;
        }

    },

};