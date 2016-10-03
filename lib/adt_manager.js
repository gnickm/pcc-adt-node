/*!
 * Copyright (C) 2016 Nick Mitchell
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash');

/**
 * Local dependencies.
 */

var hl7 = require('./hl7');

/**
 * Constructor
 *
 * @private
 */

var ADTManager = function() {
    var self = this;
    self._handlers = {
        'A01': null,
        'A02': null,
        'A03': null,
        'A06': null,
        'A07': null,
        'A08': null,
        'A11': null,
        'A12': null,
        'A13': null,
        'A21': null,
        'A22': null,
        'A52': null,
        'A53': null,
        'P05': null
    };
};

/**
 * Returns the ADT event type given a nodengine-hl7 parsed HL7 message
 *
 * @private
 */

ADTManager.prototype.getADTEventType = function(message) {
    var evn = hl7.getSegmentOfType('EVN', message);
    if(evn) {
        return evn.parsed.TypeCode;
    } else {
        return false;
    }
};

/**
 * Register a handler for an ADT event type
 *
 * @private
 */

ADTManager.prototype.register = function(eventType, callback) {
    var self = this;

    // callback signature: function(message, done(error))
    if(_.isFunction(callback)) {
        if(_.has(self._handlers, eventType)) {
            self._log('info', 'ADTManager.register(): Registered handler for ADT message type "' + eventType + '"');
            self._handlers[eventType] = callback;
            return callback;
        } else {
            self._log('warn', 'ADTManager.register(): Invalid ADT message type "' + eventType + '". Ignoring registration');
            return false;
        }
    } else {
        self._log('warn', 'ADTManager.register(): Callback parameter must be a function');
        return false;
    }
};

/**
 * Unregister a handler for an ADT event type
 *
 * @private
 */

ADTManager.prototype.unregister = function(eventType) {
    var self = this;
    if(_.has(self._handlers, eventType)) {
        self._log('info', 'ADTManager.unregister(): Unregistered handler for ADT message type "' + eventType + '"');
        self._handlers[eventType] = null;
        return true;
    } else {
        self._log('warn', 'ADTManager.unregister(): Invalid ADT message type "' + eventType + '". Ignoring unregistration');
        return false;
    }
};

/**
 * Check if a handler for an ADT event type is registered
 *
 * @private
 */

ADTManager.prototype.isRegistered = function(eventType) {
    var self = this;
    return (_.has(self._handlers, eventType) && self._handlers[eventType] != null);
};

/**
 * Validate an ADT message. Uses done() pattern to return positive or negative
 * results.
 *
 * @private
 */

ADTManager.prototype.validate = function(message, done) {
    var self = this;
    var eventType = self.getADTEventType(message);

    // MSH segment is required by parser so we don't need to check here

    // EVN segment is checked prior to the validate() call

    if(!hl7.hasSegment('PID', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + eventType + '" message malfomed, did not have expected one "PID" segment');
        done(new Error('Incoming "' + eventType + '" message malfomed, did not have expected one "PID" segment'));
    } else if(!hl7.hasSegment('PV1', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + eventType + '" message malfomed, did not have expected one "PV1" segment');
        done(new Error('Incoming "' + eventType + '" message malfomed, did not have expected one "PV1" segment'));
    } else if(!hl7.hasSegment('ZEV', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + eventType + '" message malfomed, did not have expected one "ZEV" segment');
        done(new Error('Incoming "' + eventType + '" message malfomed, did not have expected one "ZEV" segment'));
    } else {
        self._log('debug', 'ADTManager.handle(): Incoming "' + eventType + '" message passed validation');
        done();
    }
};

/**
 * Handles an ADT message. The process is as follows:
 *
 * - Validate legit ADT event type
 * - Validate message that it has all the PCC required things
 * - Call the associated handler function if there is one registered
 *
 * @private
 */

ADTManager.prototype.handle = function(message, done) {
    var self = this;
    self._log('debug', 'ADTManager.handle(): Received incoming message, doing initial validation');

    if(!hl7.hasSegment('EVN', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming message malfomed, did not have expected one "EVN" segment');
        done(new Error('Incoming message malfomed, did not have expected one "EVN" segment'));
    } else {
        var eventType = self.getADTEventType(message);
        if(!_.has(self._handlers, eventType)) {
            self._log('warn', 'ADTManager.handle(): Invalid ADT message type "' + eventType + '"');
            done(new Error('Invalid ADT event type "' + eventType + '"'));
        } else {
            self._log('info', 'ADTManager.handle(): Handling event of type "' + eventType + '"');
            self.validate(message, function(err) {
                if(err) {
                    self._log('error', 'ADTManager.handle(): Validation failed for event of type "' + eventType + '"');
                    done(err);
                } else {
                    self._log('debug', 'ADTManager.handle(): Validation passed, calling handler');
                    if(self.isRegistered(eventType)) {
                        var handler = self._handlers[eventType];
                        handler(message, done);
                    } else {
                        self._log('info', 'Event type "' + eventType + '" has no registered handler. Ignoring');
                        done();
                    }
                }
            });
        }
    }
};

/**
 * Internal logger, does a quick check to see if the log has been set
 *
 * @private
 */

ADTManager.prototype._log = function(level, message) {
    if(typeof this.log === 'function') {
        this.log(level, message);
    }
};

module.exports = ADTManager;