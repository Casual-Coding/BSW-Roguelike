BSWG.KEY = (function(){

    // From: https://github.com/timoxley/keycode/blob/master/index.js

    var codes = {
        'backspace': 8,
        'tab': 9,
        'enter': 13,
        'shift': 16,
        'ctrl': 17,
        'alt': 18,
        'pause/break': 19,
        'caps lock': 20,
        'esc': 27,
        'space': 32,
        'page up': 33,
        'page down': 34,
        'end': 35,
        'home': 36,
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,
        'insert': 45,
        'delete': 46,
        'command': 91,
        'right click': 93,
        'numpad *': 106,
        'numpad +': 107,
        'numpad -': 109,
        'numpad .': 110,
        'numpad /': 111,
        'num lock': 144,
        'scroll lock': 145,
        'my computer': 182,
        'my calculator': 183,
        ';': 186,
        '=': 187,
        ',': 188,
        '-': 189,
        '.': 190,
        '/': 191,
        '`': 192,
        '[': 219,
        '\\': 220,
        ']': 221,
        "'": 222,
    }

    // Helper aliases

    var aliases = {
        'windows': 91,
        '⇧': 16,
        '⌥': 18,
        '⌃': 17,
        '⌘': 91,
        'ctl': 17,
        'control': 17,
        'option': 18,
        'pause': 19,
        'break': 19,
        'caps': 20,
        'return': 13,
        'escape': 27,
        'spc': 32,
        'pgup': 33,
        'pgdn': 33,
        'ins': 45,
        'del': 46,
        'cmd': 91
    }


    /*!
     * Programatically add the following
     */

    // lower case chars
    for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

    // numbers
    for (var i = 48; i < 58; i++) codes[i - 48] = i

    // function keys
    for (i = 1; i < 13; i++) codes['f'+i] = i + 111

    // numpad keys
    for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

    /**
     * Get by code
     *
     *   exports.name[13] // => 'Enter'
     */

    var names = {} // title for backward compat

    // Create reverse mapping
    for (i in codes) names[codes[i]] = i;

    // Add aliases
    for (var alias in aliases) {
        codes[alias] = aliases[alias]
    }

    BSWG.KEY_NAMES = names;

    var ret = {};
    for (var key in codes)
        ret[key.toUpperCase()] = codes[key];

    return ret;

})();

