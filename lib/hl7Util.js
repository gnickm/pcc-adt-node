// --------------------------------------------------------------------------
// lib/hl7Util.js
// --------------------------------------------------------------------------

var stream = require('stream');
var split  = require('split');

var Parser  = require('nodengine-hl7').Parser;
var Segment = require('nodengine-hl7').Segment;

//--------------------------------------------------------------------------

var hl7Util = {
    parseString: function(messageString, done) {
        hl7Util.setupVariants();

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
    }
};

module.exports = hl7Util;