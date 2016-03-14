window.BSWG = window.BSWG || {};

BSWG.music_a = Math.pow(2.0, 1.0/12.0);

BSWG.music_NoteFreq = function(octave, halfStep) {

    var steps = (halfStep-9) + (octave - 4) * 12;
    return f = 440.0 * Math.pow(BSWG.music_a, steps);

};

BSWG.music = new function() {

    var acClass = window.AudioContext || window.webkitAudioContext;
    if (!acClass) {
        console.log('WebAudio not supported.');
        return;
    }

    this.audioCtx = new acClass();

    this.instruments = [
        { baseFreq: BSWG.music_NoteFreq(2, 4), url: 'music/e2-electric-guitar.wav' },
        { baseFreq: BSWG.music_NoteFreq(2, 4), url: 'music/e2-distorted-guitar.wav' }
    ];

    this.init = function(onload) {
        var urls = [];
        for (var i=0; i<this.instruments.length; i++) {
            urls.push(this.instruments[i].url);
        }

        var self = this;
        this.loader = new WABufferLoader(this.audioCtx, urls, function(buffers){
            for (var i=0; i<buffers.length; i++) {
                self.instruments[i].buffer = buffers[i];
            }
            if (onload) {
                onload();
            }
        });

        this.loader.load();
    };

}();

BSWG.music_pentMinor = function(ind, rootNote) {
    rootNote = rootNote || 0;
    ind += 5 * 10;
    var pos = ind % 5;
    var oct = ((ind - pos) / 5) - 10;
    return rootNote + [ 0, 3, 5, 7, 10 ][pos] + (oct - 4) * 12;
};


BSWG.music_harmonicMinor = function(ind, rootNote) {
    rootNote = rootNote || 0;
    ind += 7 * 10;
    var pos = ind % 7;
    var oct = ((ind - pos) / 7) - 10;
    return rootNote + [ 0, 2, 3, 5, 7, 8, 11 ][pos] + (oct - 4) * 12;
};

BSWG.music_harmonicMajor = function(ind, rootNote) {
    rootNote = rootNote || 0;
    ind += 7 * 10;
    var pos = ind % 7;
    var oct = ((ind - pos) / 7) - 10;
    return rootNote + [ 0, 2, 4, 5, 7, 8, 11 ][pos] + (oct - 4) * 12;
};

BSWG.music_naturalMinor = function(ind, rootNote) {
    rootNote = rootNote || 0;
    ind += 7 * 10;
    var pos = ind % 7;
    var oct = ((ind - pos) / 7) - 10;
    return rootNote + [ 0, 2, 3, 5, 7, 8, 10 ][pos] + (oct - 4) * 12;
};

BSWG.music_Major = function(ind, rootNote) {
    rootNote = rootNote || 0;
    ind += 7 * 10;
    var pos = ind % 7;
    var oct = ((ind - pos) / 7) - 10;
    return rootNote + [ 0, 2, 4, 5, 7, 9, 11 ][pos] + (oct - 4) * 12;
};

BSWG.song_subBeat  = 16;
BSWG.song_Channels = 3;

