/*!
 * Copyright (C) 2016 Nick Mitchell
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var util   = require('util');
var http   = require('http');
var https  = require('https');
var soap   = require('soap');
var _      = require('lodash');
var fs     = require('fs');
var moment = require('moment');

/**
 * Local dependencies.
 */

var base64     = require('./base64');
var hl7        = require('./hl7');
var ADTManager = require('./adt_manager');

/**
 * Expose createApplication().
 */

exports = module.exports = createApplication;

/**
 * Create an ADT SOAP application.
 *
 * @return {Function}
 * @public
 */

function createApplication() {
    return new ADTSoapServer();
}


/**
 * Constructor
 *
 * @private
 */

var ADTSoapServer = function() {
    var self = this;

    this.adtman = new ADTManager();
    this.hl7 = hl7;

    this.service = {
        PCCSubmitMessage: {
            PCC2Soap: {
                SubmitMessage: function(args, done) {
                    self._doSubmitMessage(args, function(err, results) {
                        // Any errors we catch here will be treated as SOAP Faults
                        if(err) {
                            err.Fault = {
                                Code: {
                                    Value: 'soap:Sender',
                                    Subcode: { value: 'rpc:BadArguments' }
                                },
                                Reason: { Text: err.message }
                            };
                            done(err);
                        } else {
                            done(null, results);
                        }
                    });
                }
            }
        }
    };
};

/**
 * Starts the application listening for incoming SOAP messages. The `options`
 * parameter can contain the following:
 *
 * - wsdl (required) - path to the WSDL file defining the service. See
 *   examples/example.wsdl for a sample. Normally all that needs to change in
 *   the file is the soap:address tag
 *
 * - path (optional) - path on the server to listen on.
 *   Default: /soap/adt
 *
 * - port (optional) - port to listen on.
 *   Default: 8001
 *
 * - sslkey (optional) - path to key file used to enable SSL. Note that
 *   PointClickCare requires SSL to be enabled for all production servers.
 *   Default: undefined (no SSL)
 *
 * - sslcert (optional) - path to cert file used to enable SSL. Note that
 *   PointClickCare requires SSL to be enabled for all production servers.
 *   Default: undefined (no SSL)
 *
 * - log (optional) - function to use for logging. The function must implement
 *   the signature function(level, message). You can directly pass console.log,
 *   but be careful with scoping issues when passing other logging objects -- for
 *   example, passing winston.log will cause failures if not wrapped in an
 *   anonymous function.
 *   Default: undefined (no logging)
 *
 * - username (optional) - username for call to SOAP service.
 *   Default: default-user
 *
 * - password (optional) - password for call to SOAP service.
 *   Default: default-password
 *
 * @param {Object} options
 * @public
 */

ADTSoapServer.prototype.listen = function(inOptions) {
    var options = _.assign({
        port: 8001,
        path: '/soap/adt',
        log : undefined,
        username: 'default-user',
        password: 'default-password'
    }, inOptions);

    if(!_.has(options, 'wsdl')) {
        throw new Error('Required parameter "wsdl" was missing from options');
    }

    this.log = options.log;
    this.adtman.log = this.log;

    this.username = options.username;
    this.password = options.password;

    if(this.username == 'default-user' || this.password == 'default-password') {
        this._log('warn', 'Using default pcc-adt username or password. This should be changed for production ADT implementations');
    }

    if(options.sslkey && options.sslcert) {
        var sslopts = {
            key: fs.readFileSync(options.sslkey),
            cert: fs.readFileSync(options.sslcert)
        };
        this.server = https.createServer(sslopts, function(request,response) {
            response.end('404: Not Found: ' + request.url);
        });
        this._log('info', 'Starting SOAP server with SSL');
    } else {
        this.server = http.createServer(function(request, response) {
            response.end('404: Not Found: ' + request.url);
        });
        this._log('warn', 'Starting SOAP server without SSL. PointClickCare requires valid SSL certs for production ADT implementations');
    }

    var wsdl = fs.readFileSync(options.wsdl, 'utf8');
    this.server.listen(options.port);
    var soapServer = soap.listen(this.server, {
        path: options.path,
        services: this.service,
        xml: wsdl,
    });
    soapServer.log = this.log;

    this._log('info', 'Listening on port ' + options.port + ' at ' + options.path);
};

/**
 * Registers a handler for an event type of ADT message. eventType needs to be
 * one of the PointClickCare supported event types and handleFunc is a function
 * with the signature of function(message, done(err)).
 *
 * The handler will be passed the nodengine-hl7 parsed ADT message as the
 * message parameter. Following the typical callback pattern, the handler must
 * call the done function, either with no parameters to indicate success or an
 * Error object to notify the SOAP client of an application error.
 *
 * @param {Object} message
 * @param {function} handleFunc
 * @public
 */

