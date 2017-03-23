var models          = require('../models');
//console.log("models", models);
var core            = require('../core');
var middlewares        = require('../middlewares');
//console.log("middlewares", middlewares);
var payloadChecker  = middlewares.payloadChecker;
module.exports = function(app, appUnAuth){
    require("./logs")(app, appUnAuth);
	  
}
