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
        x: 0,
        y: 0,
        left: false,
        middle: false,
        right: false,
        wheel: 0,
        shift: false
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

    this.init = function () {

        var div = window;

        if (!BSWG.render.canvas)
        {
            console.log("Renderer must be initilaized before input system.")
            return;
        }

        $(div).keydown(function(e){
            keyMap[e.which] = true;
        });

        $(div).keyup(function(e){
            keyMap[e.which] = false;
        });

        $(div).mousemove(function(e){
            mouseState.x = e.pageX;
            mouseState.y = e.pageY;
            mouseState.shift = !!e.shiftKey;
        });

        $(div).mousedown(function(e){
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
        });

        $(div).mouseup(function(e){
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

        $(div).mousewheel(function(e){
            mouseState.wheel += e.deltaY;
            if ((minWheel || minWheel === 0) && mouseState.wheel < minWheel)
                mouseState.wheel = minWheel;
            if ((maxWheel || maxWheel === 0) && mouseState.wheel > maxWheel)
                mouseState.wheel = maxWheel;
            mouseState.shift = !!e.shiftKey;
        });

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

}();