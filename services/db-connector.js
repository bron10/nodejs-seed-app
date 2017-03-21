var mysql = require('mysql'),

Utils = require("../services/utils"),
logger = require("../services/logger"),
//mongoSdk = require('./mongo-sdk'),
Promise = require('bluebird'),
Config = Utils.getConfig();
//var microtime = require('microtime');

//Uncomment if mysql has not been properly promisified yet
Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

//var pool = mysql.createPool(Config.connections[Utils.getNodeEnv()].main);
var msqlConfigData = Config.connections[Utils.getNodeEnv()];

//console.log("msqlConfigData", msqlConfigData);
var pool = Promise.promisifyAll(mysql.createPoolCluster());
pool.add('MASTER', msqlConfigData.main);

/**
 * Create Slaves (Read-replicas)
*/
_.forEach(msqlConfigData.read, function(config, ind){
    config.defaultSelector =  'ORDER';
    config.canRetry        = false;
    //console.log("config", config);
    pool.add('read_rep'+ind, config);
})

function getAsyncSqlConnection(callback) {
    //console.log("in getAsyncSqlConnection function")
    return pool.getConnectionAsync().disposer(function(connection) {
        //console.log("in connection release")
        connection.release();
        // if(callback)
        //     callback(connection);
    });
}

function getMasterConnection(callback) {
    return pool.getConnection('MASTER', callback)
}

function getReplicaConnection(queryOptions) {
    //console.log("Here i am 1");
    return pool.getConnectionAsync('read_rep*')
    .then(function(conn){
        //console.log("1")
        replicaConnectionStatus = 'progress';
        return conn.queryAsync(queryOptions)
        .then(function(results){
            conn.release();
            //conn.release()
            //console.log("results" ,results);
            lastQueryTime = Date.now();
            replicaConnectionStatus = 'nc';
            logger.log("info", "Query sent", {
                query: "____<readS>_____"+getParsedQuery(queryOptions)+"_____<readE>____"
            });
            return Promise.resolve(results)
        })
        .catch(function(error){
            conn.release();
            console.log("Connection error with read replica, retrying with master connection");
            logger.log("error", "Connection error with read replica, retrying with master connection", error);
            replicaConnectionStatus = 'failed';
            return Promise.reject(error);
        })
    })
    // .disposer(function(connection) {
    //     console.log("in connection release")
    //     connection.release();
    // });
    //return new Promise(function(resolve, reject){
        //replicaConnectionStatus = 'progress';
        //return pool.getConnection('read_rep*', function(error, conn) {
            // if(error){
            //     console.log("Connection error with read replica, retrying with master connection");
            //     logger.log("error", "Connection error with read replica, retrying with master connection", error);
            //     replicaConnectionStatus = 'failed';
            //     return reject(error);
            // }
            //console.log("got in read replica");
            // return conn.query(queryOptions, function(error, results, fields) {
            //     conn.release();
            //     lastQueryTime = Date.now();
            //     //console.log("stee 5", error, results)
            //     replicaConnectionStatus = 'nc';
            //     if (error){
            //         logger.log("error", "Query error", error)
            //         return reject(error);
            //     }
            //     else{
            //         logger.log("info", "Query sent", {
            //             query: "____<readS>_____"+getParsedQuery(queryOptions)+"_____<readE>____"
            //         });
            //         return resolve(results)
            //     }
            // })
       // });
  //  })
}

function getParsedQuery(options) {
    var query = options.sql || ""
    var data = options.values || []
    return mysql.format(query, data)
}

// Closes all the connection in the pool when the app terminates
process.on("exit", function() {
    pool.end(function(err) {
        if (err) console.error("Pooled connection termination error: ", err)
        else console.log("Terminated the pooled Db connections");
    });
});

pool.on('connection', function(connection) {

    console.log('on connection event callback');
});

// pool.on('enqueue', function() {
//     console.log('on enqueue event callback');
// });

pool.on("end", function(err) {
    console.log("pool connection ended")
        // all connections in the pool have ended
});

// // Catches errors in the pool on connection
pool.on('error', function(connection) {
    console.log('Db pool connection error', connection)
});

function checkIntervalTime(lastQueryTime, currentTime){
    if(!lastQueryTime){
        return false;
    }

    return (currentTime - lastQueryTime) < 360000;

}

