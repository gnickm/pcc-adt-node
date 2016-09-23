// --------------------------------------------------------------------------
// test/adt_soap-test.js
// --------------------------------------------------------------------------

var expect = require('chai').expect;
var soap   = require('soap');

//--------------------------------------------------------------------------

var ADTSoapServer = require('../lib/adt_soap');

//--------------------------------------------------------------------------

var soapServer = new ADTSoapServer({wsdl: 'test/fixtures/local-adt.wsdl', log: console.log});
var soapUrl = 'http://127.0.0.1:8001/soap/adt?wsdl';

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
//                    console.log(result);
                    // console.log(err);
                    expect(err).to.be.null;
                    done();
                });
            });
        });
    });
});