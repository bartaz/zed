/*global define */
define(function(require, exports, module) {
    
    return function(isConfigurationProject, callback) {
        if (typeof window.chrome === "undefined") {
            require(["./union", "./static", "./node"], function(unionfs, staticfs, nodefs) {
                var fs = nodeRequire("fs");
                staticfs("config", {
                    readOnlyFn: function(path) {
                        return path !== "/.zedstate" && path !== "/user.json";
                    }
                }, function(err, configStatic) {
                    var configHome = process.env.HOME + "/.zed";
                    
                    if(!fs.existsSync(configHome)) {
                        fs.mkdirSync(configHome);
                    }
                    nodefs(configHome, function(err, configSync) {
                        unionfs([configSync, configStatic], {
                            watchSelf: !isConfigurationProject
                        }, function(err, io) {
                            callback(null, io);
                        });
                    });
                });
            });
        } else {
            require(["./union", "./static", "./sync"], function(unionfs, staticfs, syncfs) {
                staticfs("config", {
                    readOnlyFn: function(path) {
                        return path !== "/.zedstate" && path !== "/user.json";
                    }
                }, function(err, configStatic) {
                    syncfs("config", function(err, configSync) {
                        unionfs([configSync, configStatic], {
                            watchSelf: !isConfigurationProject
                        }, function(err, io) {
                            callback(null, io);
                        });
                    });
                });
            });
        }
    };
});