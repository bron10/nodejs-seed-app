var winston = require("winston");
var utils = require("../services/utils");
var Promise = require('bluebird');
var logger = null;

module.exports = {
    initLogger: initLogger,
    log: log,
    query: query
}

function initLogger(env) {
    var env = env || utils.getNodeEnv();

    if (!_.isEmpty(logger)) return logger;

    logger = new(winston.Logger)({
        transports: [
            new(winston.transports.File)({
                filename: 'log/' + env + '.log',
                handleExceptions: true,
                humanReadableUnhandledException: true
            })
        ]
    });
    // if (env === "development")
    //     logger.add(winston.transports.Console);
    
    return logger;
}

function log() {
    // query()
    return initLogger().log.apply(logger, arguments);
}

function query(options) {
    var options = options || {
        from: new Date - 24 * 60 * 60 * 1000,
        until: new Date,
        limit: 10,
        start: 0,
        order: 'desc',
        // fields: ['sql']
    };
    return new Promise(function(resolve, reject) {
        initLogger().query(options, function(error, results) {
            if (error)
                return reject(error);
            else
                return resolve(results)
        })
    })
}
