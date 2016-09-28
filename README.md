# pcc-adt [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]

> Customizable baseline [PointClickCare](https://www.pointclickcare.com/) ADT SOAP service for [node](http://nodejs.org).

```js
var adt = require('pcc-adt');

adt.handler('A01', function(message, done) {
   console.log('Received a patient admission');
});
adt.handler('A02', function(message, done) {
   console.log('Received a patient transfer');
});
adt.handler('A03', function(message, done) {
   console.log('Received a patient discharge');
});

adt.listen({
   wsdl: '/path/to/adt-service.wsdl'
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
## License

  [MIT](LICENSE)

[travis-url]: https://travis-ci.org/gnickm/pcc-adt-node
[travis-image]: http://img.shields.io/travis/gnickm/pcc-adt-node.svg

[coveralls-url]: https://coveralls.io/r/gnickm/pcc-adt-node
[coveralls-image]: http://img.shields.io/coveralls/gnickm/pcc-adt-node/master.svg