var replicaConnectionStatus     = 'nc';
var connectionQueue             = [];
var lastQueryTime               = null;
module.exports = {
    async: getAsyncSqlConnection,
    sync: getMasterConnection,
    ping : function(){
      console.log("-->", pool);
      pool.getConnectionAsync('read_rep*')
      .then(function(conn){
        return conn.queryAsync('SELECT 1')
      });
    },
    escape: mysql.escape,
    queryContraintMaker : function(selectors){
        var aa = "";
        _.each(selectors, function(data, key){
            var val = mysql.escape(data);
            aa+=(!aa ? key+"="+val  : " AND "+key+"="+val);
        });
        return aa;
    },
    readReplicaQuery : function(queryOptions) {
        var self = this;
        if(queryOptions){
            queryOptions.typeCast = function(field, next) {
                if (field.type === 'BLOB') {
                    return field.string();
                }
                return next();
            };

            //connectionQueue.push(options);
        }
        if(replicaConnectionStatus == 'failed' && checkIntervalTime(lastQueryTime, Date.now())){
            ///console.log("connection 3")
            return self.query(queryOptions);
        }
        //console.log("3")
        return getReplicaConnection(queryOptions)
            .catch(function(error){
                /**
                 * @Note: Check if failed query is read query return error reject.
                 * This is required because the masterQuery method is using replicaMethod if
                 * its a read query. The below check avoids the recursion in case of error
                */
                if(checkIfReadQuery(queryOptions.sql)){
                    // appUtils.appEmitter().emit('reconnect-db', error);
                    return Promise.reject(error)
                }
                //console.log("2.failed and came here");
               return self.query(queryOptions)
           })





    },
    query: function(options) {
        //console.log("parsed query :-> ", getParsedQuery(options));
        var self = this;
        options.typeCast = function(field, next) {
            if (field.type === 'BLOB') {
                return field.string();
            }
            return next();
        };

        //console.log("checkIfReadQuery(options.sql)", checkIfReadQuery(options.sql));
        if(replicaConnectionStatus == 'nc' && checkIfReadQuery(options.sql)){
            return self.readReplicaQuery(options);

        }

        //console.log("here i am");
        //if(options)
        return new Promise(function(resolve, reject) {
            //console.log("new promise callback")
            return getMasterConnection(function(err, conn) {
                //console.log("get sync sql connection callback", err);
                if (err){
                    //console.log("Error while connecting master", err);
                    logger.log("error", "Connection error", err)
                    return reject(err)
                }

                //console.log("got in master query connection")
                return conn.query(options, function(error, results, fields) {
                    conn.release();
                    if (error){
                        logger.log("error", "Query error", error)
                        return reject(error);
                    }else{
                        logger.log("info", "Query sent", {
                            query: "____<S>_____"+getParsedQuery(options)+"_____<E>____"
                        })
                        return resolve(results)
                    }
                })
            })
        })
        // .catch(function(data){
        //     console.log("data", data);
        // })
    },
    getParsedQuery: getParsedQuery,
    singleInsert : function(requestData, tableName){
        if (Utils.isStringEmpty(tableName)) return Promise.reject({
            error: "Table name is missing"
        })

        //console.log("-----------------------------------", tableName)
        return this.query({
            sql : `insert into ?? set ?`,
            values : [tableName, requestData]
        })
    },
    singleUpdate : function(tablename, updateData, selectData){
        //console.log("singleUpdate");
        var dbQuery = {
            sql : `UPDATE ?? set ? where `,
            values : [tablename, updateData]
        };

        if(!_.isEmpty(selectData)){
            dbQuery.sql+=this.queryContraintMaker(selectData)
        }

        //console.log("dbQuery-->", dbQuery);
        return this.query(dbQuery)
    },
    bulkInsert : function(requestData, tableName, tableColumns){
        if (Utils.isStringEmpty(tableName) || _.isEmpty(tableColumns)) return Promise.reject({
            error: "Table name is missing"
        })

            console.log("-->", {
            sql : `insert into `+tableName+` (` + tableColumns.toString() + `) values ?`,
            values : [requestData]
        });
        return this.query({
            sql : `insert into `+tableName+` (` + tableColumns.toString() + `) values ?`,
            values : [requestData]
        })
    }

};

function checkIfReadQuery(sqlStr){
    if(_.isString(sqlStr)){
        return _.lowerCase(sqlStr).indexOf('select ') === 0;
    }
    return false;
}
