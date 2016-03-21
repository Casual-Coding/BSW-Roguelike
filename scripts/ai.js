BSWG.ai = new function() {

    var EDITOR_WIDTH = 550;

    this.init = function () {

        this.closeEditor();

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
            }
        });

        this.updateBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 125, h: 50,
            text: "Update",
            selected: false,
            click: function (me) {
                self.saveCode();
            }
        });

    };

    this.closeEditor = function () {

        if (this.editorDiv) {

            this.saveCode();

            this.lastCursor = this.editor.getCursorPosition();

            document.body.removeChild(this.editorDiv);
            this.editorDiv = null;
            this.editor.destroy();
            this.editor = null;
            this.runBtn.destroy();
            this.runBtn.remove();
            this.runBtn = null;
            this.updateBtn.destroy();
            this.updateBtn.remove();
            this.updateBtn = null;
            this.editorCC = null;
        }

    }

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
            this.editorDiv.style.height = (window.innerHeight - 70 - 20 - 50 - 4) + 'px';

            if (mx >= parseInt(this.editorDiv.style.left) && my >= parseInt(this.editorDiv.style.top) &&
                mx < parseInt(this.editorDiv.style.left) + parseInt(this.editorDiv.style.width) &&
                my < parseInt(this.editorDiv.style.top) + parseInt(this.editorDiv.style.height)) {
                BSWG.render.setCustomCursor(false);
            }
            else {
                BSWG.render.setCustomCursor(true);
            }

            this.updateBtn.p.x = BSWG.render.viewport.w - EDITOR_WIDTH - 10;
            this.updateBtn.p.y = BSWG.render.viewport.h - this.runBtn.h - 10;
            this.runBtn.p.x = this.updateBtn.p.x + this.updateBtn.w + 10;
            this.runBtn.p.y = this.updateBtn.p.y;

            if (this.editor.isFocused()) {
                this.editorDiv.style.border = '4px solid rgba(140,140,200,1.0)';
            }
            else {
                this.editorDiv.style.border = '4px solid rgba(70,70,100,1.0)';
            }

        }

    };

}();