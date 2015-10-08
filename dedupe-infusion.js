/*
Dedupe Infusion

Copyright 2015 Raising the Floor (International)

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/kettle/LICENSE.txt
*/

"use strict";

var pkg = require("./package.json"),
    path = require("path"),
    fs = require("fs"),
    glob = require("glob");
    
var dedupe = {};

dedupe.shallowMerge = function (target/*,  ... */) {
    for (var arg = 1; arg < arguments.length; ++ arg) {
        var source = arguments[arg];
        for (var key in source) {
            target[key] = source[key];
        }
    }
    return target;
};

// Utility to recursively delete a directory and its contents from http://www.geedew.com/2012/10/24/remove-a-directory-that-is-not-empty-in-nodejs/
// Useful for cleaning up before and after test cases

dedupe.deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                dedupe.deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

dedupe.processFiles = function (infusions, node_modules) {
    var infusionSegs = infusions.map(function (onePath) {
        // Whilst the "path" module exports an entry "path.sep" purportedly holding this path separator,
        // in practice this is not the one used by the grunt file expander
        return onePath.split("/");
    }).filter(function (oneSegs) {
        return oneSegs.length === 1 || oneSegs[oneSegs.length - 2] === "node_modules";
    });
    console.log("Found " + infusionSegs.length + " infusion" + (infusionSegs.length === 1 ? "" : "s"));
    // Locate the copy of infusion at the shortest path depth
    infusionSegs.sort(function (a, b) {
        return a.length - b.length;
    });
    infusions = infusionSegs.map(function (oneSegs) {
        return oneSegs.join("/");
    });
    if (infusionSegs.length === 0) {
        return {
            isError: true,
            message: "Warning - no instances of Infusion library discovered in " + path.resolve(node_modules)
        };
    }
    if (infusionSegs.length >= 2 && infusionSegs[0].length === infusionSegs[1].length) {
        return {
            isError: true,
            message: "Warning - found two closest instances of Infusion at the same path depth: " + infusions[0] + " and " + infusions[1] + ": not proceeding"
        };
    }
    var togo = [];
    for (var i = 1; i < infusions.length; i++) {
        togo.push(node_modules + "/" + infusions[i]);
    }
    return togo;
};

dedupe.deleteFiles = function (toDelete) {
    toDelete.forEach(function (relDir) {
        var dir = path.resolve(relDir);
        console.log("Deleting " + dir);
        dedupe.deleteFolderRecursive(dir);
    });
};

dedupe.exitError = function (message) {
    console.error(message);
    process.exit(-1);
};

dedupe.dedupeInfusion = function (userOptions) {
    var defaults = pkg.defaultOptions;
    var options = dedupe.shallowMerge({}, defaults, userOptions);
  
    var node_modules = options.node_modules;
    var files = glob.sync("**/infusion", {
        cwd: node_modules
    });
    var toDelete = dedupe.processFiles(files, node_modules);
    if (toDelete.isError) {
        dedupe.exitError(toDelete.message);
    } else {
        dedupe.deleteFiles(toDelete);
    }
};

dedupe.shallowMerge(dedupe.dedupeInfusion, dedupe);

module.exports = dedupe.dedupeInfusion;

if (require.main === module) {
    dedupe.dedupeInfusion();
}
