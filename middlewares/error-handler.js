module.exports = function () {
	return function (err, req, res, next) {
		if(err){
			try{
				var checkValidJSON = JSON.parse(err.body);
				console.log("req", checkValidJSON);
			}catch(e){
				console.log("Parse error handled in middleware", err);
			}
		}
		next();
   }
}
