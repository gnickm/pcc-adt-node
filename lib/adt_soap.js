// --------------------------------------------------------------------------
// lib/adt_soap.js
// --------------------------------------------------------------------------

var http  = require('http');
var soap  = require('soap');
var _     = require('lodash');

//--------------------------------------------------------------------------

var base64     = require('./base64');
var hl7        = require('./hl7');
var ADTManager = require('./adt_manager');

//--------------------------------------------------------------------------


var ADTSoapServer = function() {
    var self = this;
    this.server = http.createServer(function(request,response) {
        response.end("404: Not Found: " + request.url);
    });

    this.adtman = new ADTManager();

    this.service = {
        PCCSubmitMessage: {
            PCC2Soap: {
                SubmitMessage: function(args, done) {
                    self._doSubmitMessage(args, done);
                }
            }
        }
    };
};

ADTSoapServer.prototype.listen = function(inOptions) {
    var self = this;

    var options = _.assign({
        port: 8001,
        path: '/soap/adt',
        log : undefined,
        wsdl: './local-adt.wsdl',
        username: 'default-user',
        password: 'default-password'
    }, inOptions);

    var wsdl = require('fs').readFileSync(options.wsdl, 'utf8');
    self.server.listen(options.port);
    var soapServer = soap.listen(self.server, {
        path: options.path,
        services: self.service,
        xml: wsdl,
    });

    self.log = options.log;
    soapServer.log = self.log;
    self.adtman.log = self.log;

    self.username = options.username;
    self.password = options.password;
};

ADTSoapServer.prototype._doSubmitMessage = function(args, done) {
    var self = this;

    self.log('info', 'Handling SubmitMessage SOAP request');

    self.log('debug', 'Checking data argument');
    // Blow up SOAP style if we don't have a data argument
    if(!_.has(args, 'data')) {
        self.log('error', 'SubmitRequest missing required "data" argument');
        throw {
            Fault: {
                Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:BadArguments" }
                },
                Reason: { Text: "Missing required 'data' argument" }
            }
        };
    }

    // Sanity check for valid HL7
    var decodedHL7 = base64.decode(args.data).trim();
    if(!_.startsWith(decodedHL7, 'MSH')) {
        self.log('error', 'SubmitRequest "data" argument did not have valid Base64 encoded HL7 message');
        throw {
            Fault: {
                Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:BadArguments" }
                },
                Reason: { Text: "Required 'data' argument did not contain valid Base64 encoded HL7 message" }
            }
        };
    }

    hl7.parseString(decodedHL7, function(err, parsedMessage) {
        if(err) {
            self.log('error', 'SubmitRequest encountered error parsing "data" argument: ' + err.message);
            throw err;
        }

        var msh = hl7.getSegmentOfType('MSH', parsedMessage);

        self.log('debug', 'Checking SubmitRequest credentials');
        if(!_.has(args, 'username')) {
            self.log('warn', 'Missing required argument "username"');
            done({data: base64.encode(hl7.makeAckMessage(msh, 'AE', 'Missing required argument "username"'))});
        } else if(!_.has(args, 'password')) {
            self.log('warn', 'Missing required argument "password"');
            done({data: base64.encode(hl7.makeAckMessage(msh, 'AE', 'Missing required argument "password"'))});
        } else if(args.username != self.username || args.password != self.password) {
            self.log('warn', 'Invalid credentials');
            done({data: base64.encode(hl7.makeAckMessage(msh, 'AE', 'Invalid credentials'))});
        } else {
            self.log('info', 'SubmitRequest credentials accepted, calling handler');
            self.adtman.handle(parsedMessage, function(err) {
                if(err) {
                    // Error logging assumed to be done upstream
                    done({data: base64.encode(hl7.makeAckMessage(msh, 'AE', err.message))});
                } else {
                    done({data: base64.encode(hl7.makeAckMessage(msh, 'AA'))});
                }
            });
        }
    });
};

module.exports = ADTSoapServer;
