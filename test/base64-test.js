// --------------------------------------------------------------------------
// test/base64-test.js
// --------------------------------------------------------------------------

var expect   = require('chai').expect;

//--------------------------------------------------------------------------

var base64 = require('../lib/base64');

//--------------------------------------------------------------------------

describe('Base64 Util Functions', function() {
    describe('encode()', function() {
        it('should encode string', function(done) {
            expect(base64.encode('Hello World')).to.equal('SGVsbG8gV29ybGQ=');
            done();
        });
        it('should not blow up on goofy stuff', function(done) {
            expect(base64.encode(null)).to.be.null;
            expect(base64.encode(1234)).to.be.null;
            expect(base64.encode({foo: 'bar'})).to.be.null;
            expect(base64.encode([])).to.be.null;
            done();
        });
    });
    describe('decode()', function() {
        it('should decode string', function(done) {
            expect(base64.decode('SGVsbG8gV29ybGQ=')).to.equal('Hello World');
            done();
        });
        it('should not blow up on goofy stuff', function(done) {
            expect(base64.decode(null)).to.be.null;
            expect(base64.decode(1234)).to.be.null;
            expect(base64.decode({foo: 'bar'})).to.be.null;
            expect(base64.decode([])).to.be.null;
            done();
        });
    });
});