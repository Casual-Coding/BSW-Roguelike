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

    getIconPoly: function (args, boundsMode) {
        var width    = args.size || 1;
        var height   = args.size || 1;

        if (!boundsMode) {
            width *= 0.5;
            height *= 0.5;
        }

        var verts = [
            new b2Vec2(-width * 0.5, -height * 0.5),
            new b2Vec2( width * 0.5, -height * 0.5),
            new b2Vec2( width * 0.5,  height * 0.5),
            new b2Vec2(-width * 0.5,  height * 0.5)
        ];

        if (boundsMode) {
            return [verts];
        }

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
        this.maxHP = this.size * 250 / 2.5;
        this.energySecond = this.energySecondBase = [4.0, 8.0, 16.0][this.size-1];
        this.energyDamageFactor = [2.0/2, 1.5/2, 1.0/2][this.size-1];
        this.shieldDamage = 0;

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

        var circle = [];
        var nPoints = [12, 18, 24][this.size-1];
        var r = 0.425 * this.size;
        for (var  i=0; i<nPoints; i++) {
            var a = i/nPoints * Math.PI * 2.0;
            circle.push(new b2Vec2(
                r * Math.cos(a),
                r * Math.sin(a)
            ));
        }

        BSWG.bpmReflect = 0.8;
        BSWG.bpmSmoothNormals = true;
        this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.05);
        this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
        BSWG.componentList.makeQueryable(this, this.meshObj.mesh);
        BSWG.bpmReflect = 0.1;
        BSWG.bpmRotating = true;
        this.meshObj2 = BSWG.generateBlockPolyMesh({body: this.obj.body, verts: circle, comp: this}, 0.5, new b2Vec2(0, 0), 0.1*this.size);
        this.xpBase = 0.05 * this.size * this.size;

        this.shieldR = 0.01;
        this.shieldAlpha = 0.0;

        this.shieldOn = false;

        if (BSWG.shieldGeom) {
            this.shmat = BSWG.render.newMaterial("basicVertex", "shieldFragment", {
                clr: {
                    type: 'v4',
                    value: new THREE.Vector4(0, .5, 1, 0)
                },
                envMap: {
                    type: 't',
                    value: BSWG.render.envMap.texture
                },
                envMap2: {
                    type: 't',
                    value: BSWG.render.envMap2.texture
                },
                envMapT: {
                    type: 'f',
                    value: BSWG.render.envMapT
                },
                envMapTint: {
                    type: 'v4',
                    value: BSWG.render.envMapTint
                },
                envMapParam: {
                    type: 'v4',
                    value: BSWG.render.envMapParam
                },      
                viewport: {
                    type: 'v2',
                    value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
                },
                extra: {
                    type: 'v4',
                    value: new THREE.Vector4(1.0/BSWG.shieldSizeFactor, 0, 0, 0)
                }
            }, THREE.AdditiveBlending);
            this.shmat.transparent = true;
            this.shmat.needsUpdate = true;
            this.shsmat = BSWG.render.newMaterial("basicVertex", "shadowFragment", {
                strength: {
                    type: 'f',
                    value: 0.25
                }
            }, THREE.NormalBlending);

            this.shgeom = BSWG.shieldGeom;
            this.shgeom.computeBoundingSphere();
            this.shgeom.needsUpdate = true;
            this.shmesh = new THREE.Mesh(BSWG.shieldGeom, this.shmat);
            this.shmesh.renderOrder = 1602.0;
            BSWG.render.scene.add(this.shmesh);
            this.shsmesh = new THREE.Mesh(BSWG.shieldGeom, this.shsmat);
            //BSWG.render.sceneS.add(this.shsmesh);
        }

        this.topRot = 0;
        this.topRotSpeed = 0;
        this.shieldHit = 0;

    },

    destroy: function() {

        if (this.shieldObj) {
            this.removeShield();
        }
        this.meshObj.destroy();
        this.selMeshObj.destroy();
        this.meshObj2.destroy();

        BSWG.render.scene.remove(this.shmesh);
        //BSWG.render.sceneS.remove(this.shsmesh);

        if (this.shmesh) {
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
        }

        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }
    },

    render: function(ctx, cam, dt) {

        this.meshObj.update([0.4, 0.5, 0.5, 1], 4, BSWG.compAnchored(this));
        this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFnAlpha(this)]);

        this.meshObj2.update([0.0, 0.5, 0.75, 1], 3, BSWG.compAnchored(this), this.topRot, new b2Vec2(0, 0));
        this.shsmat.uniforms.strength.value = 0.25 * this.shieldAlpha;

        this.shmesh.position.set(this.meshObj.mesh.position.x, this.meshObj.mesh.position.y, 0.0);
        this.shsmesh.position.set(this.meshObj.mesh.position.x, this.meshObj.mesh.position.y, 0.0);
        this.shmesh.rotation.set(0, 0, this.obj.body.GetAngle(), 'ZXY');
        this.shsmesh.rotation.set(0, 0, this.obj.body.GetAngle(), 'ZXY');
        this.shmat.uniforms.viewport.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);           

        this.shmesh.scale.set(this.shieldR, this.shieldR, 1.0);
        this.shsmesh.scale.set(this.shieldR, this.shieldR, 1.0);

        var t = Math.clamp(this.shieldHit/16, 0, 1);
        this.shmat.uniforms.clr.value.set(0*(1-t)+t, .5*(1-t)+t, 1*(1-t)+t, this.shieldAlpha);

        this.shieldHit += (0 - this.shieldHit) * Math.min(dt*16, 1.0)
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

        if (this.udsound) {
            this.udsound.stop();
        }
        this.udsound = new BSWG.soundSample().play('shield-up', this.p().THREE(0.2), 1.0*this.size, (2.0+Math._random()*0.1+0.35)/this.size);

        BSWG.componentList.makeQueryable(this, this.shmesh);
    },

    removeShield: function() {
        if (!this.shieldObj) {
            return;
        }
        else if (this.shieldObj && !this.shieldObj.body) {
            this.shieldObj = null;
            return;
        }

        BSWG.physics.removeObject(this.shieldObj);

        this.shieldObj = null;
        this.shieldWeld = null;

        if (this.udsound) {
            this.udsound.stop();
        }
        this.udsound = new BSWG.soundSample().play('shield-down', this.p().THREE(0.2), 1.0*this.size, (2.0+Math._random()*0.1+0.35)/this.size);

        BSWG.componentList.removeQueryable(this, this.shmesh, true);  
    },

    update: function(dt) {

        if (!this.sound) {
            //this.sound = new BSWG.soundSample();
            //this.sound.play('shield-spin', this.obj.body.GetWorldCenter().THREE(0.2), 0.0, 0.1, true);
        }
        else {
            //this.sound.volume(Math.clamp(this.size/9*this.topRotSpeed*0.01, 0, 1));
            //this.sound.rate(Math.clamp(this.topRotSpeed*0.1/this.size, 0.1, 20));
            //this.sound.position(this.obj.body.GetWorldCenter().THREE(0.2));
        }

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
                if (!this.onCC.useEnergy((this.energySecond * BSWG.render.dt) + (this.shieldDamage*this.energyDamageFactor))) {
                    this.shieldOn = false;
                }
            }
        }
        else {
            this.shieldOn = false;
        }
        this.shieldDamage = 0.0;

        if (this.empDamp < 0.5) {
            this.shieldOn = false;
        }

        var talpha = 0.0;

        if (this.shieldOn) {
            if (!this.shieldObj) {
                this.addShield();
            }
            this.shieldR += ((BSWG.shieldSizeFactor * this.size) - this.shieldR) * Math.min(dt*8, 1.0);
            talpha = 1.0;
        }
        else {
            if (this.shieldObj) {
                this.removeShield();
            }
            this.shieldR += (0.01 - this.shieldR) * Math.min(dt*8, 1.0);
            talpha = 0.1;
        }

        talpha *= Math.min(this.shieldR, this.size);

        this.shieldAlpha += (talpha - this.shieldAlpha) * Math.min(dt*8, 1.0);

        if (this.shieldOn && this.empDamp > 0.5 && this.onCC) {
            this.topRotSpeed += (Math.PI * 2 * 4 - this.topRotSpeed) * Math.min(dt*4, 1.0);
        }
        else {
            this.topRotSpeed += (0 - this.topRotSpeed) * Math.min(dt*4, 1.0);
        }

        this.topRot += this.topRotSpeed * dt;

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
            var cl = BSWG.componentList.compList;
            var count = 0, total = 0;
            var first = true, control = false;
            for (var i=0; i<cl.length; i++) {
                if (cl[i].onCC === this.onCC && cl[i].type === 'shield' && cl[i].onKey === this.onKey) {
                    if (cl[i] === this && first) {
                        control = true;
                    }
                    else {
                        break;
                    }
                    count += cl[i].shieldOn ? 1 : 0;
                    total += 1;
                    first = false;
                }
            }
            if (control) {
                for (var i=0; i<cl.length; i++) {
                    if (cl[i].onCC === this.onCC && cl[i].type === 'shield' && cl[i].onKey === this.onKey && this.empDamp > 0.5) {
                        if ((count*2) <= total) {
                            cl[i].shieldOn = true;
                        }
                        else {
                            cl[i].shieldOn = false;
                        }
                    }
                }
            }
            cl = null;
        }
        this.lastOn = keys[this.onKey] || keys[this.onKeyAlt];
    },

};