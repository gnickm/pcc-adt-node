// --------------------------------------------------------------------------
// lib/adt_manager.js
// --------------------------------------------------------------------------
"use strict";

var _ = require('lodash');

//--------------------------------------------------------------------------

var hl7 = require('./hl7');

//--------------------------------------------------------------------------

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

ADTManager.prototype._getMessageType = function(message) {
    var evn = hl7.getSegmentOfType('EVN', message);
    if(evn) {
        return evn.parsed.TypeCode;
    } else {
        return false;
    }
};

ADTManager.prototype.register = function(messageType, callback) {
    var self = this;

    // callback signature: function(message, done(error))
    if(_.isFunction(callback)) {
        if(_.has(self._handlers, messageType)) {
            self._log('info', 'ADTManager.register(): Registered handler for ADT message type "' + messageType + '"');
            self._handlers[messageType] = callback;
            return callback;
        } else {
            self._log('warn', 'ADTManager.register(): Invalid ADT message type "' + messageType + '". Ignoring registration');
            return false;
        }
    } else {
        self._log('warn', 'ADTManager.register(): Callback parameter must be a function');
        return false;
    }
};

ADTManager.prototype.unregister = function(messageType) {
    var self = this;
    if(_.has(self._handlers, messageType)) {
        self._log('info', 'ADTManager.unregister(): Unregistered handler for ADT message type "' + messageType + '"');
        self._handlers[messageType] = null;
        return true;
    } else {
        self._log('warn', 'ADTManager.unregister(): Invalid ADT message type "' + messageType + '". Ignoring unregistration');
        return false;
    }
};

ADTManager.prototype.isRegistered = function(messageType) {
    var self = this;
    return (_.has(self._handlers, messageType) && self._handlers[messageType] != null);
};

ADTManager.prototype.validate = function(message, done) {
    var self = this;
    var messageType = self._getMessageType(message);
    if(!hl7.hasSegment('MSH', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "MSH" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "MSH" segment'));
    } else if(!hl7.hasSegment('EVN', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "EVN" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "EVN" segment'));
    } else if(!hl7.hasSegment('PID', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "PID" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "PID" segment'));
    } else if(!hl7.hasSegment('PV1', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "PV1" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "PV1" segment'));
    } else if(!hl7.hasSegment('ZEV', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "ZEV" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "ZEV" segment'));
    } else {
        self._log('debug', 'ADTManager.handle(): Incoming "' + messageType + '" message passed validation');
        done();
    }
};

ADTManager.prototype.handle = function(message, done) {
    var self = this;
    self._log('debug', 'ADTManager.handle(): Received incoming message, doing initial validation');

    if(!hl7.hasSegment('EVN', message, true)) {
        self._log('error', 'ADTManager.handle(): Incoming message malfomed, did not have expected one "EVN" segment');
        done(new Error('Incoming message malfomed, did not have expected one "EVN" segment'));
    } else {
        var messageType = self._getMessageType(message);
        if(!_.has(self._handlers, messageType)) {
            self._log('warn', 'ADTManager.handle(): Invalid ADT message type "' + messageType + '"');
            done(new Error('Invalid ADT message type "' + messageType + '"'));
        } else {
            self._log('info', 'ADTManager.handle(): Handling message of type "' + messageType + '"');
            self.validate(message, function(err) {
                if(err) {
                    self._log('error', 'ADTManager.handle(): Validation failed for message of type "' + messageType + '"');
                    done(err);
                } else {
                    self._log('debug', 'ADTManager.handle(): Validation passed, calling handler');
                    if(self.isRegistered(messageType)) {
                        var handler = self._handlers[messageType];
                        handler(message, done);
                    } else {
                        self._log('info', 'Message type "' + messageType + '" has no registered handler. Ignoring');
                        done();
                    }
                }
            });
        }
    }
};

ADTManager.prototype._log = function(level, message) {
    if(typeof this.log === 'function') {
        this.log(level, message);
    }
};

module.exports = ADTManager;