// --------------------------------------------------------------------------
// lib/adtManager.js
// --------------------------------------------------------------------------

var _ = require('lodash');

//--------------------------------------------------------------------------

var logger  = require('./logger.js');
var hl7Util = require('./hl7Util.js');

//--------------------------------------------------------------------------

var _getMessageType = function(message) {
    var evn = hl7Util.getSegmentOfType('EVN', message);
    if(evn) {
        return evn.parsed.TypeCode;
    } else {
        return false;
    }
};

var notHandled = function(message, done) {
    logger.info('Message type "' + _getMessageType(message) + '" has no registered handler. Ignoring');
    done();
};

var defaultValidation = function(message, done) {
    var messageType = _getMessageType(message);
    if(!hl7Util.hasSegment('MSH', message, true)) {
        logger.error('ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "MSH" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "MSH" segment'));
    } else if(!hl7Util.hasSegment('EVN', message, true)) {
        logger.error('ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "EVN" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "EVN" segment'));
    } else if(!hl7Util.hasSegment('PID', message, true)) {
        logger.error('ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "PID" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "PID" segment'));
    } else if(!hl7Util.hasSegment('PV1', message, true)) {
        logger.error('ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "PV1" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "PV1" segment'));
    } else if(!hl7Util.hasSegment('ZEV', message, true)) {
        logger.error('ADTManager.handle(): Incoming "' + messageType + '" message malfomed, did not have expected one "ZEV" segment');
        done(new Error('Incoming "' + messageType + '" message malfomed, did not have expected one "ZEV" segment'));
    } else {
        logger.debug('ADTManager.handle(): Incoming "' + messageType + '" message passed validation');
        done();
    }

};

var adtman = {
    _pccMessages: {
        'A01': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A02': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A03': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A06': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A07': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A08': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A11': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A12': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A13': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A21': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A22': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A52': {
            handle: notHandled,
            validate: defaultValidation
        },
        'A53': {
            handle: notHandled,
            validate: defaultValidation
        },
        'P05': {
            handle: notHandled,
            validate: defaultValidation
        }
    },

    register: function(messageType, callback) {
        // callback signature: function(message, done(error))
        if(_.isFunction(callback)) {
            if(_.has(adtman._pccMessages, messageType)) {
                logger.info('ADTManager.register(): Registered handler for ADT message type "' + messageType + '"');
                adtman._pccMessages[messageType].handle = callback;
                return callback;
            } else {
                logger.warn('ADTManager.register(): Invalid ADT message type "' + messageType + '". Ignoring registration');
                return false;
            }
        } else {
            logger.warn('ADTManager.register(): Callback parameter must be a function');
            return false;
        }
    },

    unregister: function(messageType) {
        if(_.has(adtman._pccMessages, messageType)) {
            logger.info('ADTManager.unregister(): Unregistered handler for ADT message type "' + messageType + '"');
            adtman._pccMessages[messageType].handle = notHandled;
            return true;
        } else {
            logger.warn('ADTManager.unregister(): Invalid ADT message type "' + messageType + '". Ignoring unregistration');
            return false;
        }
    },

    isRegistered: function(messageType) {
        return (_.has(adtman._pccMessages, messageType) && adtman._pccMessages[messageType].handle != notHandled);
    },

    handle: function(message, done) {
        logger.debug('ADTManager.handle(): Received incoming message, doing initial validation');

        if(!hl7Util.hasSegment('EVN', message, true)) {
            logger.error('ADTManager.handle(): Incoming message malfomed, did not have expected one "EVN" segment');
            done(new Error('Incoming message malfomed, did not have expected one "EVN" segment'));
        } else {
            var messageType = adtman.getMessageType(message);
            if(!_.has(adtman._pccMessages, messageType)) {
                logger.warn('ADTManager.register(): Invalid ADT message type "' + messageType + '"');
                done(new Error('Invalid ADT message type "' + messageType + '"'));
            } else {
                logger.info('ADTManager.handle(): Handling message of type "' + messageType + '"');
                adtman._pccMessages[messageType].validate(message, function(err) {
                    if(err) {
                        logger.error('ADTManager.handle(): Validation failed for message of type "' + messageType + '"');
                        done(err);
                    } else {
                        logger.debug('ADTManager.handle(): Validation passed, calling handler');
                        adtman._pccMessages[messageType].handle(message, done);
                    }
                });
            }
        }
    },

    getMessageType: _getMessageType
};

module.exports = adtman;