BSWG.input = new function(){

    var keyMap = {};
    var lkeyMap = {};
    var mouseState = {
        x: window.innerWidth/2,
        y: window.innerHeight/2,
        left: false,
        middle: false,
        right: false,
        wheel: 0,
        shift: false,
        mousein: true
    };
    var minWheel = null,
        maxWheel = null;
    var lmouseState = {};
    for (k in mouseState)
        lmouseState[k] = mouseState[k];

    this.EAT_KEY = function (k) {
        keyMap[k] = lkeyMap[k] = false;
    };

    this.EAT_MOUSE = function(v) {
        if (v === 'left' || v === 'middle' || v === 'right' || v === 'shift') {
            mouseState[v] = lmouseState[v] = false;
        }
        else if (v === 'wheel' || v === 'x' || v === 'y') {
            mouseState[v] = lmouseState[v];
        }
    };

    this.wheelLimits = function ( w1, w2 ) {

        minWheel = w1;
        maxWheel = w2;

    };

    this.KEY_DOWN = function (k) {
        return keyMap[k] || false;
    };

    this.KEY_PRESSED = function (k) {
        return keyMap[k] && !lkeyMap[k];
    };

    this.KEY_RELEASED = function (k) {
        return !keyMap[k] && lkeyMap[k];
    };

    this.MOUSE = function (k) {
        var v = mouseState[k];
        switch (k)
        {
            case 'x':
                return (v / window.innerWidth) * parseFloat(BSWG.render.canvas.width);
            case 'y':
                return (v / window.innerHeight) * parseFloat(BSWG.render.canvas.height);
            default:
                return v;
        }
    };

    this.MOUSE_DELTA = function (k) {
        var v = mouseState[k];
        var lv = lmouseState[k];
        switch (k)
        {
            case 'x':
                return (v / window.innerWidth) * parseFloat(BSWG.render.canvas.width) -
                       (lv / window.innerWidth) * parseFloat(BSWG.render.canvas.width);
            case 'y':
                return (v / window.innerHeight) * parseFloat(BSWG.render.canvas.height) -
                       (lv / window.innerHeight) * parseFloat(BSWG.render.canvas.height);
            default:
                return v;
        }
    };

    this.MOUSE_PRESSED = function (k) {
        return mouseState[k] && !lmouseState[k];
    };

    this.MOUSE_RELEASED = function (k) {
        return !mouseState[k] && lmouseState[k];
    };

    this.MOUSE_WHEEL = function (k) {
        return mouseState.wheel - lmouseState.wheel;
    };

    this.MOUSE_WHEEL_ABS = function () {
        return mouseState.wheel;
    };

    this.getKeyMap = function (released) {
        if (released) {
            var retMap = {};
            for (var k in lkeyMap)
            {
                if (lkeyMap[k] && !keyMap[k]) {
                    retMap[k] = true;
                }
            }
            return retMap;
        }
        return keyMap;
    };

    this.gfID = 1;
    this.gfiles = new Array();

    // onclick = function(data, mousex, mousey), data will be null if click-range test
    this.GET_FILE = function (onclick, type) {

        if (!type) {
            type = "text";
        }

        var ret = new Object();
        ret.id = this.gfID++;

        var input = document.createElement("INPUT");
        input.id = "get_file_" + ret.id;
        input.type = "file";
        input.style.visibility = "hidden";
        input.style.position = "fixed";
        input.style.left = "120%";
        input.addEventListener('change', function(evt){
            var files = evt.target.files;
            for (var i=0; i<files.length && i<1; i++) {
                if (files[i]) {
                    var reader = new FileReader();
                    var file = files[i];
                    reader.onload = function(e) {
                        if (onclick) {
                            onclick({
                                filename: file.name,
                                data: e.target.result
                            });
                        }
                    };
                    if (type === "text") {
                        reader.readAsText(file);
                    }
                    //reader.readAsDataURL(f);
                    break;
                }
            }
            input.value = "";
        }, false);
        document.body.appendChild(input);

        ret.input = input;
        ret.onclick = onclick;

        this.gfiles.push(ret);

        return ret;

    };

    this.REMOVE_GFILE = function(obj) {

        if (!obj) {
            return false;
        }

        document.body.removeChild(obj.input);

        for (var i=0; i<this.gfiles.length; i++) {
            if (this.gfiles[i].id === obj.id) {
                this.gfiles.splice(i, 1);
                i --;
                continue;
            }
        }

        return true;

    };

    this.CLEAR_GFILE = function() {
        while (this.gfiles.length > 0) {
            this.REMOVE_GFILE(this.gfiles[0]);
        }
    };

    this.init = function () {

        var div  = window;
        var self = this;

        if (!BSWG.render.canvas)
        {
            console.log("Renderer must be initilaized before input system.")
            return;
        }

        // http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
        jQuery(document).unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && 
                     (
                         d.type.toUpperCase() === 'TEXT' ||
                         d.type.toUpperCase() === 'PASSWORD' || 
                         d.type.toUpperCase() === 'FILE' || 
                         d.type.toUpperCase() === 'SEARCH' || 
                         d.type.toUpperCase() === 'EMAIL' || 
                         d.type.toUpperCase() === 'NUMBER' || 
                         d.type.toUpperCase() === 'DATE' )
                     ) || 
                     d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        });

        jQuery(div).keydown(function(e){
            keyMap[e.which] = true;
            
            if (self.mouseWheelKeys) {
                var dir = 0;
                for (i=0; i<self.mouseWheelKeys.plus.length; i++) {
                    if (e.which == self.mouseWheelKeys.minus[i]) {
                        dir = -self.mouseWheelKeys.speed;
                        break;
                    }
                }
                for (i=0; i<self.mouseWheelKeys.plus.length; i++) {
                    if (e.which == self.mouseWheelKeys.plus[i]) {
                        dir += self.mouseWheelKeys.speed;
                        break;
                    }
                }
                if (dir) {
                    mouseState.wheel += dir;
                    if ((minWheel || minWheel === 0) && mouseState.wheel < minWheel) {
                        mouseState.wheel = minWheel;
                    }
                    if ((maxWheel || maxWheel === 0) && mouseState.wheel > maxWheel) {
                        mouseState.wheel = maxWheel;
                    }
                }
            }
        });

        jQuery(div).keyup(function(e){
            keyMap[e.which] = false;
            var win = BSWG.render.win;
            if (win) {
                if (e.which === BSWG.KEY['F11']) {
                    var fs = !win.isFullscreen;
                    win.toggleFullscreen();
                }
                else if (e.which === BSWG.KEY['F12']) {
                    win.showDevTools();
                }
            }
        });

        self.dgOpenTime = 0;
        jQuery(div).mousemove(function(e){
            if ((Date.timeStamp() - self.dgOpenTime) > 1.0) {
                //BSWG.render.dlgOpen = false;
            }
            mouseState.x = e.pageX;
            mouseState.y = e.pageY;
            mouseState.shift = !!e.shiftKey;
        });

        jQuery(div).mouseenter(function(e){
            mouseState.mousein = true;
            //BSWG.render.dlgOpen = false;
        });

        jQuery(div).focus(function(e){
            BSWG.render.dlgOpen = false; 
        });

        jQuery(div).mouseleave(function(e){
            mouseState.mousein = false;
        });

        jQuery(div).mousedown(function(e){
            switch (e.which)
            {
                case 1:
                    mouseState.left = true;
                    break;
                case 2:
                    mouseState.middle = true;
                    break;
                case 3:
                    mouseState.right = true;
                    break;
                default:
                    break;
            }
            mouseState.shift = !!e.shiftKey;
            //BSWG.render.dlgOpen = false;
        });

        jQuery(div).mouseup(function(e){
            switch (e.which)
            {
                case 1:
                    mouseState.left = false;
                    break;
                case 2:
                    mouseState.middle = false;
                    break;
                case 3:
                    mouseState.right = false;
                    break;
                default:
                    break;
            }
            mouseState.shift = !!e.shiftKey;
        });

        jQuery(div).click(function(e){

            if (BSWG.game.grabbedBlock) {
                return;
            }

            var x = mouseState.x, y = mouseState.y;

            for (var i=0; i<self.gfiles.length; i++) {
                if (self.gfiles[i].onclick && self.gfiles[i].onclick(null, x, y)) {
                    self.gfiles[i].input.click();
                    BSWG.render.dlgOpen = true;
                    self.dgOpenTime = Date.timeStamp();
                }
            }

        });

        jQuery(div).mousewheel(function(e){
            mouseState.wheel += e.deltaY;
            if ((minWheel || minWheel === 0) && mouseState.wheel < minWheel)
                mouseState.wheel = minWheel;
            if ((maxWheel || maxWheel === 0) && mouseState.wheel > maxWheel)
                mouseState.wheel = maxWheel;
            mouseState.shift = !!e.shiftKey;
        });

    };

    this.mouseWheelKeys = null;
    this.emulateMouseWheel = function(minusKeys, plusKeys, speed) {
        this.mouseWheelKeys = {
            minus: minusKeys,
            plus:  plusKeys,
            speed: speed || 1
        }
    };

    this.newFrame = function () {
        for (var k in lkeyMap)
        {
            lkeyMap[k] = null;
            delete lkeyMap[k];
        }
        for (var k in keyMap)
            lkeyMap[k] = keyMap[k];
        for (var k in mouseState)
            lmouseState[k] = mouseState[k];
    };

    this.EAT_ALL = function () {
        for (var k in lkeyMap) {
            lkeyMap[k] = null;
            delete lkeyMap[k];
        }
        for (var k in keyMap) {
            keyMap[k] = null;
            delete keyMap[k];
        }
        for (var k in mouseState) {
            if (k !== 'x' && k !== 'y') {
                mouseState[k] = lmouseState[k];
            }
        }
    };

}();