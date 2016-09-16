// --------------------------------------------------------------------------
// lib/logger.js
// --------------------------------------------------------------------------

var winston = require('winston');
var config  = require('./config.js');

//--------------------------------------------------------------------------

var myTransports = [
	new winston.transports.Console({
		level: config.get('logger:level'),
        timestamp: true,
        colorize: true
    })
];

if(config.get('logger:file') != 'none') {
	myTransports.push(new winston.transports.File({
		filename: config.get('logger:file'),
		level: config.get('logger:level'),
        timestamp: true,
	}));
};

var logger = new winston.Logger({
    transports: myTransports
});

// This is used to hook into morgan
logger.stream = {
    write: function(message, encoding) {
        logger.debug(message);
    }
};

logger.debug('Logging initialized:', config.get('logger'));

module.exports = logger;
