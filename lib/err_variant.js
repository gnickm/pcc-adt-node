// --------------------------------------------------------------------------
// lib/err_variant.js
// --------------------------------------------------------------------------
'use strict';

// Defines PCC variant of the ERR segment, namely the UserMessage field

exports.name = 'ERR';

exports.fields = [
    'SegmentType',
    'ErrorCode',
    'ErrorLocation',
    'HL7ErrorCode',
    'Severity',
    'ApplicationErrorCode',
    'ApplicationErrorParameter',
    'DiagnosticInformation',
    'UserMessage'
];

