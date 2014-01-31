/**
 * File system module that uses Chrome's chooseEntry openDirectory
 * http://developer.chrome.com/apps/fileSystem.html#method-chooseEntry
 * Only supported in Chrome 31+ (currently in Canary)
 */
/*global define chrome _ nodeRequire */
define(function(require, exports, module) {
    var async = require("../lib/async");
    var poll_watcher = require("./poll_watcher");
    var nodeFs = nodeRequire("fs");

    return function(rootPath, callback) {
        // Copy and paste from project.js, but cannot important that due to
        // recursive imports.
        function dirname(path) {
            if (path[path.length - 1] === '/') {
                path = path.substring(0, path.length - 1);
            }
            var parts = path.split("/");
            return parts.slice(0, parts.length - 1).join("/");
        }

        function stripRoot(filename) {
            return filename.substring(rootPath.length);
        }

        function addRoot(filename) {
            return rootPath + filename;
        }

        function mkdirs(path, callback) {
            var parts = path.split("/");
            if (parts.length === 1) {
                callback();
            } else {
                mkdirs(parts.slice(0, parts.length - 1).join("/"), function(err) {
                    if (err) {
                        return callback(err);
                    }
                    nodeFs.exists(path, function(exists) {
                        if (exists) {
                            callback();
                        } else {
                            nodeFs.mkdir(path, callback);
                        }
                    })
                });
            }
        }

        var fs = {
            listFiles: function(callback) {
                var files = [];
                function readDir(dir, callback) {
                    nodeFs.readdir(dir, function(err, entries) {
                        if (err) {
                            return callback(err);
                        }
                        async.parForEach(entries, function(entry, next) {
                            if (entry[0] === ".") {
                                return next();
                            }
                            var fullPath = dir + "/" + entry;
                            nodeFs.lstat(fullPath, function(err, stat) {
                                if (err) {
                                    return next(err);
                                }
                                if (stat.isDirectory()) {
                                    readDir(fullPath, next);
                                } else {
                                    files.push(fullPath);
                                    next();
                                }
                            });
                        }, callback);
                    });
                }
                readDir(rootPath, function() {
                    callback(null, files.map(stripRoot));
                });
            },
            readFile: function(path, callback) {
                var fullPath = addRoot(path);
                nodeFs.readFile(fullPath, {
                    encoding: 'utf8'
                }, function(err, contents) {
                    if (err) {
                        return callback(err);
                    }
                    nodeFs.lstat(fullPath, function(err, stat) {
                        if(err) {
                            console.error("Readfile successful, but error during stat:", err);
                        }
                        watcher.setCacheTag(path, "" + stat.mtime);
                        callback(null, contents);
                    });
                });
            },
            writeFile: function(path, content, callback) {
                var fullPath = addRoot(path);
                // First ensure parent dir exists
                mkdirs(dirname(fullPath), function(err) {
                    if (err) {
                        return callback(err);
                    }
                    nodeFs.writeFile(fullPath, content, function(err) {
                        if (err) {
                            return callback(err);
                        }
                        nodeFs.lstat(fullPath, function(err, stat) {
                            watcher.setCacheTag(path, "" + stat.mtime);
                            callback();
                        });
                    });
                });
            },
            deleteFile: function(path, callback) {
                var fullPath = addRoot(path);
                nodeFs.unlink(fullPath, callback);
            },
            watchFile: function(path, callback) {
                watcher.watchFile(path, callback);
            },
            unwatchFile: function(path, callback) {
                watcher.unwatchFile(path, callback);
            },
            getCacheTag: function(path, callback) {
                nodeFs.lstat(addRoot(path), function(err, stat) {
                    if(err) {
                        return callback(404);
                    }
                    callback(null, "" + stat.mtime);
                });
            }
        };

        var watcher = poll_watcher(fs, 3000);
        callback(null, fs);
    };
});