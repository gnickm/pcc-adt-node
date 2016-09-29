'use strict';

var ADTSoapServer = require('../');
var util = require('util');

var adt = new ADTSoapServer();

function getRoomNumber(message) {
    var pv1 = adt.hl7.getSegmentOfType('PV1', message);
    var roomChunks = adt.hl7.splitDataField(pv1.parsed.AssignedPatientLocation);
    return roomChunks[1] + '-' + roomChunks[2] + ', ' + roomChunks[0] + ' ' + roomChunks[7];
}

function getPatientName(message) {
    var pid = adt.hl7.getSegmentOfType('PID', message);
    var nameChunks = adt.hl7.splitDataField(pid.parsed.PatientName);
    return nameChunks[1] + ' ' + nameChunks[0];
}

function getPatientPCCID(message) {
    var pid = adt.hl7.getSegmentOfType('PID', message);
    var idChunks = adt.hl7.splitDataField(pid.parsed.PatientIdentifierList);

    if(idChunks.length == 5) {
        // This might be a single ID, or it may be 4 IDs. Check for FI
        if(idChunks[4] == 'FI') {
            return idChunks[0];
        }
    }

    // We have several IDs, look for the FI one
    for(var i = 0; i < idChunks.length; i++) {
        if(idChunks[i][4] == 'FI') {
            return idChunks[i][0];
        }
    }

    return 'Unknown ID';
}

adt.handler('A01', function(message, done) {
    console.log('info', util.format(
        '*** Admitted patient %s (%s) into room %s',
        getPatientPCCID(message),
        getPatientName(message),
        getRoomNumber(message)
    ));
    done();
});

adt.handler('A02', function(message, done) {
    console.log('info', util.format(
        '*** Transferred patient %s (%s) to room %s',
        getPatientPCCID(message),
        getPatientName(message),
        getRoomNumber(message)
    ));
   done();
});

adt.handler('A03', function(message, done) {
    console.log('info', util.format(
        '*** Discharged patient %s (%s) from room %s',
        getPatientPCCID(message),
        getPatientName(message),
        getRoomNumber(message)
    ));
   done();
});

adt.listen({
   wsdl: './example.wsdl',
   log:  console.log
});
