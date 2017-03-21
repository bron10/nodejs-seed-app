var indicative 	= require('indicative');
var Adapter = require('../services').adaptors;
var connect = Adapter.mongoConnection;
//console.log("cool", connect);

module.exports.transactions = {
	collection : 'logs_transactions',
	insert 	: function(logData){
		var self = this;
		//console.log("logData", logData);
			var validatedPromise = Promise.resolve();
			if(!_.isArray(logData)){
				validatedPromise = indicative.validate(logData, {
					//user_id 		: 'required',
					//ft_order_id 	: 'required',
					//interface_id 	: 'required',
					process_type 	: 'required', //<tableName_action>
					process_inputs 	: 'required',
					process_output 	: 'required',
					datetime 		: 'required'
				});
			}
		
		//console.log("validatedPromise", validatedPromise);
		return validatedPromise.then(function(validatedLogData){
			//console.log("step1", logData);
			
			return connect.queryMaker({
				method 		: 'insert',
				data 		: logData,
				collection 	: self.collection
			});
		})
		.catch(function(e){
			console.log("error", e);
		})
	},
	get 	: function(data){
		return connect.queryMaker({
				method 		: 'get',
				data 		: data,
				collection 	: this.collection
			});
	}  
}