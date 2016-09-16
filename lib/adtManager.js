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
    logger.info('Message "' + _getMessageType(message) + '" is not handled');
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
                logger.info('register(): Registered handler for ADT message type "' + messageType + '"');
                adtman.handlerMap[messageType] = callback;
            } else {
                logger.warn('register(): Invalid ADT message type "' + messageType + '". Ignoring registration');
            }
        } else {
            logger.warn('register(): Callback parameter must be a function');
        }
    },

    unregister: function(messageType) {
        if(_.has(adtman.handlerMap, messageType)) {
            logger.info('unregister(): Unregistered handler for ADT message type "' + messageType + '"');
            adtman.handlerMap[messageType] = notHandled;
        } else {
            logger.warn('unregister(): Invalid ADT message type "' + messageType + '". Ignoring unregistration');
        }
    },

    isRegistered: function(messageType) {
        return (_.has(adtman.handlerMap, messageType) && adtman.handlerMap[messageType] != notHandled);
    },

    handle: function(message, done) {

    },

    getMessageType: _getMessageType
};

module.exports = adtman;