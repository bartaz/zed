/* global sandboxRequest */
define({
    load: function(name, req, onload, config) {
        sandboxRequest("zed/configfs", "readFile", [name], function(err, text) {
            if(err) {
                return console.error("Error while loading file", err);
            }
            console.log("Reloaded module", name);
            onload.fromText(text);
        });
    }
});