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

    this.gain.gain.value = Math.clamp(val, 0, 1);

};

BSWG.mixer = null;

BSWG.soundSample = BSWG.soundBase({

    // test: new BSWG.sound_boom().play(BSWG.render.cam3D.position.clone(), 64, 3.0);

    play: function (name, pos, amp, rate, loop) {
     
        var audioCtx = BSWG.music.audioCtx;

        this.source = audioCtx.createBufferSource();
        this.source.loop = !!loop;
        this.source.buffer = BSWG.soundBuffers[name];
        this.source.playbackRate.value = Math.clamp(rate || 1, 0.1, 10.0);

        this.gain = audioCtx.createGain();
        this.gain.gain.value = amp * 0.5;

        this.panner = this.createPanner(pos, amp);

        this.source.connect(this.gain);
        this.gain.connect(this.panner);
        this.panner.connect(BSWG.mixer.gain);

        var self = this;
        this.source.onended = function ( ) {
            self.stop();
            self = null;
        };

        this.source.start();

        audioCtx = null;
        pos = null;
        name = null;

    },

    volume: function (val) {
        try {
            this.gain.gain.value = Math.clamp(val * 0.5, 0, 1);
        }
        catch (e) {

        }
    },

    rate: function (val) {
        try {
            this.source.playbackRate.value = Math.clamp(val || 1, 0.1, 10.0);
        }
        catch (e) {

        }
    },

    position: function (p) {
        try {
            this.panner.setPosition(p.x, p.y, p.z);
        }
        catch (e) {

        }
        p = null;
    },
 
    stop: function ( ) {

        this.source.onended = null;

        try { this.source.stop(); } catch (e) { }

        var self = this;
        window.setTimeout(function() {
            try { self.source.disconnect(); } catch (e) { }
            try { self.gain.disconnect(); } catch (e) { }
            try { self.panner.disconnect(); } catch (e) { }

            self.source = null;
            self.gain = null;
            self.panner = null;
            self = null;
        }, 1);

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
        { name: 'store-2', url: 'sounds/store-2.wav' }
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