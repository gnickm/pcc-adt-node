// --------------------------------------------------------------------------
// lib/adt_soap.js
// --------------------------------------------------------------------------
'use strict';

var http  = require('http');
var https = require('https');
var soap  = require('soap');
var _     = require('lodash');
var fs    = require('fs');

//--------------------------------------------------------------------------

var base64     = require('./base64');
var hl7        = require('./hl7');
var ADTManager = require('./adt_manager');

//--------------------------------------------------------------------------


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

ADTSoapServer.prototype.listen = function(inOptions) {
    var options = _.assign({
        port: 8001,
        path: '/soap/adt',
        log : undefined,
        wsdl: './local-adt.wsdl',
        username: 'default-user',
        password: 'default-password'
    }, inOptions);

    this.log = options.log;
    this.adtman.log = this.log;

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

    this._log('info', 'Listening on port ' + options.port + ' at ' + options.path);

    soapServer.log = this.log;

    this.username = options.username;
    this.password = options.password;
};

ADTSoapServer.prototype.handler = function(messageType, handleFunc) {
    // handleFunc signature: function(message, done(error))
    this.adtman.register(messageType, handleFunc);
};

ADTSoapServer.prototype.close = function(done) {
    this.server.close(done);
};

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
                        done(null, {data: base64.encode(hl7.makeAckMessage(msh, 'AE', 'Missing required argument "username"'))});
                    } else if(!_.has(args, 'password')) {
                        self._log('warn', 'Missing required argument "password"');
                        done(null, {data: base64.encode(hl7.makeAckMessage(msh, 'AE', 'Missing required argument "password"'))});
                    } else if(args.username != self.username || args.password != self.password) {
                        self._log('warn', 'Invalid credentials');
                        done(null, {data: base64.encode(hl7.makeAckMessage(msh, 'AE', 'Invalid credentials'))});
                    } else {
                        self._log('info', 'SubmitRequest credentials accepted, calling handler');
                        self.adtman.handle(parsedMessage, function(err) {
                            if(err) {
                                // Error logging assumed to be done upstream
                                done(null, {data: base64.encode(hl7.makeAckMessage(msh, 'AE', err.message))});
                            } else {
                                done(null, {data: base64.encode(hl7.makeAckMessage(msh, 'AA'))});
                            }
                        });
                    }
                }
            });
        }
    }
};

ADTSoapServer.prototype._log = function(level, message) {
    if(typeof this.log === 'function') {
        this.log(level, message);
    }
};

module.exports = ADTSoapServer;
