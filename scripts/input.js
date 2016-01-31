BSWG.KEY = {
    LEFT:  37,
    RIGHT: 39,
    UP:    38,
    DOWN:  40,

    SPACE: 32,
    ESC:   27
};

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

    this.getKeyMap = function () {
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