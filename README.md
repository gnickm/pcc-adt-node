# pcc-adt [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]

> Customizable baseline [PointClickCare](https://www.pointclickcare.com/) ADT SOAP service for [node](http://nodejs.org).

```js
var adt = require('pcc-adt')

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
