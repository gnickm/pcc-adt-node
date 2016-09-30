/*!
 * Copyright (C) 2016 Nick Mitchell
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var ADTSoapServer = require('../');
var util = require('util');

/**
 * Create an instance of the server
 */
var adt = new ADTSoapServer();

/**
 * Register handlers for A01, A02, and A03. They will print some information
 * about the patient. See functions below for more information on the parsing
 * of messages for this info.
 */
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

/**
 * Create an instance of the server
 */
adt.listen({
   wsdl: './example.wsdl',
   log:  console.log
});

/**
 * Helper functions for extracting data out of messages
 */
function getRoomNumber(message) {
    // Find the PV1 (Patient Visit) segment in the message
    var pv1 = adt.hl7.getSegmentOfType('PV1', message);

    // Use the HL7 util to split up the AssignedPatientLocation field
    var roomChunks = adt.hl7.splitDataField(pv1.parsed.AssignedPatientLocation);

    /**
     * Room subfields:
     * 0 - Unit
     * 1 - Room
     * 2 - Bed
     * 7 - Floor
     */
    return roomChunks[1] + '-' + roomChunks[2] + ', ' + roomChunks[0] + ' ' + roomChunks[7];
}

function getPatientName(message) {
    // Find the PID (Patient Identification) segment in the message
    var pid = adt.hl7.getSegmentOfType('PID', message);

    // Use the HL7 util to split up the PatientName field
    var nameChunks = adt.hl7.splitDataField(pid.parsed.PatientName);

    // Subfield 0 is last name, subfield 1 is first name
    return nameChunks[1] + ' ' + nameChunks[0];
}

function getPatientPCCID(message) {
    // Find the PID (Patient Identification) segment in the message
    var pid = adt.hl7.getSegmentOfType('PID', message);

    // Use the HL7 util to split up the PatientIdentifierList field
    var idChunks = adt.hl7.splitDataField(pid.parsed.PatientIdentifierList);

    /**
     * PatientIdentifierList may have many repetitions of the same field
     * in it, each identified with the ~ delimiter. We're trying to find the
     * PCC ID (FI), so we iterate over the list. There is a case where there
     * is only one ID, so we check for that specifically.
     */

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

