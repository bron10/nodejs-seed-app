module.exports = function(app, models) {

    var appEmitter = appUtils.appEmitter();
    /**
     * @description global.ping is method with dependency of sql.
     * we can enable this by setting up mysql connections.
     */
    // models.global.ping()
    // .then(function(){
    appServices.adaptors.mongoConnection.ping()
    //})
    .catch(function(e){
        console.log("data source is not available yet, trying reconnecting..", e);
        appEmitter.emit('reconnect-db');
    })


    return function(req, res, next) {
        /**
         * @description The middleware provides ability to set
         * db configs
         */

        next();
    }
}
