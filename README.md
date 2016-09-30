# pcc-adt [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]

> Customizable baseline [PointClickCare](https://www.pointclickcare.com/) ADT SOAP service for [node](http://nodejs.org).

```js
var adt = require('pcc-adt');

adt.handler('A01', function(message, done) {
   console.log('Received a patient admission');
   done();
});

adt.handler('A02', function(message, done) {
   console.log('Received a patient transfer');
   done();
});

adt.handler('A03', function(message, done) {
   console.log('Received a patient discharge');
   done();
});

adt.listen({
   wsdl: '/path/to/adt-service.wsdl',
   path: '/desired/path/to/service'
});
```

## Installation

Install with [npm](http://github.com/isaacs/npm):

```bash
$ npm install pcc-adt
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## HL7

### Parsing

The incoming HL7 messages are parsed using the
[nodengine-hl7](https://github.com/evanlucas/nodengine-hl7/) parser. Messages
contain a property named `segments` that contains an array of the segments
in the message. To inspect particular fields of a segment, look under the
`parsed` property of the segment. he fields provided for each segment are defined
[here](https://github.com/evanlucas/nodengine-hl7/tree/master/lib/segments).

### Utilities

The pcc-adt app object contains a set of utility functions under the `hl7`
property. These functions are helpful for processing the messages parsed by the
[nodengine-hl7](https://github.com/evanlucas/nodengine-hl7/) parser. The
provided utilities are as follows:

#### hasSegment(segmentType, parsedMessage, onlyOnce)

Returns `true` if `parsedMessage` has a segment of `segmentType`, `false` if it
does not. If `onlyOnce` is `true`, the function will only return `true` if there
is exactly one segment of `segmentType`.

## License

  [MIT](LICENSE)

[travis-url]: https://travis-ci.org/gnickm/pcc-adt-node
[travis-image]: http://img.shields.io/travis/gnickm/pcc-adt-node.svg

[coveralls-url]: https://coveralls.io/r/gnickm/pcc-adt-node
[coveralls-image]: http://img.shields.io/coveralls/gnickm/pcc-adt-node/master.svg