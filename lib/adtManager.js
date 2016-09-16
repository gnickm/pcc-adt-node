// --------------------------------------------------------------------------
// lib/adtManager.js
// --------------------------------------------------------------------------

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
        adtman.handlerMap[messageType] = callback;
    },

    handle: function(message, done) {

    },

    getMessageType: _getMessageType
};

module.exports = adtman;