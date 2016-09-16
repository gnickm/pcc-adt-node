// --------------------------------------------------------------------------
// test/hl7UtilTest.js
// --------------------------------------------------------------------------

var expect   = require('chai').expect;
var deepeql  = require('deep-equal');

var hl7Util = require('../lib/hl7Util');

//--------------------------------------------------------------------------

describe('HL7 Util Functions', function() {
    describe('parseString()', function() {
        it('should parse a legit ADT message string', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                expect(deepeql(parsedMessage.segmentTypes, ['MSH', 'EVN', 'PID', 'PV1', 'ZEV'])).to.be.true;
                done();
            });
        });
        it('should parse a message string, even if it is not a legit ADT message', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                expect(deepeql(parsedMessage.segmentTypes, ['MSH', 'PID', 'ZEV'])).to.be.true;
                done();
            });
        });
        it('should fail if the message is not valid', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "blaaaaaah\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.not.equal(null);
                expect(parsedMessage).to.be.undefined;
                done();
            });
        });
    });
    describe('hasSegment()', function() {
        it('should return true for included segments, false for anything else', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(hl7Util.hasSegment('MSH', parsedMessage)).to.be.true;
                expect(hl7Util.hasSegment('EVN', parsedMessage)).to.be.true;
                expect(hl7Util.hasSegment('PID', parsedMessage)).to.be.true;
                expect(hl7Util.hasSegment('PV1', parsedMessage)).to.be.true;
                expect(hl7Util.hasSegment('ZEV', parsedMessage)).to.be.true;

                expect(hl7Util.hasSegment('FOO', parsedMessage)).to.be.false;
                expect(hl7Util.hasSegment('BAR', parsedMessage)).to.be.false;
                expect(hl7Util.hasSegment('BAZ', parsedMessage)).to.be.false;
                expect(hl7Util.hasSegment('ZIP', parsedMessage)).to.be.false;

                done();
            });
        });

        it('should return true for segments included once if onlyOnce set, false otherwise', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(hl7Util.hasSegment('EVN', parsedMessage)).to.be.true;
                expect(hl7Util.hasSegment('EVN', parsedMessage, true)).to.be.false;

                done();
            });
        });
    });
    describe('getSegmentOfType()', function() {
        it('should return segment if found, null if not found when requesting single segment', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segment = hl7Util.getSegmentOfType('MSH', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('MSH');

                segment = hl7Util.getSegmentOfType('ZEV', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('ZEV');

                expect(hl7Util.getSegmentOfType('FOO', parsedMessage)).to.be.null;
                expect(hl7Util.getSegmentOfType('BAR', parsedMessage)).to.be.null;
                expect(hl7Util.getSegmentOfType('BAZ', parsedMessage)).to.be.null;
                expect(hl7Util.getSegmentOfType('ZIP', parsedMessage)).to.be.null;

                done();
            });
        });

        it('should return first segment if there are multiple and only one requested', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|2|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|3|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segment = hl7Util.getSegmentOfType('PV1', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('PV1');
                expect(segment.parsed.SetID).to.equal('1');

                done();
            });
        });

        it('should return all found segments, or empty array if not found when requesting multiple segments', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|2|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|3|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segments = hl7Util.getSegmentOfType('MSH', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(1);
                expect(segments[0].parsed.SegmentType).to.equal('MSH');

                segments = hl7Util.getSegmentOfType('PV1', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(3);
                expect(segments[0].parsed.SegmentType).to.equal('PV1');
                expect(segments[0].parsed.SetID).to.equal('1');
                expect(segments[1].parsed.SegmentType).to.equal('PV1');
                expect(segments[1].parsed.SetID).to.equal('2');
                expect(segments[2].parsed.SegmentType).to.equal('PV1');
                expect(segments[2].parsed.SetID).to.equal('3');

                segments = hl7Util.getSegmentOfType('FOO', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(0);

                done();
            });
        });
    });
});