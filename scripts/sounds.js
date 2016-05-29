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
        panner.maxDistance = 100 * amp;
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

BSWG.soundSample = BSWG.soundBase({

    // test: new BSWG.sound_boom().play(BSWG.render.cam3D.position.clone(), 64, 3.0);

    play: function (name, pos, amp, rate) {
      
        var audioCtx = BSWG.music.audioCtx;

        this.source = audioCtx.createBufferSource();
        this.source.loop = false;
        this.source.buffer = BSWG.soundBuffers[name];
        this.source.playbackRate.value = rate || 1;

        this.gain = audioCtx.createGain();
        this.gain.gain.value = amp;

        this.panner = this.createPanner(pos, amp);

        this.source.connect(this.gain);
        this.gain.connect(this.panner);
        this.panner.connect(audioCtx.destination);

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

    stop: function ( ) {

        try { this.source.stop(); } catch (e) { }
        try { this.source.disconnect(); } catch (e) { }
        try { this.gain.disconnect(); } catch (e) { }
        try { this.panner.disconnect(); } catch (e) { }

        this.source = null;
        this.gain = null;
        this.panner = null;

    }

});

BSWG.soundBuffers = {};

BSWG.soundLoad = function (onload) {

    var sounds = [
        { name: 'explosion', url: 'sounds/explosion.wav' }
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
        BSWG.music.audioCtx.listener.setPosition(p.x, p.y, p.z);
    }

};