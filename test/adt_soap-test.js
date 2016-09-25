// --------------------------------------------------------------------------
// test/adt_soap-test.js
// --------------------------------------------------------------------------

var expect = require('chai').expect;
var soap   = require('soap');

//--------------------------------------------------------------------------

var ADTSoapServer = require('../lib/adt_soap');

//--------------------------------------------------------------------------

var soapOptions = {
    wsdl: 'test/fixtures/local-adt.wsdl',
    log: console.log // uncomment to enable console logging
};
var soapUrl = 'http://127.0.0.1:8001/soap/adt?wsdl';
var soapServer = new ADTSoapServer(soapOptions);

describe('ADT SOAP Functions', function() {
    describe('listen()', function() {
        before(function() {
            soapServer.listen();
        });

        it('should be callable via SOAP client', function(done) {
            var args = {
                username: 'foo',
                password: 'bar',
                data: 'Hello world'
            };
            soap.createClient(soapUrl, function(err, client) {
                expect(err).to.be.null;
                client.SubmitMessage(args, function(err, result) {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
    });
});