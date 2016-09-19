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
            expect(adtman.register('A03', function(){})).to.not.be.false;
            expect(adtman.isRegistered('A03')).to.be.true;
            done();
        });
        it('should fail to register unsupported message type', function(done) {
            expect(adtman.register('FOO', function(){})).to.be.false;
            expect(adtman.isRegistered('FOO')).to.be.false;
            done();
        });
        it('should fail to register junk', function(done) {
            expect(adtman.isRegistered('A06')).to.be.false;
            expect(adtman.register('A06', null)).to.be.false;
            expect(adtman.isRegistered('A06')).to.be.false;
            expect(adtman.register('A06', 1234)).to.be.false;
            expect(adtman.isRegistered('A06')).to.be.false;
            expect(adtman.register('A06', {})).to.be.false;
            expect(adtman.isRegistered('A06')).to.be.false;
            expect(adtman.register('A06', [])).to.be.false;
            expect(adtman.isRegistered('A06')).to.be.false;
            done();
        });
    });
    describe('unregister()', function() {
        it('should unregister a valid function', function(done) {
            expect(adtman.isRegistered('A07')).to.be.false;
            adtman.register('A07', function(){});
            expect(adtman.isRegistered('A07')).to.be.true;
            expect(adtman.unregister('A07', function(){})).to.be.true;
            expect(adtman.isRegistered('A07')).to.be.false;
            expect(adtman.unregister('A07', function(){})).to.be.true;
            expect(adtman.isRegistered('A07')).to.be.false;
            done();
        });
        it('should unregister unregistered function and a second time OK', function(done) {
            expect(adtman.unregister('A07', function(){})).to.be.true;
            adtman.register('A07', function(){});
            expect(adtman.unregister('A07', function(){})).to.be.true;
            expect(adtman.unregister('A07', function(){})).to.be.true;
            done();
        });
        it('should expect weird stuff to not blow up', function(done) {
            expect(adtman.unregister('FOO')).to.be.false;
            expect(adtman.unregister(null)).to.be.false;
            expect(adtman.unregister([])).to.be.false;
            expect(adtman.unregister({})).to.be.false;
            expect(adtman.unregister([1,2,3])).to.be.false;
            expect(adtman.unregister({foo: 'bar'})).to.be.false;
            done();
        });
    });
});