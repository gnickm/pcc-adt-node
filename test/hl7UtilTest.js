// --------------------------------------------------------------------------
// test/hl7UtilTest.js
// --------------------------------------------------------------------------

var expect  = require('chai').expect;
var hl7Util = require('../lib/hl7Util');

//--------------------------------------------------------------------------

describe('HL7 Util Functions', function() {
    describe('parseString()', function() {
        it('should parse a legit message string', function(done) {
            var hl7 =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7Util.parseString(hl7, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                done();
            });
        });
    });
});