ADTSoapServer.prototype.handler = function(eventType, handleFunc) {
    // handleFunc signature: function(message, done(error))
    this.adtman.register(eventType, handleFunc);
};

/**
 * Cleanly closes the listening app. Calls done when close is complete.
 *
 * @param {function} done
 * @public
 */

ADTSoapServer.prototype.close = function(done) {
    this.server.close(done);
};

/**
 * Main handler function for SubmitMessage SOAP requests
 *
 * @private
 */

ADTSoapServer.prototype._doSubmitMessage = function(args, done) {
    var self = this;

    self._log('info', 'Handling SubmitMessage SOAP request');

    self._log('debug', 'Checking data argument');
    if(!_.has(args, 'data')) {
        self._log('error', 'SubmitRequest missing required "data" argument');
        done(new Error('Missing required "data" argument'));
    } else {
        // Sanity check for valid HL7
        var decodedHL7 = base64.decode(args.data).trim();
        if(!_.startsWith(decodedHL7, 'MSH')) {
            self._log('error', 'SubmitRequest "data" argument did not have valid Base64 encoded HL7 message');
            done(new Error('Required "data" argument did not contain valid Base64 encoded HL7 message'));
        } else {
            hl7.parseString(decodedHL7, function(err, parsedMessage) {
                if(err) {
                    self._log('error', 'SubmitRequest encountered error parsing "data" argument: ' + err.message);
                    done(new Error('SubmitRequest encountered error parsing "data" argument: ' + err.message));
                } else {
                    var msh = hl7.getSegmentOfType('MSH', parsedMessage);

                    self._log('debug', 'Checking SubmitRequest credentials');
                    if(!_.has(args, 'username')) {
                        self._log('warn', 'Missing required argument "username"');
                        done(null, {data: base64.encode(self._makeAckMessage(msh, 'AE', 'Missing required argument "username"'))});
                    } else if(!_.has(args, 'password')) {
                        self._log('warn', 'Missing required argument "password"');
                        done(null, {data: base64.encode(self._makeAckMessage(msh, 'AE', 'Missing required argument "password"'))});
                    } else if(args.username != self.username || args.password != self.password) {
                        self._log('warn', 'Invalid credentials');
                        done(null, {data: base64.encode(self._makeAckMessage(msh, 'AE', 'Invalid credentials'))});
                    } else {
                        self._log('info', 'SubmitRequest credentials accepted, calling handler');
                        try {
                            self.adtman.handle(parsedMessage, function(err) {
                                if(err) {
                                    // Error logging assumed to be done upstream
                                    done(null, {data: base64.encode(self._makeAckMessage(msh, 'AE', err.message))});
                                } else {
                                    done(null, {data: base64.encode(self._makeAckMessage(msh, 'AA'))});
                                }
                            });
                        } catch(err) {
                            self._log('error', 'Caught unexpected error from handler: ' + err);
                            done(null, {data: base64.encode(self._makeAckMessage(msh, 'AE', 'Caught unexpected error from handler: ' + err))});
                        }
                    }
                }
            });
        }
    }
};

/**
 * Creates an HL7 ack message string for the SOAP service. Creates either an
 * AA message for positive result, or an AE message for negative
 *
 * @private
 */

ADTSoapServer.prototype._makeAckMessage = function(mshSegment, ackCode, errorMessage) {
    var sendingTime = moment();
    var template = 'MSH|^~\&|%s|%s|%s|%s|%s||ACK|%s|%s|2.5\rMSA|%s|%s\r';
    var message = util.format(template,
        mshSegment.parsed.ReceivingApplication, // Sending app
        mshSegment.parsed.ReceivingFacility,    // Sending facility
        mshSegment.parsed.SendingApplication,   // Receiving app
        mshSegment.parsed.SendingFacility,   // Receiving facility
        sendingTime.format('YYYYMMDDHHmmss'),   // Message timestamp
        mshSegment.parsed.MessageControlID,     // Message control ID
        mshSegment.parsed.ProcessingID,         // Processing ID
        ackCode,
        mshSegment.parsed.MessageControlID     // Message control ID
    );

    if(ackCode != 'AA' && errorMessage) {
        message += util.format('ERR|%s|||||||%s\r', ackCode, errorMessage);
    }

    return message;

};

/**
 * Internal logger, does a quick check to see if the log has been set
 *
 * @private
 */

ADTSoapServer.prototype._log = function(level, message) {
    if(typeof this.log === 'function') {
        this.log(level, message);
    }
};