BSWG.song = function(channels, bpm, initVolume, mood) {

    var audioCtx = BSWG.music.audioCtx;

    var nChannels = channels || BSWG.song_channels;
    initVolume = typeof initVolume === 'number' ? initVolume : 0.5;

    this.volume = initVolume;
    
    var patternLength = bpm*BSWG.song_subBeat * 4;

    this.channels = new Array(nChannels);

    var PAT = null;

    var USE_PAT = function(pat) {
        PAT = pat;
    };

    var NEW_PAT = function(length) {
        var ret = new Array(length);
        ret._currentIndex = 0;
        return ret;
    };

    var DOUBLE = function (pat) {
        var tmp = [];
        for (var i=0; i<pat.length; i+=2) {
            tmp.push(pat[i]);
        }
        return tmp;
    };

    var NOTE = function(note, len, v1, v2) {
        v1 = v1 || 0.5;
        v2 = v2 >= 0 ? v2 : v1 * 0.5;
        var f = BSWG.music_NoteFreq(4, note);
        PAT._currentIndex = PAT._currentIndex || 0;
        for (var __i=PAT._currentIndex, j=0; j<len && __i<PAT.length; __i++, j++) {
            var t = Math.pow(j / (len-1), 0.5);
            var v = (v2 - v1) * t + v1;
            PAT[__i] = [ f, v, j===0 ];
        }
        PAT._currentIndex += len;
    };

    var REST = function(len) {
        PAT._currentIndex = PAT._currentIndex || 0;
        for (var __i=PAT._currentIndex, j=0; j<len && __i<PAT.length; __i++, j++) {
            PAT[__i] = [ null, 0.0, false ];
        }
        PAT._currentIndex += len;
    };

    var REPEAT = function(pat, count) {
        var len = pat.length * count;
        PAT._currentIndex = PAT._currentIndex || 0;
        for (var __i=PAT._currentIndex, j=0; j<len && i<PAT.length; __i++, j++) {
            PAT[__i] = pat[j%pat.length];
        }
        PAT._currentIndex += len;
    };

    // http://stackoverflow.com/questions/22525934/connecting-convolvernode-to-an-oscillatornode-with-the-web-audio-the-simple-wa
    function impulseResponse( duration, decay, reverse ) {
        var sampleRate = audioCtx.sampleRate;
        var length = sampleRate * duration;
        var impulse = audioCtx.createBuffer(2, length, sampleRate);
        var impulseL = impulse.getChannelData(0);
        var impulseR = impulse.getChannelData(1);

        if (!decay)
            decay = 2.0;
        for (var i = 0; i < length; i++){
          var n = reverse ? length - i : i;
          impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
          impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }
        return impulse;
    }

    if (!mood) {
        mood = {};
    }
    var defaults = {
        'happy': true,
        'root': 0.95,
        'crazy': 0.005,
        'rep': 0.9,
        'rise': 0.9,
        'drop': 0.9,
        'smooth': 0.25,
        'harmonize': 0.5
    };

    for (var k in defaults) {
        if (!mood[k] && mood[k] !== 0 & mood[k] !== false) {
            mood[k] = defaults[k];
        }
    }

    var inst = [1,0,0];
    if (mood.happy >= 0.5) {
        inst = [0,0,0];
    }

    for (var i=0; i<this.channels.length; i++) {
        var chan = new Object();
        chan.inst = BSWG.music.instruments[ inst[i] ];
        chan.bfr = audioCtx.createBufferSource();
        chan.bfr.loop = false;
        chan.bfr.buffer = chan.inst.buffer;
        chan.gain = audioCtx.createGain();
        chan.gain.gain.value = 0.0 * initVolume;
        chan.conv = audioCtx.createConvolver();
        chan.pan = audioCtx.createStereoPanner();
        chan.pan.value = [0,-0.75,0.75][i%3];
        chan.mGain = audioCtx.createGain();
        chan.mGain.gain.value = initVolume;

        chan.bfr.connect(chan.mGain);
        chan.mGain.connect(chan.gain);
        chan.gain.connect(chan.conv);
        chan.conv.connect(chan.pan);
        chan.pan.connect(audioCtx.destination);

        chan.pattern = NEW_PAT(patternLength);

        this.channels[i] = chan;
    }

    var scale = null;
    var rootNote = ~~(Math.random()*12) + 12*2.5;

    var spats = new Array(32);
    for (var j=0; j<spats.length; j++) {
        var pat = new Array(BSWG.song_subBeat);
        if (Math.random() < mood.harmonize && j > 0) {
            for (var i=0; i<pat.length; i++) {
                pat[i] = spats[j-1][i] + (Math.random() < 0.5 ? 1 : -1) * (Math.random() < 0.5 ? 3 : 5);
            }
        }
        else {
            var last = 0;
            var dropper = Math.random() < 0.5;
            var rootPer = mood.root;
            var crazyPer = 1-mood.crazy;
            var repPer = mood.rep;
            var risePer = 1-mood.rise;
            var dropPer = 1-mood.drop;
            var repPer = 1-mood.rep;
            for (var i=0; i<pat.length; i++) {
                if (Math.random() > repPer) {
                    pat[i] = last;
                }
                else if (i === 0 || Math.random() > rootPer) {
                    pat[i] = 0;
                    last = 0;
                }
                else if (Math.random() > crazyPer) {
                    last += Math.random() > crazyPer ? 2 : 1;
                    pat[i] = last - ~~((1.0-crazyPer)*5) * (Math.random() > risePer ? 1 : -1);
                }
                else if (Math.random() > (risePer + dropPer) * 0.5) {
                    var amt = Math.random() > crazyPer ? 2 : 1;
                    if (Math.random() > risePer)
                        last += amt;
                    else
                        last -= amt;
                    pat[i] = last;
                }
                else {
                    if (i%2) {
                        last += risePer > dropPer ? 1 : -1;
                    }
                    pat[i] = last;
                }

            }
        }
        spats[j] = pat;
    }

    var beat = new Array(32);
    for (var i=0; i<beat.length; i++) {
        var pat = new Array(BSWG.song_subBeat);
        for (var j=0; j<pat.length; j++) {
            pat[j] = Math.random() > Math.pow(mood.intense, 2.0) ? 7.0 : 0.0;
        }
        beat[i] = pat;
    }

    var intOffset = 0;

    var putPat = function(pat, minW, maxW, totalW, nPer, oct, volPat1, volPat2, beat) {
        oct = oct || 0;
        var tw = totalW;
        var _i = 0;
        while (tw > 0 && _i<1000) {
            var w = Math.min(16 * Math.pow(2, -Math.floor(Math.random() * (maxW - minW) + minW)), tw);
            tw -= w;
            if (Math.random() > nPer || (beat && volPat1[_i%volPat1.length])) {
                var v1 = volPat1[~~(Math.random() * volPat1.length)] / 8 * 0.5;
                var v2 = volPat2[~~(Math.random() * volPat2.length)] / 8 * 0.5;
                if (beat) {
                    v1 = volPat1[_i%volPat1.length] / 8 * 0.5;
                    v2 = volPat2[_i%volPat2.length] / 8 * 0.5;
                }
                v1 = Math.min(Math.max(0.0, v1), 1.0);
                v1 = (v1 + 1.0) * 0.5;
                v1 = (v1 * 0.75) + (v2 * 0.25);
                v2 = mood.smooth * v1 + (1.0 - mood.smooth) * (v1*0.25*v2);
                NOTE(scale(pat[_i%pat.length] + intOffset, rootNote) + oct*12, w, v1, v2);
            }
            else {
                REST(w);
            }
            _i++;
        }
    };

    var oRoot = rootNote;

    var major = BSWG.music_Major;
    var minor = BSWG.music_naturalMinor;

    var cProg = [ 0, 0, 0, 0 ];
    var h = mood.happy > 0.5 ? Math.pow(mood.happy, 0.5) : Math.pow(mood.happy, 2.0);
    var cMag = [ Math.random() < h, Math.random() < h, Math.random() < h, Math.random() < h ];
    var cPu = { 0: true };

    if (mood.happy < 0.25) {
        major = minor = BSWG.music_harmonicMinor;
        cPu[2] = true;
    }
    else if (mood.happy < 0.5) {
        major = minor;
        cPu[2] = true;
    }
    else if (mood.happy < 0.75) {
        major = minor = BSWG.music_pentMinor;
    }
    else {
        minor = major;
    }

    for (var i=1; i<cProg.length; i++) {
        var lScale = cMag[i-1] ? major : minor;
        var cScale = cMag[i] ? major : minor;
        var k = 100;
        while (k-- > 0) {
            var v = ~~(Math.random() * 10 - 2);
            if (cMag[i-1] && !cMag[i]) {
                v = ~~(v + cProg[i-1] + 5) * 0.5;
            }
            else if (cMag[i] && !cMag[i-1]) {
                v = ~~(v + cProg[i-1] - 5) * 0.5;
            }
            if (Math.random() > (1-mood.drop)) {
                v -= 3;
            }
            if (cMag[i] !== cMag[i-1]) {
                if (lScale(v, 0) !== cScale(v, 0)) {
                    continue;
                }
            }
            if (!cPu[v]) {
                cPu[v] = true;
                cProg[i] = v;
                break;
            }
        }
    }

    var seed = Math.random();

    for (var i=0; i<this.channels.length; i++) {
        var _tw = patternLength / 16;
        var k = 0;
        var k2 = 0;
        var nextDouble = i === 0 && mood.intense > 0.5;
        var alwaysDouble = nextDouble;
        while (_tw > 0) {

            Math.random(~~(k2/2));
            var scale = cMag[k2%4] ? major : minor;

            intOffset = cProg[k2%4];
            k2 += 1;

            Math.seedrandom(i*0.1+~~((k2%16)/2)*10+seed);

            var baseRestPer = (Math.random()*0.25 + 1-mood.smooth) * 0.5;
            var w = 4;
            _tw -= w;
            if (_tw < 0) {
                w += 4;
            }
            var tmp = NEW_PAT(w * BSWG.song_subBeat);
            USE_PAT(tmp);
            if (i===0) {
                putPat([0], 2, 1, tmp.length, baseRestPer, -1, beat[(k)%beat.length], beat[(k+2)%beat.length], true);
            }
            else if (i === 1) {
                putPat(spats[(k+1)%spats.length], 2, 0, tmp.length, baseRestPer*0.1, 2, spats[(k+2)%spats.length], spats[(k+3)%spats.length]);
            }
            else if (i === 2) {
                putPat(spats[(k+2)%spats.length], 2, 1, tmp.length, 0.0, 1, spats[(k+3)%spats.length], spats[(k+4)%spats.length]);
            }
            USE_PAT(this.channels[i].pattern);
            if (nextDouble) {
                tmp = DOUBLE(tmp);
                REPEAT(tmp, 2);
            }
            else {
                REPEAT(tmp, 1);
            }
            if (!(k2 % 4)) {
                k += 1;
                if (Math.random() < 0.25 || alwaysDouble) {
                    nextDouble = true;
                    k --;
                }
                else {
                    nextDouble = false;
                }
            }
        }
    }

    var allBfrs = [];

    var self = this;

    var patIndex = 0;
    var ctime = audioCtx.currentTime;

    var queue = function(limit) {

        if (patIndex >= patternLength) {
            return;
        }

        if (limit > 0) {

            while (patIndex < patternLength && limit > 0) {

                limit --;

                for (var i=0; i<self.channels.length; i++) {
                    var C = self.channels[i];

                    if (!C.conv.buffer) {
                        C.conv.buffer = impulseResponse(0.05);
                    }

                    var P = C.pattern;
                    var N = P[patIndex];
                    if (N) {
                        if (patIndex > (patternLength - BSWG.song_subBeat*4)) {
                            var t = (patternLength - patIndex) / (BSWG.song_subBeat*4);
                            N[1] *= t;
                        }
                        if (!N[0]) {
                            try {
                                C.bfr.stop(ctime);
                            } catch (err) {}
                        }
                        else {
                            if (N[2]) {
                                try {
                                    C.bfr.stop(ctime);
                                    C.bfr = audioCtx.createBufferSource();
                                    C.bfr.loop = false;
                                    C.bfr.buffer = C.inst.buffer;
                                    C.bfr.connect(C.mGain);
                                } catch (err) {}
                                C.bfr.playbackRate.setValueAtTime((N[0] / C.inst.baseFreq) * (1 + Math.random()*0.001-0.0005), ctime);
                                C.bfr.start(ctime, 1);
                                allBfrs.push(C.bfr);
                            }
                        }
                        C.gain.gain.setValueAtTime((N[1] * [4.0,5.0,6.0][i]) || 0.0, ctime);
                    }
                    else {
                        C.gain.gain.setValueAtTime(0.0, ctime);
                        try {
                            C.bfr.stop(ctime);
                        } catch (err) {}
                    }
                }

                patIndex += 1;

                ctime += 60.0/(bpm*BSWG.song_subBeat);
            }

            for (var i=0; i<self.channels.length; i++) {
                var C = self.channels[i];
                C.gain.gain.setValueAtTime(0.0, ctime);
                try {
                    C.bfr.stop(ctime);
                } catch (err) {}
            }

        }

        window.setTimeout(function(){

            var patsLeft = (ctime - audioCtx.currentTime)/(60.0 / (bpm*BSWG.song_subBeat));

            if (patsLeft < BSWG.song_subBeat*4) {
                queue(BSWG.song_subBeat*8);
            }
            else {
                queue(0);
            }

        }, 100);

    };

    queue(BSWG.song_subBeat*16);

    this.setVolume = function (newVolume, time) {

        this.volume = newVolume;

        for (var i=0; i<this.channels.length; i++) {
            var C = this.channels[i];
            if (C.mGain.gain.linearRampToValueAtTime) {
                C.mGain.gain.linearRampToValueAtTime(this.volume, audioCtx.currentTime + (time||0.0));
            }
            else {
                C.mGain.gain.value = this.volume;
            }
        }

    };

    this.setVolume(this.volume);

    this.stop = function () {

        for (var i=0; i<allBfrs.length; i++) {
            try {
                allBfrs[i].stop();
                allBfrs[i] = null;
            } catch (err) { }
        }
        allBfrs = null;
        this.channels = null;

    };

    this.fadeOutStop = function(time) {
        this.setVolume(0.0, time);
        var self = this;
        window.setTimeout(function(){
            self.stop();
        }, ~~(time*1000+100))
    }

};