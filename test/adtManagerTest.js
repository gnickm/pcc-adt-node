// --------------------------------------------------------------------------
// test/adtManagerTest.js
// --------------------------------------------------------------------------

var expect = require('chai').expect;

var adtman = require('../lib/adtManager');
var hl7Util = require('../lib/hl7Util.js');

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

    describe('handle()', function() {
        it('should fail if missing EVN segment (required for every message type)', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                // "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                adtman.handle(parsedMessage, function(err) {
                    expect(err).to.not.equal(null);
                    done();
                });
            });

        });
        it('should fail if missing PID segment (required for every message type)', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                // "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                adtman.handle(parsedMessage, function(err) {
                    expect(err).to.not.equal(null);
                    done();
                });
            });

        });
    });

});