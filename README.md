# pcc-adt [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]

> Customizable baseline [PointClickCare](https://www.pointclickcare.com/) ADT SOAP service for [node](http://nodejs.org).

## Usage

```javascript
var adt = require('pcc-adt');
var app = adt();

app.handler('A01', function(message, done) {
   console.log('Received a patient admission');
   done();
});

app.handler('A02', function(message, done) {
   console.log('Received a patient transfer');
   done();
});

// ...register more message handlers

app.listen({
   wsdl: '/path/to/adt-service.wsdl',
   path: '/desired/path/to/service',
   username: 'service-username',
   password: 'service-password'
});
```

See the [examples](https://github.com/gnickm/pcc-adt-node/tree/master/examples)
directory for a more fleshed out server example along with a client app to send
test messages.

## Installation

Install with [npm](http://github.com/isaacs/npm):

```bash
$ npm install pcc-adt
```

## API

### app.listen(options)

Starts the application listening for incoming SOAP messages. The `options`
parameter can contain the following:

- `wsdl` (required) - path to the WSDL file defining the service. See
`examples/example.wsdl` for a sample. Normally all that needs to change in the
file is the `soap:address` tag
- `path` (optional) - path on the server to listen on. **Default:** /soap/adt
- `port` (optional) - port to listen on. **Default:** 8001
- `sslkey` (optional) - path to key file used to enable SSL. Note that
PointClickCare requires SSL to be enabled for all production servers.
**Default:** undefined (no SSL)
- `sslcert` (optional) - path to cert file used to enable SSL. Note that
PointClickCare requires SSL to be enabled for all production servers.
**Default:** undefined (no SSL)
- `log` (optional) - function to use for logging. The function must implement
the signature `function(level, message)`. You can directly pass `console.log`,
but be careful with scoping issues when passing other logging objects -- for
example, passing `winston.log` will cause failures if not wrapped in an
anonymous function. **Default:** undefined (no logging)
- `username` (optional) - username for call to SOAP service. **Default:**
default-user
- `password` (optional) - password for call to SOAP service. **Default:**
default-password

---
### app.handler(eventType, handleFunc)

Registers a handler for an event type of ADT message. `eventType` needs to be
one of the PointClickCare supported event types (see section below) and
`handleFunc` is a function with the signature of `function(message, done(err))`.

The handler will be passed the [nodengine-hl7][nodengine-hl7-url] parsed ADT
message as the `message` parameter. Following the typical callback pattern, the
handler must call the `done` function, either with no parameters to indicate
success or an `Error` object to notify the SOAP client of an application error.

---
### app.close(done)

Cleanly closes the listening app. Calls `done` when close is complete.

---
### app.hl7.parseString(messageString, done(err, parsedMessage))

Calls `done` function with a [nodengine-hl7][nodengine-hl7-url] parsed message
in the `parsedMessage` parameter given a valid HL7 message in `messageString`.
If an error occurs, `done` will be called with an `Error` object. This utility
function handles the fact that [nodengine-hl7][nodengine-hl7-url] only works
with streams. To parse from a file or other stream, see the original
[nodengine-hl7][nodengine-hl7-url] project.

---
### app.hl7.hasSegment(segmentType, parsedMessage, onlyOnce=false)

Returns true if [nodengine-hl7][nodengine-hl7-url] parsed message `parsedMessage`
has a segment of `segmentType`, false if it does not. If `onlyOnce` is true, the
function will only return true if there is exactly one segment of `segmentType`.

---
### app.hl7.getSegmentOfType(segmentType, parsedMessage)

Returns the first segment of type `segmentType` found in
[nodengine-hl7][nodengine-hl7-url] parsed message `parsedMessage` or null if the
segment is not found.

---
### app.hl7.getAllSegmentsOfType(segmentType, parsedMessage)

Returns all segments of type `segmentType` found in
[nodengine-hl7][nodengine-hl7-url] parsed message `parsedMessage` as an array or
an empty array if the segment is not found.

---
### app.hl7.splitDataField(dataFieldString, componentSep = '^', repetitionSep = '~')

Splits up an HL7 data field string `dataFieldString` using component separator
`componentSep` and repetition separator `repetitionSep`. Returns an array of
fields broken up. This will be embedded in an array if there are more than one
repetition.

```javascript
// chunks is [a,b,c]
var chunks = app.hl7.splitDataField('a^b^c');

// chunks is [[a,b,c],[d,e,f]]
var chunks = app.hl7.splitDataField('a^b^c~d^e^f');
```

## HL7 & PointClickCare Considerations

### Parsing HL7

The incoming HL7 messages are parsed using the
[nodengine-hl7][nodengine-hl7-url] parser. Messages contain a property named
`segments` that contains an array of the segments in the message. To inspect
particular fields of a segment, look under the `parsed` property of the segment.
The fields provided for each segment type are defined
[here](https://github.com/evanlucas/nodengine-hl7/tree/master/lib/segments).

```javascript
// Find the Resident's name, assuming message is nodengine-hl7 parsed

// Loop over all segments in message
for(var i = 0; i < message.segments.length; i++) {

   // Find the PID segment
   if(message.segments[i].parsed.SegmentType == 'PID') {

      // Return the name
      return parsedMessage.segments[i].parsed.ResidentName;
   }
}
```

### HL7 Utilities

The pcc-adt app object contains a set of utility functions under the `hl7`
property. These functions are helpful for processing the messages parsed by the
[nodengine-hl7][nodengine-hl7-url] parser. See the `app.hl7` functions in the
API docs above for more details.

### Required Segments in All PointClickCare ADT Messages

The following segments are required in all PointClickCare ADT messages:

- **MSH** - Message Header
- **EVN** - Event Type
- **PID** - Patient Identification
- **PV1** - Patient Visit
- **ZEV** - Custom Event Type

pcc-adt will throw errors back to the calling SOAP client if any of these
segments are missing. It is safe to assume that all of these segments are
present in the message when it reaches your handler.

### Supported PointClickCare Event Types

PointClickCare lays out the supported event types in their integration
documentation. The event type is defined in `EVN.2`, or the second field in the
`EVN` segment. For example, the HL7 message below is a `A02` (transfer) event:

```
MSH|^~\&|PCCApp|NODE_ADT|ExampleApp|NODE_ADT|20160218103929.576||ADT^A02|269586|T|2.5
EVN|A02|201601071100|||test-user|201601071100
PID|1||398^^^^FI~000288^^^^HC~000288^^^^PN||Morgan^Debra||19650925|F||||||||||000288
PV1|1|I|WEST^215^1^^^N^5^1|||^^^^^N||||||||||||1||||||||||||||||||||||||||201601021400|
ZEV|2003|201601071100|test-user
```

PointClickCare and pcc-adt support the following event types:

- **A01** - Admit Resident Notification
- **A02** - Transfer a Resident
- **A03** - Discharge/End Visit
- **A06** - Change an Outpatient to an Inpatient
- **A07** - Change an Inpatient to an Outpatient
- **A08** - Update Resident Information
- **A11** - Cancel Admit Notification
- **A12** - Cancel Transfer
- **A13** - Cancel Discharge
- **A21** - Resident Leave of Absence
- **A22** - Resident Return from Leave of Absence
- **A52** - Cancel Resident Leave of Absence
- **A53** - Cancel Resident Return from Leave of Absence
- **P08** - Update Resident Account

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

  [MIT](LICENSE)

[travis-url]: https://travis-ci.org/gnickm/pcc-adt-node
[travis-image]: http://img.shields.io/travis/gnickm/pcc-adt-node.svg

[coveralls-url]: https://coveralls.io/r/gnickm/pcc-adt-node
[coveralls-image]: http://img.shields.io/coveralls/gnickm/pcc-adt-node/master.svg

[nodengine-hl7-url]: https://github.com/evanlucas/nodengine-hl7/