// --------------------------------------------------------------------------
// lib/adt_soap.js
// --------------------------------------------------------------------------

var http  = require('http');
var soap  = require('soap');
var _     = require('lodash');

//--------------------------------------------------------------------------

var ADTManager = require('./adt_manager');

//--------------------------------------------------------------------------


var ADTSoapServer = function(inOptions) {
    var self = this;
    this.options = _.assign({
        port: 8001,
        path: '/soap/adt',
        log : undefined,
        wsdl: './local-adt.wsdl'
    }, inOptions);

    this.server = http.createServer(function(request,response) {
        response.end("404: Not Found: " + request.url);
    });

    this.adtman = new ADTManager();
    this.adtman.log = this.options.log;

    this.service = {
        PCCSubmitMessage: {
            PCC2Soap: {
                SubmitMessage: function(args) {
                    return {
                        data: args.data
                    };
                }
            }
        }
    };
};

ADTSoapServer.prototype.listen = function() {
    var self = this;
    var wsdl = require('fs').readFileSync(self.options.wsdl, 'utf8');
    self.server.listen(self.options.port);
    var soapServer = soap.listen(self.server, {
        path: self.options.path,
        services: self.service,
        xml: wsdl,
    });
    soapServer.log = self.options.log;
};

module.exports = ADTSoapServer;
