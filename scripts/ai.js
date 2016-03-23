BSWG.ai = new function() {

    var EDITOR_WIDTH = 550;

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

    this.openEditor = function (ccblock) {

        var self = this;

        this.closeEditor();

        this.editorCC = ccblock;

        this.editorDiv = document.createElement('div');
        this.editorDiv.style.position = 'fixed';
        this.editorDiv.style.zIndex = '50';
        this.editorDiv.style.width = (EDITOR_WIDTH-8) + 'px';
        this.editorDiv.style.height = '400px';
        this.editorDiv.style.top = '66px';
        this.editorDiv.style.border = '4px solid rgba(70,70,100,1.0)';
        document.body.appendChild(this.editorDiv);

        this.consoleDiv = document.createElement('code');
        this.consoleDiv.style.position = 'fixed';
        this.consoleDiv.style.zIndex = '50';
        this.consoleDiv.style.width = (EDITOR_WIDTH-8) + 'px';
        this.consoleDiv.style.height = '144px';
        this.consoleDiv.style.top = '66px';
        this.consoleDiv.style.border = '4px solid rgba(70,70,100,1.0)';
        this.consoleDiv.style.overflowX = 'hidden';
        this.consoleDiv.style.overflowY = 'scroll';
        this.consoleDiv.style.color = 'rgb(248, 248, 242)';
        this.consoleDiv.style.backgroundColor = 'rgb(39, 40, 34)';
        this.consoleDiv.readOnly = true;
        document.body.appendChild(this.consoleDiv);

        this.editor = ace.edit(this.editorDiv);
        this.editor.setFontSize(14);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.getSession().setMode("ace/mode/javascript");
        this.editor.focus();

        this.editor.setValue(ccblock.aiStr || BSWG.ai_Template, -1);
        if (this.lastCursor) {
            this.editor.navigateTo(this.lastCursor.row, this.lastCursor.column);
        }

        this.runBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 80, h: 50,
            text: "Run",
            selected: false,
            click: function (me) {
                self.saveCode();
                self.editorCC.reloadAI();
            }
        });

        this.updateBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 125, h: 50,
            text: "Update",
            selected: false,
            click: function (me) {
                self.saveCode();
                self.editorCC.reloadAI(true);
            }
        });

        this.testMenuOpen = false;

        this.testBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
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
            x: 10, y: 10,
            w: 115, h: 50,
            text: "Import",
            selected: false,
            click: function (me) {
            }
        });

        this.testRunBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 115, h: 50,
            text: "Run Test",
            selected: false,
            click: function (me) {
            }
        });
        this.testSelBtn.remove();
        this.testRunBtn.remove();

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

        if (this.editorDiv) {

            this.saveCode();

            this.lastCursor = this.editor.getCursorPosition();

            document.body.removeChild(this.editorDiv);
            this.editorDiv = null;
            document.body.removeChild(this.consoleDiv);
            this.consoleDiv = null;
            this.editor.destroy();
            this.editor = null;
            this.runBtn.destroy();
            this.runBtn.remove();
            this.runBtn = null;
            this.updateBtn.destroy();
            this.updateBtn.remove();
            this.updateBtn = null;
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

        if (this.editorDiv) {

            if (this.nextSave <= 0) {
                this.saveCode();
                this.nextSave = 60 * 5;
            }
            this.nextSave -= 1;

            var mx = BSWG.input.MOUSE('x'), my = BSWG.input.MOUSE('y');

            this.editorDiv.style.left = (window.innerWidth - EDITOR_WIDTH - 10) + 'px';
            this.editorDiv.style.height = (window.innerHeight - 70 - 20 - 50 - 4 - (this.testMenuOpen ? 60 : 0) - 150) + 'px';
            this.consoleDiv.style.left = (window.innerWidth - EDITOR_WIDTH - 10) + 'px';
            this.consoleDiv.style.top = (parseInt(this.editorDiv.style.top) + parseInt(this.editorDiv.style.height) + 12) + 'px';

            if (mx >= parseInt(this.editorDiv.style.left) && my >= parseInt(this.editorDiv.style.top) &&
                mx < parseInt(this.editorDiv.style.left) + parseInt(this.editorDiv.style.width) &&
                my < parseInt(this.editorDiv.style.top) + parseInt(this.editorDiv.style.height) + 162) {
                BSWG.render.setCustomCursor(false);
                BSWG.input.EAT_MOUSE('wheel');
            }
            else {
                BSWG.render.setCustomCursor(true);
            }

            this.updateBtn.p.x = BSWG.render.viewport.w - EDITOR_WIDTH - 10;
            this.updateBtn.p.y = BSWG.render.viewport.h - this.runBtn.h - 10;
            this.runBtn.p.x = this.updateBtn.p.x + this.updateBtn.w + 10;
            this.runBtn.p.y = this.updateBtn.p.y;
            this.testBtn.p.x = this.runBtn.p.x + this.runBtn.w + 10;
            this.testBtn.p.y = this.runBtn.p.y;

            if (this.testMenuOpen) {
                this.testSelBtn.p.x = this.updateBtn.p.x;
                this.testSelBtn.p.y = this.updateBtn.p.y - 10 - this.testSelBtn.h;
                this.testRunBtn.p.x = BSWG.render.viewport.w - 10 - this.testRunBtn.w;
                this.testRunBtn.p.y = this.updateBtn.p.y - 10 - this.testSelBtn.h;
                if (this.testOtherShip && this.testOtherShipName) {
                    var x = this.testSelBtn.p.x + 10 + this.testSelBtn.w;
                    ctx.fillStyle = '#aaa';
                    ctx.strokeStyle = '#00f';
                    ctx.font = '10px Orbitron';
                    ctx.textAlign = 'left';
                    ctx.fillTextB(this.testOtherShipName, x, this.testSelBtn.p.y + this.testSelBtn.h * 0.5 + 10/2, true);
                    this.testRunBtn.add();
                }
            }

            if (this.editor.isFocused()) {
                this.editorDiv.style.border = '4px solid rgba(140,140,200,1.0)';
            }
            else {
                this.editorDiv.style.border = '4px solid rgba(70,70,100,1.0)';
            }

        }

    };

}();