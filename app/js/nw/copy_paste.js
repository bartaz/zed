/* global nodeRequire */
define(function(require, exports, module) {
    var command = require("../command");
    var gui = nodeRequire("nw.gui");
    var clipboard = gui.Clipboard.get();
    
    command.define("Edit:Copy", {
        exec: function(edit, session) {
            var selectionRange = edit.getSelection().getRange();
            var text = session.getTextRange(selectionRange);
            clipboard.set(text, 'text');
        },
        readOnly: true
    });
    
    command.define("Edit:Cut", {
        exec: function(edit, session) {
            var selectionRange = edit.getSelection().getRange();
            var text = session.getTextRange(selectionRange);
            session.remove(selectionRange);
            clipboard.set(text, 'text');
        },
        readOnly: true
    });
    
    command.define("Edit:Paste", {
        exec: function(edit, session) {
            var pos = edit.getCursorPosition();
            session.insert(pos, clipboard.get());
        },
        readOnly: true
    });
});