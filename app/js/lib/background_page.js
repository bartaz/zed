/* global chrome */
define(function(require, exports, module) {
    var backgroundPage = null;
    if (typeof window.chrome === 'undefined') {
        return {
            getBackgroundPage: function() {
                return {
                    projects: {},
                    execExtensionCommand: function(url, name, spec, info, callback) {
                        callback(null, []);
                    },
                    getAllConfigs: function() {
                        return [];
                    }
                };
            }
        };
    }
    chrome.runtime.getBackgroundPage(function(bg) {
        backgroundPage = bg;
    });
    return {
        getBackgroundPage: function() {
            return backgroundPage;
        }
    };
});