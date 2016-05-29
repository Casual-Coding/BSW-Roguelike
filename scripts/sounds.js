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

BSWG.sound_boom = BSWG.soundBase({

    // test: new BSWG.sound_boom().play(BSWG.render.cam3D.position.clone(), 64, 3.0);

    play: function (pos, size, length) {

        this.size = size;
        this.length = length;
        
        var sizet = Math.clamp(size/5, 0.1, 1.0);
        var audioCtx = BSWG.music.audioCtx;

        this.oscillator = audioCtx.createOscillator();
        this.oscillator.type = 'square';
        this.oscillator.frequency.value = 250 / (Math.pow(sizet, 0.35) - 0.05);
        this.oscillator.start();

        this.gain = audioCtx.createGain();
        this.gain.gain.value = sizet;

        var it = this.oscillator.frequency.value;
        var ot = this.oscillator.frequency.value/2;
        for (var t=0; t<this.length; t+=0.1) {
            var tt = Math.pow(t/this.length, 0.125) * Math.random();
            this.oscillator.frequency.setValueAtTime(ot*tt + it*(1-tt), audioCtx.currentTime + t);
            tt = Math.pow(t/this.length, 0.125);
            this.gain.gain.setValueAtTime((1-tt) * sizet, audioCtx.currentTime + t);
        }
        this.gain.gain.setValueAtTime(0, audioCtx.currentTime + this.length);

        this.panner = this.createPanner(pos, sizet);

        this.oscillator.connect(this.gain);
        this.gain.connect(this.panner);
        this.panner.connect(audioCtx.destination);

        var self = this;
        window.setTimeout(function() {
            self.stop();
            self = null;
        }, ~~(this.length*1000) + 15);

    },

    stop: function ( ) {

        try { this.oscillator.stop(); } catch (e) { }
        try { this.oscillator.disconnect(); } catch (e) { }
        try { this.gain.disconnect(); } catch (e) { }
        try { this.panner.disconnect(); } catch (e) { }

        this.oscillator = null;
        this.gain = null;
        this.panner = null;

    }

});

BSWG.soundUpdate = function () {

    if (BSWG.render.cam3D && BSWG.music.audioCtx) {
        var p = BSWG.render.cam3D.position;
        BSWG.music.audioCtx.listener.setPosition(p.x, p.y, p.z);
    }

};

window.setInterval(BSWG.soundUpdate, 20);