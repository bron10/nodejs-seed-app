module.exports = function(app, models) {

    var appEmitter = appUtils.appEmitter();
    models.global.ping()
    .then(function(){
      return appServices.adaptors.mongoConnection.ping()
    })
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
