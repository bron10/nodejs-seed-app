var responses = require('../responses')
var cookieSig = require('cookie-signature');

function ResponseHandler() {
	this.handle = function (req, res, next) {
		var bindObj = {res: res};
		res.okSend = responses.ok.bind(bindObj);
		res.setError = responses.setError.bind(bindObj);
		//console.log("df0");
		next(); //call next middleware
   	}
}


module.exports = new ResponseHandler();
