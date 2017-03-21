var messages = require('./messages');

function ResponseCreater() {
    var self = this;
    self.ok = function(data, path){
        //console.log("data 1", data);
        var type = 'ok';
        var status = messages[type].status_code;
        //console.log("response Data", messages[type], path);
        var responseData = _.get(messages[type], path, {});
        //console.log("response Data", responseData, path);
        try{
            data = JSON.parse(data);
            responseData =_.assign(responseData, data, {});
        }catch(e){
            responseData.data = data;		
        }

        //console.log("data 2", responseData)
       if(!responseData.status_code){
           responseData['status_code'] = status;
       } 
       //console.log("in response ok--->", self);
       return this.res.status(status).send(responseData);    
    },
    
    self.setError = function(errDetails, path){
       // console.log("Error details path", errDetails, path);
       var errDetails = errDetails || {}
        /**
         * Type can be 
         *  ok                  
            forbidden           
            notFound            
            serverError         
            unprocessableEntity 
            preconditionFailed  
            largeEntity         
         */
        var type            = errDetails.type || 'serverError';
        var errorCode       = messages[type].status_code;
        var responseData    = _.get(messages[type], path, {});
        //console.log("Error details responseData", responseData, messages[type]);
        try{
            errDetails = JSON.parse(errDetails);
            responseData =_.assign(responseData, errDetails, {});
        }catch(e){
            responseData.error = errDetails;		
        }
        if(!responseData.status_code){
           responseData['status_code'] = errorCode;
        } 
        //console.log("in response error--->");
        return this.res.status(errorCode).send(responseData);
    },

    /**
     * @param type type of messages
     * @param path path of messages
    */
    self.getMessages = function(path, type){
        type = type || 'ok';
        return _.get(messages[type], path, {});
    }

};


module.exports                   = new ResponseCreater();
// module.exports.unprocessableEntity  = new ResponseCreater('unprocessableEntity').create;
// module.exports.serverError          = new ResponseCreater('serverError').create;
// module.exports.notFound             = new ResponseCreater('notFound').create;
// module.exports.forbidden            = new ResponseCreater('forbidden').create;
//module.exports.setError             = responseInstance.setError;