// --------------------------------------------------------------------------
// test/hl7Test.js
// --------------------------------------------------------------------------

var expect   = require('chai').expect;
var deepeql  = require('deep-equal');

//--------------------------------------------------------------------------

var hl7 = require('../lib/hl7');

//--------------------------------------------------------------------------

describe('HL7 Util Functions', function() {
    describe('parseString()', function() {
        it('should parse a legit ADT message string', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                expect(deepeql(parsedMessage.segmentTypes, ['MSH', 'EVN', 'PID', 'PV1', 'ZEV'])).to.be.true;
                done();
            });
        });
        it('should parse a message string, even if it is not a legit ADT message', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                expect(deepeql(parsedMessage.segmentTypes, ['MSH', 'PID', 'ZEV'])).to.be.true;
                done();
            });
        });
        it('should fail if the message is not valid', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "blaaaaaah\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.not.equal(null);
                expect(parsedMessage).to.be.undefined;
                done();
            });
        });
    });
    describe('hasSegment()', function() {
        it('should return true for included segments, false for anything else', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(hl7.hasSegment('MSH', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('EVN', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('PID', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('PV1', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('ZEV', parsedMessage)).to.be.true;

                expect(hl7.hasSegment('FOO', parsedMessage)).to.be.false;
                expect(hl7.hasSegment('BAR', parsedMessage)).to.be.false;
                expect(hl7.hasSegment('BAZ', parsedMessage)).to.be.false;
                expect(hl7.hasSegment('ZIP', parsedMessage)).to.be.false;

                done();
            });
        });

        it('should return true for segments included once if onlyOnce set, false otherwise', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(hl7.hasSegment('EVN', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('EVN', parsedMessage, true)).to.be.false;

                done();
            });
        });
    });

    describe('getSegmentOfType()', function() {
        it('should return segment if found, null if not found when requesting single segment', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segment = hl7.getSegmentOfType('MSH', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('MSH');

                segment = hl7.getSegmentOfType('ZEV', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('ZEV');

                expect(hl7.getSegmentOfType('FOO', parsedMessage)).to.be.null;
                expect(hl7.getSegmentOfType('BAR', parsedMessage)).to.be.null;
                expect(hl7.getSegmentOfType('BAZ', parsedMessage)).to.be.null;
                expect(hl7.getSegmentOfType('ZIP', parsedMessage)).to.be.null;

                done();
            });
        });

        it('should return first segment if there are multiple and only one requested', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|2|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|3|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segment = hl7.getSegmentOfType('PV1', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('PV1');
                expect(segment.parsed.SetID).to.equal('1');

                done();
            });
        });

        it('should return all found segments, or empty array if not found when requesting multiple segments', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|2|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|3|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segments = hl7.getSegmentOfType('MSH', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(1);
                expect(segments[0].parsed.SegmentType).to.equal('MSH');

                segments = hl7.getSegmentOfType('PV1', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(3);
                expect(segments[0].parsed.SegmentType).to.equal('PV1');
                expect(segments[0].parsed.SetID).to.equal('1');
                expect(segments[1].parsed.SegmentType).to.equal('PV1');
                expect(segments[1].parsed.SetID).to.equal('2');
                expect(segments[2].parsed.SegmentType).to.equal('PV1');
                expect(segments[2].parsed.SetID).to.equal('3');

                segments = hl7.getSegmentOfType('FOO', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(0);

                done();
            });
        });
    });

    describe('makeAckMessage()', function() {
        it('should return a valid AA message', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var msh = hl7.getSegmentOfType('MSH', parsedMessage);
                var msaString = hl7.makeAckMessage(msh, 'AA');
                hl7.parseString(msaString, function(err, parsedMsa) {
                    expect(err).to.be.null;
                    var newmsh = hl7.getSegmentOfType('MSH', parsedMsa);
                    expect(newmsh.parsed.ReceivingApplication).to.equal(msh.parsed.SendingApplication);
                    expect(newmsh.parsed.ReceivingFacility).to.equal(msh.parsed.SendingFacility);
                    expect(newmsh.parsed.SendingApplication).to.equal(msh.parsed.ReceivingApplication);
                    expect(newmsh.parsed.SendingFacility).to.equal(msh.parsed.ReceivingFacility);
                    expect(newmsh.parsed.DateTime).to.not.equal(msh.parsed.DateTime);
                    expect(newmsh.parsed.MessageControlID).to.equal(msh.parsed.MessageControlID);
                    expect(newmsh.parsed.ProcessingID).to.equal(msh.parsed.ProcessingID);

                    var msa = hl7.getSegmentOfType('MSA', parsedMsa);
                    expect(msa.parsed.ControlID).to.equal(msh.parsed.MessageControlID);
                    expect(msa.parsed.AcknowledgementCode).to.equal('AA');

                    expect(hl7.getSegmentOfType('ERR', parsedMsa)).to.be.null;

                    done();
                });
            });
        });

        it('should return a valid AE message', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var msh = hl7.getSegmentOfType('MSH', parsedMessage);
                var msaString = hl7.makeAckMessage(msh, 'AE', 'Test error messsage');
                hl7.parseString(msaString, function(err, parsedMsa) {
                    expect(err).to.be.null;
                    var newmsh = hl7.getSegmentOfType('MSH', parsedMsa);
                    expect(newmsh.parsed.ReceivingApplication).to.equal(msh.parsed.SendingApplication);
                    expect(newmsh.parsed.ReceivingFacility).to.equal(msh.parsed.SendingFacility);
                    expect(newmsh.parsed.SendingApplication).to.equal(msh.parsed.ReceivingApplication);
                    expect(newmsh.parsed.SendingFacility).to.equal(msh.parsed.ReceivingFacility);
                    expect(newmsh.parsed.DateTime).to.not.equal(msh.parsed.DateTime);
                    expect(newmsh.parsed.MessageControlID).to.equal(msh.parsed.MessageControlID);
                    expect(newmsh.parsed.ProcessingID).to.equal(msh.parsed.ProcessingID);

                    var msa = hl7.getSegmentOfType('MSA', parsedMsa);
                    expect(msa.parsed.ControlID).to.equal(msh.parsed.MessageControlID);
                    expect(msa.parsed.AcknowledgementCode).to.equal('AE');

                    var errSegment = hl7.getSegmentOfType('ERR', parsedMsa);
                    expect(errSegment).to.not.be.null;
                    expect(errSegment.parsed.ErrorCode).to.equal('AE');
                    expect(errSegment.parsed.UserMessage).to.equal('Test error messsage');

                    done();
                });
            });
        });
    });
});