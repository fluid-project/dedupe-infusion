/*
Dedupe Infusion

Copyright 2015 Raising the Floor (International)

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/kettle/LICENSE.txt
*/

"use strict";

var dedupe = require("../dedupe-infusion.js"),
    assert = require("assert");

var fixtures = [{
    input: [
        "thing1/node_modules/infusion",
        "thing2/node_modules/thing3/node_modules/infusion"
    ],
    output: [
        "./node_modules/thing2/node_modules/thing3/node_modules/infusion"
    ]
}, { // order-independent
    input: [
        "thing2/node_modules/thing3/node_modules/infusion",
        "thing1/node_modules/infusion"
    ],
    output: [
        "./node_modules/thing2/node_modules/thing3/node_modules/infusion"
    ]
}, { // without node_modules penultimate is ignored (GPII-1303)
    input: [
        "thing1/node_modules/infusion",
        "thing2/node_modules/thing3/node_modules/infusion",
        "thing4/node_modules/thing5/infusion"
    ],
    output: [
        "./node_modules/thing2/node_modules/thing3/node_modules/infusion"
    ]
}, {
    input: [
        "thing1/node_modules/infusion",
        "thing2/node_modules/thing3/node_modules/infusion",
        "thing4/node_modules/thing5/node_modules/thing6/node_modules/infusion"
    ],
    output: [
        "./node_modules/thing2/node_modules/thing3/node_modules/infusion",
        "./node_modules/thing4/node_modules/thing5/node_modules/thing6/node_modules/infusion"
    ]
}];

var errorFixtures = [{
    input: [
        "thing1/node_modules/infusion",
        "thing2/node_modules/infusion"
    ]
}, {
    input: [
    ]
}, {
    input: [ // without node_modules penultimate is ignored
        "thing1/infusion"
    ]
}];

fixtures.forEach(function (fixture) {
    var toDelete = dedupe.processFiles(fixture.input, "./node_modules");
    console.log("Output is ", toDelete);
    assert.deepEqual(toDelete, fixture.output, "Expected output for fixture " + JSON.stringify(fixture.input));
});

errorFixtures.forEach(function (fixture) {
    var toDelete = dedupe.processFiles(fixture.input, "./node_modules");
    console.log("Output is ", toDelete);
    assert(toDelete.isError, "Expected error for fixture " + JSON.stringify(fixture.input));
});