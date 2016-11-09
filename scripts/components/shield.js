// BSWR - Shield Component

BSWG.shieldSizeFactor = 3.0;

BSWG.component_Shield = {

    type: 'shield',
    name: 'Shields',

    maxHP: 50,

    sortOrder: 2,

    hasConfig: true,

    serialize: [
        'onKey',
        'onKeyAlt',
        'size'
    ],

    sbkey: [
        'size'
    ],

    sbadd: [
        { title: 'Size 1', size: 1, value: 100 },
        { title: 'Size 2', size: 2, value: 250 },
        { title: 'Size 3', size: 3, value: 600 }
    ],

    frontOffset: Math.PI/2,

    category: 'block',

    getIconPoly: function (args) {
        var width    = args.size || 1;
        var height   = args.size || 1;

        width *= 0.5;
        height *= 0.5;

        var verts = [
            new b2Vec2(-width * 0.5, -height * 0.5),
            new b2Vec2( width * 0.5, -height * 0.5),
            new b2Vec2( width * 0.5,  height * 0.5),
            new b2Vec2(-width * 0.5,  height * 0.5)
        ];

        var cverts = [   
        ];

        for (var i=0; i<24; i++) {
            var a = i/24*Math.PI*2;
            cverts.push(
                new b2Vec2(Math.cos(a)*width*1.5, Math.sin(a)*height*1.5)
            );
        }

        return [cverts, Math.smoothPoly(verts, 0.03)];
    },

    init: function(args) {

        this.size = args.size || 1;
        this.maxHP = this.size * this.size * 250 / 2.5;
        this.maxShieldEnergy = this.maxHP * BSWG.shieldSizeFactor * 2;
        this.shieldEnergy = this.maxShieldEnergy;

        this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
            width:    this.size,
            height:   this.size,
            triangle: false,
            smooth:   0.03
        });

        this.jpoints = BSWG.createBoxJPoints(this.size, this.size, false);

        var defKey = BSWG.KEY.Q;

        this.onKey = args.onKey || defKey;
        this.onKeyAlt = args.onKeyAlt || this.onKey;
        this.dispKeys = {
            'toggle': [ '', new b2Vec2(0.0, 0.0) ],
        };

        BSWG.bpmReflect = 0.8;
        BSWG.bpmSmoothNormals = true;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.05);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

        this.xpBase = 0.05 * this.size * this.size;

        this.shieldR = 0.01;
        this.shieldAlpha = 0.0;

        this.shieldOn = false;

        this.shmat = BSWG.render.newMaterial("basicVertex", "torpedoFragment", {
            clr: {
                type: 'v4',
                value: new THREE.Vector4(0, .5, 1, 0)
            },
        }, THREE.AdditiveBlending, THREE.DoubleSide);
        this.shmat.transparent = true;
        this.shmat.needsUpdate = true;
        this.shsmat = BSWG.render.newMaterial("basicVertex", "shadowFragment", {
        }, THREE.NormalBlending, THREE.DoubleSide);
        this.shgeom = BSWG.shieldGeom;
        this.shmesh = new THREE.Mesh(BSWG.shieldGeom, this.shmat);
        this.shmesh.renderOrder = 1600.0;
        BSWG.render.scene.add(this.shmesh);
        this.shsmesh = new THREE.Mesh(BSWG.shieldGeom, this.shsmat);
        //BSWG.render.sceneS.add(this.shsmesh);

    },

    destroy: function() {

        if (this.shieldObj) {
            this.removeShield();
        }
        this.meshObj.destroy();
        this.selMeshObj.destroy();

        BSWG.render.scene.remove(this.shmesh);
        //BSWG.render.sceneS.remove(this.shsmesh);

        this.shmesh.material = null;
        this.shmesh.geometry = null;
        this.shsmesh.material = null;
        this.shsmesh.geometry = null;
        this.shmat.dispose();
        this.shsmat.dispose();
        this.shmat = null;
        this.shsmat = null;
        this.shmesh = null;
        this.shsmesh = null;

    },

    render: function(ctx, cam, dt) {

        this.meshObj.update([0.4, 0.5, this.shieldEnergy / this.maxShieldEnergy, 1], 4, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

        this.shmesh.position.set(this.meshObj.mesh.position.x, this.meshObj.mesh.position.y, this.meshObj.mesh.position.z);
        this.shsmesh.position.set(this.meshObj.mesh.position.x, this.meshObj.mesh.position.y, this.meshObj.mesh.position.z);
        this.shmesh.rotation.set(0, 0, this.obj.body.GetAngle(), 'ZXY');
        this.shsmesh.rotation.set(0, 0, this.obj.body.GetAngle(), 'ZXY');

        this.shmesh.scale.set(this.shieldR, this.shieldR, this.shieldR);
        this.shsmesh.scale.set(this.shieldR, this.shieldR, this.shieldR);

        this.shmat.uniforms.clr.value.set(0, .5, 1, this.shieldAlpha*0.4);
    },

    addShield: function() {
        if (this.shieldObj || !this.obj || !this.obj.body || this.destroyed) {
            return;
        }

        this.shieldObj = BSWG.physics.createObject('circle', this.obj.body.GetWorldCenter().clone(), 0, {
            radius:   this.size * BSWG.shieldSizeFactor,
            friction: 0.005,
            density:  0.05
        });

        if (this.shieldObj) {
            this.shieldObj.comp = this;
            if (this.shieldObj.body) {
                this.shieldObj.body.__comp = this;
                this.shieldObj.body.__shielding = this.onCC;
            }
        }

        this.shieldWeld = BSWG.physics.createWeld(this.obj.body, this.shieldObj.body, new b2Vec2(0,0), new b2Vec2(0,0), true, null, null, true, false);

        if (this.shieldObj.body) {
            this.shieldObj.body.SetLinearVelocity(this.obj.body.GetLinearVelocity().clone());
        }

        BSWG.componentList.makeQueryable(this, this.shmesh);
    },

    removeShield: function() {
        if (!this.shieldObj) {
            return;
        }

        BSWG.physics.removeObject(this.shieldObj);

        this.shieldObj = null;
        this.shieldWeld = null;

        BSWG.componentList.removeQueryable(this, this.shmesh, true);  
    },

    update: function(dt) {

        if (this.dispKeys) {
            if (this.onKey !== this.onKeyAlt) {
                this.dispKeys['toggle'][0] = BSWG.KEY_NAMES[this.onKey].toTitleCase() + ' / ' + BSWG.KEY_NAMES[this.onKeyAlt].toTitleCase();
            }
            else {
                this.dispKeys['toggle'][0] = BSWG.KEY_NAMES[this.onKey].toTitleCase();
            }
            this.dispKeys['toggle'][2] = BSWG.input.KEY_DOWN(this.onKey) || BSWG.input.KEY_DOWN(this.onKeyAlt);
        }

        if (this.onCC && !this.destroyed && this.obj && this.obj.body) {
            if (this.shieldOn) {
                this.shieldEnergy -= dt * this.maxShieldEnergy / 30;
                if (this.shieldEnergy < this.maxShieldEnergy * (1/3)) {
                    this.shieldEnergy = 0;
                    this.shieldOn = false;
                }
            }
            else {
                this.shieldEnergy += dt * this.maxShieldEnergy / 30;
            }
        }
        else {
            this.shieldOn = false;
        }

        if (this.empDamp < 0.5) {
            this.shieldOn = false;
        }

        this.shieldEnergy = Math.clamp(this.shieldEnergy, 0, this.maxShieldEnergy);

        var talpha = 0.0;

        if (this.shieldOn) {
            if (!this.shieldObj) {
                this.addShield();
            }
            this.shieldR += ((BSWG.shieldSizeFactor * this.size) - this.shieldR) * Math.min(dt*8, 1.0);
            talpha = Math.clamp(((this.shieldEnergy / this.maxShieldEnergy) - (1/3)) * 4, 0, 1);
        }
        else {
            if (this.shieldObj) {
                this.removeShield();
            }
            this.shieldR += (0.01 - this.shieldR) * Math.min(dt*8, 1.0);
            talpha = 1.0;
        }

        talpha *= Math.min(this.shieldR, this.size);

        this.shieldAlpha += (talpha - this.shieldAlpha) * Math.min(dt*8, 1.0);

    },

    openConfigMenu: function() {

        if (BSWG.compActiveConfMenu)
            BSWG.compActiveConfMenu.remove();

        var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

        var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 450, h: 50+32,
            key: this.onKey,
            altKey: this.onKeyAlt,
            title: 'Toggle Shield',
            close: function (key, alt) {
                if (key) {
                    if (alt) {
                        self.onKeyAlt = key;
                    }
                    else {
                        if (self.onKey === self.onKeyAlt) {
                            self.onKeyAlt = key;
                        }
                        self.onKey = key;
                    }
                }
            }
        });

    },

    closeConfigMenu: function() {

    },

    lastOn: false,

    handleInput: function(keys) {

        if ((keys[this.onKey] || keys[this.onKeyAlt]) && !this.lastOn) {
            if (!this.shieldOn) {
                if (this.shieldEnergy > this.maxShieldEnergy * (1/2.75)) {
                    this.shieldOn = true;
                }
            }
            else {
                this.shieldOn = false;
            }
        }
        this.lastOn = keys[this.onKey] || keys[this.onKeyAlt];
    },

};