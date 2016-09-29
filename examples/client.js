'use strict';

var soap   = require('soap');
var base64 = require('../lib/base64');
var fs     = require('fs');

if(process.argv.length < 3) {
    throw new Error('Requires message path to run client');
}

var hl7String = fs.readFileSync(process.argv[2], "utf8");

var soapArgs = {
    username: 'default-user',
    password: 'default-password',
    data: base64.encode(hl7String.replace(/\n/g, '\r'))
};

soap.createClient('http://127.0.0.1:8001/soap/adt?wsdl', function(err, client) {
    if(err) throw err;
    client.SubmitMessage(soapArgs, function(err, result) {
        if(err) throw err;
        console.log(base64.decode(result.data).replace(/\r/g, '\n'));
    });
});
