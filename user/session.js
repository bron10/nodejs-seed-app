var indicative      = require('indicative');
var validator       = require('validator');
//var models          = require('../../models');
var appUtils        = require('../services').utils;
//var commonMethods   = require('../../core')


module.exports = function(models, commonMethods){
    var sessionModels   = models.session;
    var usersModels     = models.users;
    var cartModel       = models.cart;
    return {
        GET: function(req, res, next) {
            return commonMethods.user.getUserSession(req, res, next)
            .then(function(userData) {
                //console.log("sdsadas", userData)
                if (_.isEmpty(userData)) {
                    return res.setError({
                        key: 'authFailure'
                    }, 'access_denied');
                }   
                /**
                 * Set session data in session_api table
                */
                return sessionModels
                .set(_.cloneDeep(_.extend(req.session, userData)))
                    .then(function(){
                        return res.okSend(userData, 'auth.session.get');
                    })
            })
            .catch(function(err){
                console.log("err", err);
                return res.setError(err.details, err.path);
            })
        },

        create: function(req, res, next) {
            // console.log("login call 4", JSON.stringify(appUtils.getSessionData(req)))
            // dummy.data;
            return commonMethods.user.validation(req, res, next)
                .then(function(selectedUserData) {
                    //console.log("check selectedUserData", selectedUserData);
                    if (selectedUserData.type && selectedUserData.type == 'exist') {
                        return res.okSend(selectedUserData.details, 'auth.session.exist')
                    }
                    /**
                     * Check if user is tech/support user
                     * This also includes developers, testers
                     */
                    return usersModels.getTechSupportUsers.QUERY(selectedUserData)
                        .then(function(selectedTechSupportUser) {
                            /**
                             * If user is not tech/support user
                             * set venues in user session data
                             */
                            if (_.isEmpty(selectedTechSupportUser)) {
                                //console.log("555--->3", req.session.rowData);
                                return commonMethods.user.authentication(req, selectedUserData)
                                    .then(function(selectedUserData) {
                                        console.log("selectedUserData->", selectedUserData);
                                        /**
                                         * Set session data in session_api table
                                        */
                                        return sessionModels
                                        .set(_.cloneDeep(req.session))
                                            .then(function(){
                                                return res.okSend(selectedUserData, 'auth.session.login');
                                            })
                                    })
                                    .catch(function(e){
                                        console.log("errro in user", e.stack);
                                    })
                            }
                            return res.okSend({
                                login : "Login for techsupport users is not implemented"
                            })
                        })
                })
                .catch(function(err) {
                    //console.log("In catch--->", err.stack)
                    if(err.details)
                        return res.setError(err.details, err.path);

                    return res.send(err);
                })
        },

        destroy: function(req, res, next) {
            var interfaceId = appUtils.getInterfaceId(req);

            var userData            = appUtils.getSessionUserData(req);
            //console.log("appUtils.getVenueData(req)", req.localData);
            var promiseArray        = Promise.resolve();

            var venueData  = appUtils.getVenueData(req);

            if(_.isEmpty(userData)){
                return res.setError({
                    type : 'authFailure'
                }, "access_denied")
            }
            
            if(_.isEmpty(venueData)){
                return res.setError({
                    type : 'authFailure'
                }, "session.venue")
            }
            
            var selectedVenueData   = venueData.selectedVenue;
            if(selectedVenueData && !_.isEmpty(userData) && userData.cart_data && !_.isEmpty(userData.cart_data[selectedVenueData.venue_code]) && !_.isEmpty(userData.cart_data[selectedVenueData.venue_code][interfaceId])){
                //console.log("selectedVenueData-->", selectedVenueData);
                var venueCartData       = userData.cart_data[selectedVenueData.venue_code][interfaceId];
                promiseArray            = Promise.map(venueCartData.order_details, function(val, key){
                    //console.log("going on", key);
                    return commonMethods.cart.removeCartTransaction(val,key,venueCartData);
                });
            }

            return promiseArray
            .then(function(){
                return sessionModels.destroy(req.session.id)
                .then(function(data){
                    delete req.session.rowData.user_data;
                    //console.log("req clearing");
                    res.clearCookie(req.headers.host+appUtils.getNodeEnv(), {});
                    return res.okSend({}, "auth.session.logout");
                })
                .catch(function(err){
                    console.log("err", err);
                    return res.setError(err.details, err.path)
                })
            })
        },

        destroyAll: function(req, res, next) {
            var self = this;
            var userId = req.session.rowData.user_data.id;

            //Destroy all
            sessionModels.destroyAll(userId)
                .then(function(deletedResponse) {
                    //Destroy self
                    // self.DELETE(req, res, next)
                    //req.session.destroy(function(err) {
                        //console.log("err", err);
                        
                        return res.okSend({
                            logout_user: userId,
                            data : deletedResponse
                        }, "auth.session.logoutUserSessions");
                   // })

                })
                .catch(function(failedResponse) {
                    res.send(failedResponse);
                })
        },
        
        getAuthtoken : function(req, res, next){
            return res.okSend({
                authtoken : req.session.id
            });
        }
    }
}
    
    

