BSWG.ai = new function() {

    var EDITOR_WIDTH = 550;

    this.init = function () {

        this.closeEditor();

    };

    this.openEditor = function (ccblock) {

        var self = this;

        this.closeEditor();

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

        this.editor.setValue(ccblock.aiStr || BSWG.ai_Template);

        this.runBtn = new BSWG.uiControl(BSWG.control_Button, {
            x: 10, y: 10,
            w: 80, h: 50,
            text: "Run",
            selected: false,
            click: function (me) {
                ccblock.aiStr = self.editor.getValue();
            }
        });

    };

    this.closeEditor = function () {

        if (this.editorDiv) {

            document.body.removeChild(this.editorDiv);
            this.editorDiv = null;
            this.editor = null;
            this.runBtn.destroy();
            this.runBtn.remove();
            this.runBtn = null;

        }

    }

    this.update = function ( ctx, dt ) {

        if (this.editorDiv) {

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

            this.runBtn.p.x = BSWG.render.viewport.w - EDITOR_WIDTH - 10;
            this.runBtn.p.y = BSWG.render.viewport.h - this.runBtn.h - 10;

            if (this.editor.isFocused()) {
                this.editorDiv.style.border = '4px solid rgba(140,140,200,1.0)';
            }
            else {
                this.editorDiv.style.border = '4px solid rgba(70,70,100,1.0)';
            }

        }

    };

}();