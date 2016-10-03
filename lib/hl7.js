// --------------------------------------------------------------------------
// lib/hl7.js
// --------------------------------------------------------------------------
'use strict';

var _       = require('lodash');
var split   = require('split');
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

var getSegmentOfType = function(segmentType, parsedMessage) {
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == segmentType) {
            return parsedMessage.segments[i];
        }
    }
    return null;
};

var getAllSegmentsOfType = function(segmentType, parsedMessage) {
    var segments = [];
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == segmentType) {
            segments.push(parsedMessage.segments[i]);
        }
    }
    return segments;
};

var splitDataField = function(dataFieldString, componentSep, repetitionSep) {
    var results = [];
    componentSep = componentSep ? componentSep : '^';
    repetitionSep = repetitionSep ? repetitionSep : '~';
    var repetitions = _.split(dataFieldString, repetitionSep);
    if(repetitions.length > 1) {
        _.forEach(repetitions, function(rep) {
            results.push(splitDataField(rep, componentSep, repetitionSep));
        });
    } else {
        var components = _.split(dataFieldString, componentSep);
        if(components.length > 1) {
            results = components;
        } else {
            results = dataFieldString;
        }
    }
    return results;
};

exports.splitDataField       = splitDataField;
exports.parseString          = parseString;
exports.hasSegment           = hasSegment;
exports.getSegmentOfType     = getSegmentOfType;
exports.getAllSegmentsOfType = getAllSegmentsOfType;
