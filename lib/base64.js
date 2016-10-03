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
 * Encodes a string to base64
 *
 * @public
 */

var encode = function(str) {
    if(_.isString(str)) {
        return new Buffer(str).toString('base64');
    } else {
        return null;
    }
};

/**
 * Dencodes a string from base64
 *
 * @public
 */

var decode = function(base64Str) {
    if(_.isString(base64Str)) {
        return new Buffer(base64Str, 'base64').toString('ascii');
    } else {
        return null;
    }
};

exports.encode = encode;
exports.decode = decode;