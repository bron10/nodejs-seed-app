var MongoClient   	= require('mongodb').MongoClient;
var querystring 	= require('querystring');
//var EventEmitter  = require('events').EventEmitter;	
// var util          = require('util');
// var Q             = require('q'); 
module.exports    = connection;
//util.inherits(connection, EventEmitter);

function connection(){
	//var self 				= this;
	this.status 			= false;
	//this.createConnection(arguments[0]);	
}

connection.prototype.createConnection = function(){
	var self 				= this;
	var connectionParams 	= arguments[0];
	
	//console.log("self.conInstance", self.conInstance);
	if(self.conInstance){
		if(_.isEmpty(connectionParams)){
			return self.conInstance;
		}else{
			self.disconnect();
		}
	}

	var promisifiedConnect = Promise.promisify(MongoClient.connect);
	return promisifiedConnect(prepareUri(connectionParams))
	.then(function(conInstance){
		self.conInstance = conInstance;
		self.status = true;
		return conInstance;	
	})
}
/**
 * @desc Prepare Uri for mongo instance
 * @param {Object} 	[hosts, options, credentials]
 * @return {String} 
*/
function prepareUri(data){
	var hosts 		= _.join(data.hosts, ',');
	var options 	= querystring.stringify(data.options);
	var credentials = '';
	if(data.credentials && ~data.credentials.indexOf(':')){
		credentials = data.credentials+'@';
	}
	//console.log("options-->", options);
	var str = 'mongodb://'+credentials+hosts+'/'+data.db;
	
	if(options){
		str+='?'+options;
	}
	//console.log("str")
	return str;
}

connection.prototype.getCurrentStatus = function(){
	return this.status;
}

connection.prototype.disconnect = function(callback){
	this.status = false;
	//console.log("wtf, :,", this);
	this.conInstance.close(callback);
	return this.status;
}