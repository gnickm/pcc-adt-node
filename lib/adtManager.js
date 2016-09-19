// --------------------------------------------------------------------------
// lib/adtManager.js
// --------------------------------------------------------------------------

var _ = require('lodash');

//--------------------------------------------------------------------------

var logger  = require('./logger.js');
var hl7Util = require('./hl7Util.js');

//--------------------------------------------------------------------------

var _pccMessages = {
    'A01': {
        validate: function(message, next) {
        }
    }
};

var _getMessageType = function(message) {
    var evn = hl7Util.getSegmentOfType('EVN', message);
    if(evn) {
        return evn.TypeCode;
    } else {
        return false;
    }
};


var notHandled = function(message, done) {
    logger.info('Message type "' + _getMessageType(message) + '" has no registered handler. Ignoring');
    done();
};

var adtman = {
    handlerMap: {
        'A01': notHandled,
        'A02': notHandled,
        'A03': notHandled,
        'A06': notHandled,
        'A07': notHandled,
        'A08': notHandled,
        'A11': notHandled,
        'A12': notHandled,
        'A13': notHandled,
        'A21': notHandled,
        'A22': notHandled,
        'A52': notHandled,
        'A53': notHandled,
        'P05': notHandled
    },

    register: function(messageType, callback) {
        // callback signature: function(message, done(error))
        if(_.isFunction(callback)) {
            if(_.has(adtman.handlerMap, messageType)) {
                logger.info('ADTManager.register(): Registered handler for ADT message type "' + messageType + '"');
                adtman.handlerMap[messageType] = callback;
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
        if(_.has(adtman.handlerMap, messageType)) {
            logger.info('ADTManager.unregister(): Unregistered handler for ADT message type "' + messageType + '"');
            adtman.handlerMap[messageType] = notHandled;
            return true;
        } else {
            logger.warn('ADTManager.unregister(): Invalid ADT message type "' + messageType + '". Ignoring unregistration');
            return false;
        }
    },

    isRegistered: function(messageType) {
        return (_.has(adtman.handlerMap, messageType) && adtman.handlerMap[messageType] != notHandled);
    },

    handle: function(message, done) {
        logger.debug('ADTManager.handle(): Received incoming message, doing initial validation');

        if(!hl7Util.hasSegment('MSH', message, true)) {
            logger.error('ADTManager.handle(): Incoming message malfomed, did not have expected one "MSH" segment');
            done(new Error('Incoming message malfomed, did not have expected one "MSH" segment'));
        }

        if(!hl7Util.hasSegment('EVN', message, true)) {
            logger.error('ADTManager.handle(): Incoming message malfomed, did not have expected one "EVN" segment');
            done(new Error('Incoming message malfomed, did not have expected one "EVN" segment'));
        }

        if(!hl7Util.hasSegment('PID', message, true)) {
            logger.error('ADTManager.handle(): Incoming message malfomed, did not have expected one "PID" segment');
            done(new Error('Incoming message malfomed, did not have expected one "PID" segment'));
        }

        logger.info('ADTManager.handle(): Handling message of type "' + _getMessageType(message) + '"');

    },

    getMessageType: _getMessageType
};

module.exports = adtman;