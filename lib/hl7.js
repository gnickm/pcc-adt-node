/*!
 * Copyright (C) 2016 Nick Mitchell
 * MIT Licensed
 */
'use strict';

/**
 * Module dependencies.
 */

var _       = require('lodash');
var split   = require('split');
var str2stm = require('string-to-stream');
var Parser  = require('nodengine-hl7').Parser;
var Segment = require('nodengine-hl7').Segment;

/**
 * Calls done function with a nodengine-hl7 parsed message in the parsedMessage
 * parameter given a valid HL7 message in messageString. If an error occurs,
 * done will be called with an Error object. This utility function handles the
 * fact that nodengine-hl7 only works with streams. To parse from a file or
 * other stream, see the original nodengine-hl7 project.
 *
 * @param {String} messageString
 * @param {function} done
 * @public
 */

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
 * Returns true if nodengine-hl7 parsed message parsedMessage has a segment of
 * segmentType, false if it does not. If onlyOnce is true, the function will
 * only return true if there is exactly one segment of segmentType.
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

/**
 * Returns the first segment of type segmentType found in nodengine-hl7 parsed
 * message parsedMessage or null if the segment is not found.
 *
 * @param {String} segmentType
 * @param {Object} parsedMessage
 * @return {Object}
 * @public
 */

var getSegmentOfType = function(segmentType, parsedMessage) {
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == segmentType) {
            return parsedMessage.segments[i];
        }
    }
    return null;
};

/**
 * Returns all segments of type segmentType found in nodengine-hl7 parsed
 * message parsedMessage as an array or an empty array if the segment is not
 * found.
 *
 * @param {String} segmentType
 * @param {Object} parsedMessage
 * @return {Array}
 * @public
 */

var getAllSegmentsOfType = function(segmentType, parsedMessage) {
    var segments = [];
    for(var i = 0; i < parsedMessage.segments.length; i++) {
        if(parsedMessage.segments[i].parsed.SegmentType == segmentType) {
            segments.push(parsedMessage.segments[i]);
        }
    }
    return segments;
};

/**
 * Splits up an HL7 data field string dataFieldString using component separator
 * componentSep and repetition separator repetitionSep. Returns an array of
 * fields broken up. This will be embedded in an array if there are more than
 * one repetition.
 *
 * @param {String} dataFieldString
 * @param {Object} componentSep
 * @param {Object} repetitionSep
 * @return {Array|String}
 * @public
 */

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
