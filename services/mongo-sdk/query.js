var mquery 	= require('mquery');
var queryMethods = {};
module.exports = queryMethods;
queryMethods.insert = function(dbInstance, queryDetails){
	//console.log("queryDetails", queryDetails);
	return dbInstance.collection(queryDetails.collection).insert(queryDetails.data);
}

queryMethods.get = function(dbInstance, queryDetails){
	return mquery(dbInstance.collection(queryDetails.collection)).find(queryDetails.data || "").exec()
}


