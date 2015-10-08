/*
Copyright 2015 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        jshint: {
            all: ["dedupe-infusion.js", "test/test-dedupe-infusion.js", "Gruntfile.js"],
            buildScripts: ["Gruntfile.js"],
            options: {
                jshintrc: true
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");

    grunt.registerTask("lint", "Apply jshint", ["jshint"]);
    grunt.registerTask("default", ["jshint"]);
};