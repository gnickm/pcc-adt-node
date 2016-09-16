// --------------------------------------------------------------------------
// test/adtManagerTest.js
// --------------------------------------------------------------------------

var expect = require('chai').expect;

var adtman = require('../lib/adtManager');

//--------------------------------------------------------------------------

describe('ADT Manager Functions', function() {
    describe('isRegistered()', function() {
        it('should expect all handlers to start out unregistered', function(done) {
            expect(adtman.isRegistered('A01')).to.be.false;
            expect(adtman.isRegistered('A02')).to.be.false;
            expect(adtman.isRegistered('A03')).to.be.false;
            done();
        });
        it('should expect weird stuff to not blow up', function(done) {
            expect(adtman.isRegistered('FOO')).to.be.false;
            expect(adtman.isRegistered(null)).to.be.false;
            expect(adtman.isRegistered([])).to.be.false;
            expect(adtman.isRegistered({})).to.be.false;
            expect(adtman.isRegistered([1,2,3])).to.be.false;
            expect(adtman.isRegistered({foo: 'bar'})).to.be.false;
            done();
        });
        it('should return true if a message type is registered', function(done) {
            adtman.register('A02', function(){});
            expect(adtman.isRegistered('A02')).to.be.true;
            done();
        });
    });
    describe('register()', function() {
        it('should register a valid function', function(done) {
            expect(adtman.isRegistered('A03')).to.be.false;
            adtman.register('A03', function(){});
            expect(adtman.isRegistered('A03')).to.be.true;
            done();
        });
    });
});