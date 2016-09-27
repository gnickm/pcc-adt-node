// --------------------------------------------------------------------------
// lib/hl7.js
// --------------------------------------------------------------------------
"use strict";

var util = require('util');

var stream  = require('stream');
var split   = require('split');
var moment  = require('moment');
var str2stm = require('string-to-stream');

var Parser  = require('nodengine-hl7').Parser;
var Segment = require('nodengine-hl7').Segment;

//--------------------------------------------------------------------------

var setupVariants = function() {
    var variant = require('./zev_variant');
    Segment.registerVariant(variant);
};

var parseString = function(messageString, done) {
    setupVariants();

    Segment.registerVariant(require('./zev_variant'));
    Segment.registerVariant(require('./err_variant'));

    var parser = new Parser();
    str2stm(messageString).pipe(split(/\r/)).pipe(parser);
    parser.on('error', function(err) {
        done(err);
    });
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

var makeAckMessage = function(mshSegment, ackCode, errorMessage) {
    var sendingTime = moment();
    var template = "MSH|^~\&|%s|%s|%s|%s|%s||ACK|%s|%s|2.5\rMSA|%s|%s\r";
    var message = util.format(template,
        mshSegment.parsed.ReceivingApplication, // Sending app
        mshSegment.parsed.ReceivingFacility,    // Sending facility
        mshSegment.parsed.SendingApplication,   // Receiving app
        mshSegment.parsed.SendingFacility,   // Receiving facility
        sendingTime.format('YYYYMMDDHHmmss'),   // Message timestamp
        mshSegment.parsed.MessageControlID,     // Message control ID
        mshSegment.parsed.ProcessingID,         // Processing ID
        ackCode,
        mshSegment.parsed.MessageControlID     // Message control ID
    );

    if(ackCode != 'AA' && errorMessage) {
        message += util.format("ERR|%s|||||||%s\r", ackCode, errorMessage);
    }

    return message;

};

exports.setupVariants    = setupVariants;
exports.parseString      = parseString;
exports.hasSegment       = hasSegment;
exports.getSegmentOfType = getSegmentOfType;
exports.makeAckMessage   = makeAckMessage;
