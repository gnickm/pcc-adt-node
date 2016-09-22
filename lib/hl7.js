// --------------------------------------------------------------------------
// lib/hl7Util.js
// --------------------------------------------------------------------------
"use strict";

var stream = require('stream');
var split  = require('split');

var Parser  = require('nodengine-hl7').Parser;
var Segment = require('nodengine-hl7').Segment;

//--------------------------------------------------------------------------

var setupVariants = function() {
    var variant = require('./zev_variant');
    Segment.registerVariant(variant);
};

var parseString = function(messageString, done) {
    setupVariants();

    // Create a readable and push the string onto it
    var s = new stream.Readable();
    s._read = function noop() {};
    s.push(messageString);
    s.push(null);

    var variant = require('./zev_variant');
    Segment.registerVariant(variant);
    var parser = new Parser();
    s.pipe(split(/\r/)).pipe(parser);
    parser.on('error', done);
    parser.on('message', function(parsedMessage) {
        done(null, parsedMessage);
    });
};

var hasSegment = function(expected, parsedMessage, onlyOnce) {
    var count = 0;
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == expected) {
            count++;
        }
    }
    return (count == 1 || (count > 1 && (onlyOnce != true)));
};

var getSegmentOfType = function(expected, parsedMessage, getMultiple) {
    var segments = [];
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == expected) {
            if(getMultiple) {
                segments.push(parsedMessage.segments[i]);
            } else {
                return parsedMessage.segments[i];
            }
        }
    }
    return (getMultiple ? segments : null);
};

exports.setupVariants    = setupVariants;
exports.parseString      = parseString;
exports.hasSegment       = hasSegment;
exports.getSegmentOfType = getSegmentOfType;
