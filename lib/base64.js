// --------------------------------------------------------------------------
// lib/base64.js
// --------------------------------------------------------------------------

var _ = require('lodash');

//--------------------------------------------------------------------------

var encode = function(str) {
    if(_.isString(str)) {
        return new Buffer(str).toString('base64');
    } else {
        return null;
    }
};

var decode = function(base64Str) {
    if(_.isString(base64Str)) {
        return new Buffer(base64Str, 'base64').toString('ascii');
    } else {
        return null;
    }
};

exports.encode = encode;
exports.decode = decode;