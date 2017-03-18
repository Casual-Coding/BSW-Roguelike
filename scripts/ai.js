BSWG.enemyStats = {};
BSWG.getEnemyStats = function(type) {
    return BSWG.getEnemy(type, true);
};
BSWG.getEnemy = function(type, statsOnly) {

    if (statsOnly) {
        if (BSWG.enemyStats[type]) {
            return BSWG.enemyStats[type];
        }
    }

    var estr = BSWG['ais_' + type];
    var eobj = estr ? JSON.parse(estr) : null;
    var stats = BSWG.enemyStats[type] || null;

    if (BSWG.componentList && !stats && eobj) {
        stats = BSWG.componentList.loadScan(eobj);
        BSWG.enemyStats[type] = stats;
    }

    if (statsOnly) {
        return stats;
    }

    var title = 'Unkown Enemy';

    switch (type) {
        case 'goliath':         title = 'Goliath'; break;
        case 'big-flail':       title = 'Big Flail'; break;
        case 'big-spinner':     title = 'Big Spinner'; break;
        case 'brute':           title = 'Brute'; break; 
        case 'crippler':        title = 'Crippler'; break;
        case 'cruncher-boss':   title = 'Crimson Cruncher'; break;
        case 'fighter':         title = 'Fighter'; break;
        case 'brutenie':        title = 'Brutenie'; break;
        case 'marauder':        title = 'Marauder'; break;
        case 'striker':         title = 'Striker'; break;
        case 'four-blaster-x2': title = '4x Blaster'; break;
        case 'four-blaster':    title = 'Pleb'; break;
        case 'heavy-fighter':   title = 'Heavy Fighter'; break;
        case 'laser-fighter':   title = 'Laser Fighter'; break;
        case 'little-brute':    title = 'Little Brute'; break;
        case 'little-charger-2':title = 'Little Charger X'; break;
        case 'little-charger':  title = 'Little Charger Y'; break;
        case 'little-cruncher': title = 'Little Cruncher'; break;
        case 'mele-boss':       title = 'Mele Monster'; break;
        case 'missile-boss':    title = 'Thorne'; break;
        case 'missile-spinner': title = 'Missile Spinner'; break;
        case 'msl-fighter':     title = 'Missile Fighter'; break;
        case 'scorpion':        title = 'Scorpion'; break;
        case 'spinner':         title = 'Spinner'; break;
        case 'uni-dir-fighter': title = 'Uni-Fighter'; break;
        case 'uni-fight-msl':   title = 'Uni-Fighter II'; break;
        case 'uni-laser':       title = 'Scanner'; break;
        case 'little-tough-guy':title = 'Lil\' Tough Guy'; break;
        case 'tough-guy':       title = 'Tough Guy'; break;
        case 'stinger':         title = 'Stinger'; break;
        case 'freighter':       title = 'Freighter'; break;
        case 'tracker':         title = 'Tracker'; break;
        case 'fighter-mg':      title = 'Fighter MG'; break;
        case 'four-minigun':    title = '4x Minigun'; break;
        case 'freighter-2':     title = 'Freighter II'; break;
        case 'little-brute-2':  title = 'Little Brute II'; break;
        case 'marauder-2':      title = 'Heavy Marauder'; break;
        case 'mini-gunner':     title = 'Gunner'; break;
        case 'mini-gunner-m2':  title = 'Gunner MII'; break;
        case 'mini-gunner-m3':  title = 'Gunner MIII'; break;
        case 'fighter-mg-2':    title = 'Fighter MG II'; break;
        default: break;
    }

    eobj.title = title;

    return {
        obj: eobj,
        stats: stats,
        title: title,
        type: type,
        compStats: function (ostats) {
            var ustats = {};
            for (var stat in stats) {
                var found = false;
                var count = stats[stat];
                for (var statj in stats) {
                    if (stat.localeCompare(statj) < 0 && BSWG.compImplied(stat, statj)) {
                        found = true;
                    }
                    if (BSWG.compImplied(statj, stat)) {
                        count += stats[statj];
                    }
                }
                if (!found) {
                    ustats[stat] = count;
                }
            }
            var f = 0, nf = 0;
            for (var stat in ustats) {
                var found = false;
                for (var i=0; i<ostats.length && !found; i++) {
                    if (BSWG.compImplied(stat, ostats[i])) {
                        f += ustats[stat];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    nf += ustats[stat];
                }
            }
            return f / (f+nf);
        }
    };
};


BSWG.neuralAI = function(shipBlocks, networkJSON) {

    this.shipBlocks = shipBlocks || null;

};

BSWG.neuralAI.prototype.update = function(dt, pain, pleasure) {

};

BSWG.neuralAI.prototype.debugRender = function(ctx, dt) {

};

BSWG.neuralAI.prototype.getKeys = function(keys) {

};

BSWG.neuralAI.prototype.destroy = function() {

    this.shipBlocks = null;

};


BSWG.ai = new function() {

    var EDITOR_WIDTH = 550;

    this.aiTestLevel = 0;
    this.playerTestLevel = 0;

    this.getFile = false;
    this.testOtherShip = null;

    this.init = function () {

        this.closeEditor();
        this.testMenuOpen = false;
        if (this.getFile) {
            BSWG.input.REMOVE_GFILE(this.getFile);
            this.getFile = null;
        }

    };

    this.saveCode = function () {

        if (this.editor && this.editorCC) {
            this.editorCC.aiStr = this.editor.getValue();
        }

    };

    this.addEditor = function ( ) {

        if (this.editor) {
            this.removeEditor();
        }

        this.editorDiv = document.createElement('div');
        this.editorDiv.style.position = 'fixed';
        this.editorDiv.style.zIndex = '50';
        this.editorDiv.style.width = (EDITOR_WIDTH-8) + 'px';
        this.editorDiv.style.height = '400px';
        this.editorDiv.style.top = '66px';
        this.editorDiv.style.border = '4px solid rgba(100,100,100,1.0)';
        document.body.appendChild(this.editorDiv);

        this.editor = ace.edit(this.editorDiv);
        this.editor.setFontSize(14);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.getSession().setMode("ace/mode/javascript");
        this.editor.focus();

        this.editor.setValue(this.editorCC.aiStr || BSWG.ai_Template, -1);

    };

    this.removeEditor = function ( ) {

        if (!this.editor) {
            return;
        }

        this.lastCursor = this.editor.getCursorPosition();

        document.body.removeChild(this.editorDiv);
        this.editorDiv = null;
        this.editor.destroy();
        this.editor = null;

    };

    this.showDebug = false;

    this.openEditor = function (ccblock) {

        var self = this;

        this.closeEditor();

        this.editorCC = ccblock;
        this.showDebug = false;

        this.addEditor();

        this.consoleDiv = document.createElement('code');
        this.consoleDiv.style.position = 'fixed';
        this.consoleDiv.style.zIndex = '50';
        this.consoleDiv.style.width = (EDITOR_WIDTH-8) + 'px';
        this.consoleDiv.style.height = '144px';
        this.consoleDiv.style.top = '66px';
        this.consoleDiv.style.border = '4px solid rgba(100,100,100,1.0)';
        this.consoleDiv.style.overflowX = 'hidden';
        this.consoleDiv.style.overflowY = 'scroll';
        this.consoleDiv.style.color = 'rgb(248, 248, 242)';
        this.consoleDiv.style.backgroundColor = 'rgb(39, 40, 34)';
        this.consoleDiv.readOnly = true;
        document.body.appendChild(this.consoleDiv);

        if (this.lastCursor) {
            this.editor.navigateTo(this.lastCursor.row, this.lastCursor.column);
        }

        this.runBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 80, h: 50,
            text: "Run",
            selected: false,
            click: function (me) {
                self.logError('Run -------------');
                self.saveCode();
                self.editorCC.reloadAI();
            }
        });

        this.updateBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 125, h: 50,
            text: "Update",
            selected: false,
            click: function (me) {
                self.logError('Update ----------');
                self.saveCode();
                self.editorCC.reloadAI(true);
            }
        });

        this.stopBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 100, h: 50,
            text: "Stop",
            selected: false,
            click: function (me) {
                self.editorCC.removeAI();
                self.logError('Stop ------------');
            }
        });

        this.testMenuOpen = false;

        this.testBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 100, h: 50,
            text: "Test",
            selected: this.testMenuOpen,
            click: function (me) {
                self.testMenuOpen = !self.testMenuOpen;
                me.selected = self.testMenuOpen;
                if (self.testMenuOpen) {
                    self.testSelBtn.add();
                    if (self.testOtherShip && self.testOtherShipName) {
                        self.testRunBtn.add();
                    }
                }
                else {
                    self.testSelBtn.remove();
                    self.testRunBtn.remove();
                }
            }
        });

        this.testSelBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 115, h: 50,
            text: "Import",
            selected: false,
            click: function (me) {
            }
        });

        this.runMode = false;

        this.testRunBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 115, h: 50,
            text: "Run Test",
            selected: false,
            click: function (me) {
                me.selected = !me.selected;
                self.runMode = me.selected;
                if (me.selected) {
                    self.logError('Test Start ------');
                    self.saveCode();
                    me.text = "Stop Test";
                    self.removeEditor();
                    BSWG.game.shipTest(self.testOtherShip);
                    self.showDebugBtn.add();
                }
                else {
                    self.logError('Test End --------');
                    me.text = "Run Test";
                    self.addEditor();
                    BSWG.game.shipTest();
                    self.editorCC = BSWG.game.ccblock;
                    self.showDebugBtn.remove();
                }
            }
        });
        this.testSelBtn.remove();
        this.testRunBtn.remove();

        this.showDebugBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: -1000,
            w: 150, h: 50,
            text: "Show Debug",
            selected: this.showDebug,
            click: function (me) {
                self.showDebug = !self.showDebug;
                me.selected = self.showDebug;
            }
        });
        this.showDebugBtn.remove();

        this.getFile = BSWG.input.GET_FILE(function(data, x, y){
            if (!data) {
                if (!self.testSelBtn || !self.testMenuOpen) {
                    return false;
                }
                return x >= self.testSelBtn.p.x && y >= self.testSelBtn.p.y &&
                       x <= (self.testSelBtn.p.x + self.testSelBtn.w) && y <= (self.testSelBtn.p.y + self.testSelBtn.h);
            }

            try {
                self.testOtherShip = JSON.parse(data.data);
                self.testOtherShipName = data.filename;
            } catch (err) {
                self.testOtherShip = null;
                self.testOtherShipName = null;
            }
            
        }, "text");

    };

    this.closeEditor = function () {

        if (this.getFile) {
            BSWG.input.REMOVE_GFILE(this.getFile);
            this.getFile = null;
        }

        if (this.consoleDiv) {

            this.saveCode();

            this.removeEditor();

            document.body.removeChild(this.consoleDiv);
            this.consoleDiv = null;
            this.runBtn.destroy();
            this.runBtn.remove();
            this.runBtn = null;
            this.updateBtn.destroy();
            this.updateBtn.remove();
            this.updateBtn = null;
            this.stopBtn.destroy();
            this.stopBtn.remove();
            this.stopBtn = null;
            this.testBtn.destroy();
            this.testBtn.remove();
            this.testBtn = null;
            this.testSelBtn.destroy();
            this.testSelBtn.remove();
            this.testSelBtn = null;
            this.testRunBtn.destroy();
            this.testRunBtn.remove();
            this.testRunBtn = null;

            this.editorCC = null;
        }

    };

    this.logError = function(text) {
        text = text + '';
        var lines = text.match(/[^\r\n]+/g);
        if (!lines) {
            return;
        }
        for (var i=0; i<lines.length; i++) {
            if (lines[i].length > 70) {
                lines[i] = lines[i].substring(0, 35) + ' ... ' + lines[i].substring(lines[i].length-35);
            }
        }
        text = lines.join('\n') + '\n';
        console.log(text);
        if (this.consoleDiv) {
            this.consoleDiv.innerText += text + '\n';
            this.consoleDiv.scrollTop = this.consoleDiv.scrollHeight - this.consoleDiv.clientHeight;
        }
    };

    this.nextSave = 10;

    this.update = function ( ctx, dt ) {

        if (!this.consoleDiv) {
            return;
        }

        if (this.nextSave <= 0 && this.editor) {
            this.saveCode();
            this.nextSave = ~~((1/BSWG.render.dt) * 0.5);
        }
        this.nextSave -= 1;

        var mx = BSWG.input.MOUSE('x'), my = BSWG.input.MOUSE('y');

        if (this.editorDiv) {
            this.editorDiv.style.left = (10) + 'px';
            this.editorDiv.style.height = (window.innerHeight - 70 - 20 - 50 - 4 - (this.testMenuOpen ? 60 : 0) - 150 - 128) + 'px';
        }
        this.consoleDiv.style.left = (10) + 'px';
        if (this.editorDiv) {
            this.consoleDiv.style.top = (parseInt(this.editorDiv.style.top) + parseInt(this.editorDiv.style.height) + 12) + 'px';
        }

        if ((this.editorDiv &&
                mx >= parseInt(this.editorDiv.style.left) && my >= parseInt(this.editorDiv.style.top) &&
                mx < parseInt(this.editorDiv.style.left) + parseInt(this.editorDiv.style.width) &&
                my < parseInt(this.editorDiv.style.top) + parseInt(this.editorDiv.style.height)) ||
            (this.consoleDiv &&
                mx >= parseInt(this.consoleDiv.style.left) && my >= parseInt(this.consoleDiv.style.top) &&
                mx < parseInt(this.consoleDiv.style.left) + parseInt(this.consoleDiv.style.width) &&
                my < parseInt(this.consoleDiv.style.top) + parseInt(this.consoleDiv.style.height))) {
            BSWG.render.setCustomCursor(false);
            BSWG.input.EAT_MOUSE('wheel');
        }
        else {
            BSWG.render.setCustomCursor(true);
        }

        this.updateBtn.p.x = 10;
        this.updateBtn.p.y = BSWG.render.viewport.h - this.runBtn.h - 10 - 128;
        this.runBtn.p.x = this.updateBtn.p.x + this.updateBtn.w + 10;
        this.runBtn.p.y = this.updateBtn.p.y;
        this.stopBtn.p.x = this.runBtn.p.x + this.runBtn.w + 10;
        this.stopBtn.p.y = this.runBtn.p.y;
        this.testBtn.p.x = this.stopBtn.p.x + this.stopBtn.w + 10;
        this.testBtn.p.y = this.stopBtn.p.y;

        if (this.testMenuOpen) {
            this.testSelBtn.p.x = this.updateBtn.p.x;
            this.testSelBtn.p.y = this.updateBtn.p.y - 10 - this.testSelBtn.h + 3;
            this.testRunBtn.p.x = parseInt(this.consoleDiv.style.width) + parseInt(this.consoleDiv.style.left) - this.testRunBtn.w;
            this.testRunBtn.p.y = this.updateBtn.p.y - 10 - this.testSelBtn.h + 3;

            if (this.runMode) {
                this.consoleDiv.style.top = (window.innerHeight - (parseInt(this.consoleDiv.style.height) + 5 + 8)) + 'px';
                this.testSelBtn.p.y += 1000;
                this.testRunBtn.p.y = parseInt(this.consoleDiv.style.top) - (this.testRunBtn.h + 5);
                this.showDebugBtn.p.y = this.testRunBtn.p.y;
                this.showDebugBtn.p.x = this.testRunBtn.p.x - this.showDebugBtn.w - 10;
                this.runBtn.p.y += 1000;
                this.stopBtn.p.y += 1000;
                this.testBtn.p.y += 1000;
                this.updateBtn.p.y += 1000;
            }

            if (this.testOtherShip && this.testOtherShipName) {
                var x = this.runMode ? this.testSelBtn.p.x : this.testSelBtn.p.x + 10 + this.testSelBtn.w;
                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#00f';
                ctx.font = '10px Orbitron';
                ctx.textAlign = 'left';
                ctx.fillTextB(this.testOtherShipName, x, this.testSelBtn.p.y + this.testSelBtn.h * 0.5 + 10/2, true);
                this.testRunBtn.add();
            }
        }

        if (this.editorDiv) {
            if (this.editor.isFocused()) {
                this.editorDiv.style.border = '4px solid rgba(200,200,200,1.0)';
            }
            else {
                this.editorDiv.style.border = '4px solid rgba(100,100,100,1.0)';
            }
        }

    };

}();