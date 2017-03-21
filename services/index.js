//console.log("require('./db-connector')", require('./db-connector'));
//console.log("services in file   ");
GLOBAL.appServices = {}

module.exports = appServices;

// appServices.middlewares= {
//         //routeValidator  : require('./route-validator'),
//         responseHandler     : require('./response-handler'),
//         authenticator       : require('./authenticator'),
//         errorHandler        : require('./error-handler'),
//         payloadChecker      : require('./payload-checker'),
//         session             : require('./session'),
//         dbConfigSetter      : require('./db-config-setter')
//     };
    appServices.adaptors= {
        connection: require('./db-connector'),
        mongoConnection : require('./mongo-sdk')
    };
    appServices.utils = require('./utils');
    appServices.logger = require('./logger');
    //email: require("./email"),
    appServices.indicative = require("./validator");
    appServices.handlebars=  require("./handlebars");
