BSWG.soundBase = function (desc) {

    var ret = function () {

        if (this.init) {
            this.init.apply(this, arguments);
        }

    };

    ret.prototype.createPanner = function (pos, amp) {
        pos = pos || new THREE.Vector3(0, 0, 0);
        amp = (!amp && amp !== 0) ? 0.1 : amp;
        var panner = BSWG.music.audioCtx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 100 * amp * 2.0;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        panner.setOrientation(0,0,1);
        panner.setPosition(pos.x, pos.y, pos.z);
        pos = null;
        return panner;
    };

    ret.prototype.createPanner2 = function (pos, amp) {
        pos = pos || new THREE.Vector3(0, 0, 0);
        amp = (!amp && amp !== 0) ? 0.1 : amp;
        var panner = BSWG.music.audioCtx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000 * amp * 2.0;
        panner.rolloffFactor = 0.01;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        panner.setOrientation(0,0,1);
        panner.setPosition(pos.x, pos.y, pos.z);
        pos = null;
        return panner;
    };

    for (var key in desc) {
        ret.prototype[key] = desc[key];
    }

    return ret;

};

/*BSWG.sboomFreq = function(count, sizeint) {

    var ret = {};
    for (var size = 0.1; size <= 1; size += sizeint) {
        var x = new Float32Array(count);
        for (var i=0; i<size)
    }

}(75, 0.05);*/

BSWG.soundVolume = 1.0;

BSWG.soundMixerClass = function () {

    var audioCtx = BSWG.music.audioCtx;

    this.gain = audioCtx.createGain();
    this.setVolume(BSWG.soundVolume);

    this.compressor = audioCtx.createDynamicsCompressor();
    this.compressor.threshold.value = -50;
    this.compressor.knee.value = 40;
    this.compressor.ratio.value = 12;
    this.compressor.reduction.value = -20;
    this.compressor.attack.value = 0;
    this.compressor.release.value = 0.25;

    this.gain.connect(this.compressor);
    this.compressor.connect(audioCtx.destination);

};

BSWG.soundMixerClass.prototype.setVolume = function (val) {

    this.gain.gain.value = Math.clamp(val, 0, 1) * 1.5;

};

BSWG.mixer = null;

BSWG.maxSounds = 86;
BSWG.curSounds = 0;

BSWG.soundSample = BSWG.soundBase({

    // test: new BSWG.sound_boom().play(BSWG.render.cam3D.position.clone(), 64, 3.0);

    play: function (name, pos, amp, rate, loop, delay) {

        if (BSWG.curSounds >= BSWG.maxSounds) {
            if (!loop) {
                return;
            }
        }

        BSWG.curSounds += 1;

        delay = delay || 0.0;
     
        var audioCtx = this.audioCtx = BSWG.music.audioCtx;

        this.source = audioCtx.createBufferSource();
        this.source.loop = !!loop;
        this.source.buffer = BSWG.soundBuffers[name];
        rate = Math.clamp(rate || 1, 0.1, 10.0);
        this.source.playbackRate.value = rate;

        this.gain = audioCtx.createGain();
        this.gain.gain.value = amp * 0.5;

        if (pos) {
            this.panner = this.createPanner(pos, amp);
        }

        this.source.connect(this.gain);
        if (this.panner) {
            this.gain.connect(this.panner);
            this.panner.connect(BSWG.mixer.gain);
        }
        else {
            this.gain.connect(BSWG.mixer.gain);
        }

        var self = this;
        this.source.onended = function ( ) {
            self.playing = false;
            self.stop();
            self = null;
        };

        if (!loop) {
            window.setTimeout(function(){
                if (self && self.audioCtx) {
                    self.playing = false;
                    self.stop();
                    self = null;
                }
            }, Math.ceil(BSWG.soundBuffers[name].duration * (1.0/rate) * 1000 * 1.05));
        }

        this.source.start(audioCtx.currentTime + delay);
        this.playing = true;

        audioCtx = null;
        pos = null;
        name = null;

    },

    volume: function (val) {
        //try {
        if (this.playing && isFinite(val)) {
            val = Math.clamp(val * 0.5, 0, 1);
            if (!val || Math.abs(this.gain.gain.value - val) > 0.01) {
                this.gain.gain.value = val;
            }
        }
            //this.gain.gain.setValueAtTime(Math.clamp(val * 0.5, 0, 1), this.audioCtx.currentTime);
        //}
        //catch (e) {
//
        //}
    },

    rate: function (val) {
        //try {
        if (this.playing && isFinite(val)) {
            val = Math.clamp(val || 1, 0.1, 10.0);
            if (!val || Math.abs(this.source.playbackRate.value - val) > 0.01) {
                this.source.playbackRate.value = val;
            }
        }
            //this.source.playbackRate.setValueAtTime(Math.clamp(val || 1, 0.1, 10.0), this.audioCtx.currentTime);
        //}
        //catch (e) {

        //}
    },

    position: function (p) {
        //try {
        if (this.panner && this.playing) {
            this.panner.setPosition(p.x, p.y, p.z);
        }
        //}
        //catch (e) {

        //}
        p = null;
    },
 
    stop: function ( ) {

        if (!this.audioCtx) {
            return;
        }

        BSWG.curSounds -= 1;

        this.audioCtx = null;
        this.source.onended = null;

        if (this.playing) {
            this.source.stop();
        }

        this.playing = false;

        this.source.disconnect();
        this.gain.disconnect();
        if (this.panner) {
            this.panner.disconnect();
        }
        this.source = null;
        this.gain = null;
        this.panner = null;

    }

});

