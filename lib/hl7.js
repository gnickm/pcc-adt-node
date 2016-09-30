// --------------------------------------------------------------------------
// lib/hl7.js
// --------------------------------------------------------------------------
'use strict';

var util = require('util');

var _       = require('lodash');
var split   = require('split');
var moment  = require('moment');
var str2stm = require('string-to-stream');

var Parser  = require('nodengine-hl7').Parser;
var Segment = require('nodengine-hl7').Segment;

//--------------------------------------------------------------------------

var parseString = function(messageString, done) {
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

/**
 * Returns true if message has the segment. If onlyOnce is set, only returns
 * true if segment appears exactly once.
 *
 * @param {String} segmentType
 * @param {Object} parsedMessage
 * @param {boolean} onlyOnce
 * @return {booelan}
 * @public
 */
var hasSegment = function(segmentType, parsedMessage, onlyOnce) {
    var count = 0;
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == segmentType) {
            count++;
        }
    }
    return (count == 1 || (count > 1 && (onlyOnce != true)));
};

var getSegmentOfType = function(segmentType, parsedMessage, getMultiple) {
    var segments = [];
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == segmentType) {
            if(getMultiple) {
                segments.push(parsedMessage.segments[i]);
            } else {
                return parsedMessage.segments[i];
            }
        }
    }
    return (getMultiple ? segments : null);
};

var splitDataField = function(dataField, componentSep, repetitionSep) {
    var results = [];
    componentSep = componentSep ? componentSep : '^';
    repetitionSep = repetitionSep ? repetitionSep : '~';
    var repetitions = _.split(dataField, repetitionSep);
    if(repetitions.length > 1) {
        _.forEach(repetitions, function(rep) {
            results.push(splitDataField(rep));
        });
    } else {
        var components = _.split(dataField, componentSep);
        if(components.length > 1) {
            results = components;
        } else {
            results = dataField;
        }
    }
    return results;
};

var makeAckMessage = function(mshSegment, ackCode, errorMessage) {
    var sendingTime = moment();
    var template = 'MSH|^~\&|%s|%s|%s|%s|%s||ACK|%s|%s|2.5\rMSA|%s|%s\r';
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
        message += util.format('ERR|%s|||||||%s\r', ackCode, errorMessage);
    }

    return message;

};

exports.splitDataField   = splitDataField;
exports.parseString      = parseString;
exports.hasSegment       = hasSegment;
exports.getSegmentOfType = getSegmentOfType;
exports.makeAckMessage   = makeAckMessage;
