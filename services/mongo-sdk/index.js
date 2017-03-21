var connection 		= require('./connection');
var query 			= require('./query');
var config 			= require("../../config");


//var c = ;
//console.log("connection", query['insert']);
function appMongo(){
	this.queryMaker = function(queryDetails){
        var self = this;
        //var queries  = new ();
        //var mongoDBInstance = self.mongoDBInstance;
        if(self.mongoDBInstance){
        	return query[queryDetails.method](self.mongoDBInstance, queryDetails);
        }else{
        	//try{
        		//console.log("11")
                
                    return fetchDbConnection()
                    .then(function(dbInstance){
                        //console.log("12")
                        self.mongoDBInstance = dbInstance;
                        return query[queryDetails.method](self.mongoDBInstance, queryDetails);
                    })
                    
                
        		
        	//}catch(e){console.log("Mongodb connection error", e);}
                
        }

    }

    this.ping = function(){
        return fetchDbConnection()
        .then(function(conn){
            //console.log("conn", conn);
            return true;        
        })
    }  	
}

function fetchDbConnection(){
    var mongoConfig = config.connections.mongo[appUtils.getNodeEnv()];
    if(mongoConfig){
        return new connection().createConnection(mongoConfig)
        .catch(function(e){
            console.log("nosql connection error", e);
            return Promise.reject();
        })
    }else{
        console.log("nosql config error");
        return Promise.reject();
    }
}
//appMongo.prototype.connect 		= new connection;
//appMongo.prototype.query 		= new queries;

module.exports = new appMongo;