BSWG.noteSad = [ 0, 2, 3, 5, 7, 8, 11 ];
BSWG.noteHappy = [ 0, 2, 4, 5, 7, 9, 11 ]; 

BSWG.noteSample = BSWG.soundBase({

    // test: new BSWG.sound_boom().play(BSWG.render.cam3D.position.clone(), 64, 3.0);

    play: function (amp, interval, oct, happy, time, offset, notename) {
    
        var audioCtx = this.audioCtx = BSWG.music.audioCtx;

        while (interval >= 7 && oct < 5) {
            interval -= 7;
            oct += 1;
        }
        while (interval < 0 && oct > 1) {
            interval += 8;
            oct -= 1;
        }
        interval = (interval + 7) % 7;

        var note = BSWG.noteSad[interval];
        if (happy) {
            note = BSWG.noteHappy[interval];
        }

        notename = notename || 'e2-distorted';

        this.source = audioCtx.createBufferSource();
        this.source.loop = false;
        this.source.buffer = BSWG.soundBuffers[notename];
        this.source.playbackRate.value = (Math.random()*0.01 + 0.995) * (notename === 'e2-distorted' ? (BSWG.music_NoteFreq(oct, note+(offset||0)) / BSWG.music_NoteFreq(2, 8)) : 1.0);

        this.gain = audioCtx.createGain();
        this.gain.gain.value = amp * 0.5;

        var vec = new THREE.Vector3(
            BSWG.render.cam3D.position.x + Math.random() * 30 - 15,
            BSWG.render.cam3D.position.y + Math.random() * 30 - 15,
            BSWG.render.cam3D.position.z + Math.random() * 30 - 15
        );
        this.panner = this.createPanner2(vec, amp * 100.0);
        vec = null;

        this.source.connect(this.panner);
        this.panner.connect(this.gain);
        this.gain.connect(BSWG.mixer.gain);

        var self = this;
        this.source.onended = function ( ) {
            self.playing = false;
            self.stop();
            self = null;
        };

        this.source.start(time || audioCtx.currentTime);
        this.playing = true;

        audioCtx = null;
    },

    stop: function ( ) {

        this.audioCtx = null;
        this.source.onended = null;

        if (this.playing) {
            this.source.stop();
        }

        this.playing = false;

        this.source.disconnect();
        this.gain.disconnect();
        this.panner.disconnect();
        this.source = null;
        this.gain = null;
        this.panner = null;

    }

});

BSWG.soundBuffers = {};

BSWG.soundLoad = function (onload) {

    var sounds = [
        { name: 'explosion', url: 'sounds/explosion.wav' },
        { name: 'blaster', url: 'sounds/blaster.wav' },
        { name: 'missile', url: 'sounds/missile.wav' },
        { name: 'thruster', url: 'sounds/thruster.wav' },
        { name: 'laser', url: 'sounds/laser.wav' },
        { name: 'saw', url: 'sounds/saw.wav' },
        { name: 'hinge', url: 'sounds/hinge.wav' },
        { name: 'bump', url: 'sounds/bump.wav' },
        { name: 'scrape', url: 'sounds/scrape.wav' },
        { name: 'store', url: 'sounds/store.wav' },
        { name: 'store-2', url: 'sounds/store-2.wav' },
        { name: 'levelup', url: 'sounds/levelup.wav' },
        { name: 'raindrop', url: 'sounds/raindrop.wav' },
        { name: 'swirl', url: 'sounds/swirl.wav' },
        { name: 'e2-distorted', url: 'sounds/e2-distorted.wav' },
        { name: 'e2-clean', url: 'sounds/e2-clean.wav' },
        { name: 'dialog', url: 'sounds/dialog.wav' },
        { name: 'trade', url: 'sounds/trade.wav' },
        { name: 'error', url: 'sounds/error.wav' },
        { name: 'kick', url: 'sounds/kick.wav' },
        { name: 'crash-snare', url: 'sounds/crash-snare.wav' },
        { name: 'unlock-hover', url: 'sounds/unlock-hover.wav' },
        { name: 'special-equip', url: 'sounds/special-equip.wav' },
        { name: 'click', url: 'sounds/click.wav' },
        { name: 'hover', url: 'sounds/hover.wav' },
        { name: 'minigun', url: 'sounds/minigun.wav '},
        { name: 'minigun-fire', url: 'sounds/minigun-fire.wav '},
        { name: 'use-special', url: 'sounds/use-special.wav' },
        { name: 'lightning', url: 'sounds/lightning.wav' },
        { name: 'shield-up', url: 'sounds/shield-up.wav' },
        { name: 'shield-down', url: 'sounds/shield-down.wav' },
        { name: 'shield-hit', url: 'sounds/shield-hit.wav' }
    ];

    var urls = [];
    for (var i=0; i<sounds.length; i++) {
        urls.push(sounds[i].url);
    }

    var loader = new WABufferLoader(BSWG.music.audioCtx, urls, function(buffers){
        for (var i=0; i<buffers.length; i++) {
            sounds[i].buffer = buffers[i];
            BSWG.soundBuffers[sounds[i].name] = buffers[i];
        }

        window.setInterval(BSWG.soundUpdate, 20);
        if (onload) {
            onload();
        }
    });

    loader.load();
};

BSWG.soundUpdate = function () {

    if (BSWG.render.cam3D && BSWG.music.audioCtx) {
        var p = BSWG.render.cam3D.position;
        if (!BSWG.mixer) {
            BSWG.mixer = new BSWG.soundMixerClass();
        }
        BSWG.mixer.setVolume(BSWG.soundVolume);
        BSWG.music.audioCtx.listener.setPosition(p.x, p.y, p.z);
    }

};