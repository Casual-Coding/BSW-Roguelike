BSWG.storage = new (function(){

    if (!window.require || !BSWG.app) {

        window.localStorage = window.localStorage || {};
        this.hasKey = function(key) {
            return (typeof localStorage[key]) !== 'undefined';
        };
        this.save = function(key, value) {
            localStorage[key] = JSON.stringify(value);
        };
        this.load = function(key) {
            if (this.hasKey(key)) {
                return JSON.parse(localStorage[key]);
            }
            else {
                return null;
            }
        };
        return;
    }

    var fs = require('fs');
    var path = require('path');
    var appData = BSWG.app.dataPath;

    this.hasKey = function(key) {
        var file = path.join(appData, 'bswr-' + key + '.json');
        return !!fs.existsSync(file);
    };

    this.save = function(key, value) {
        var file = path.join(appData, 'bswr-' + key + '.json');
        fs.writeFile(file, JSON.stringify(value), function (err) {
            if (err) {
                console.info('Error saving file');
                console.error(err);
            } else {
                console.log('Saved ' + key);
            }
        });
    };

    this.load = function(key) {
        var file = path.join(appData, 'bswr-' + key + '.json');
        var json = '';
        try {
            json = fs.readFileSync(file, {encoding: 'utf-8'});
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.info('File not found.');
            } else {
                console.log('Load error: ' + err.code)
            }
            console.log(err);
        }

        if (json.length > 1) {
            return JSON.parse(json);
        }
        else {
            return null;
        }
    };

})();