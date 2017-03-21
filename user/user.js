var indicative      = require('indicative');
var validator       = require('validator');
var services    = require('../services');
var appUtils    = require('../services').utils;
// var models          = require('../../models');
// var commonMethods   = require('../../core')




module.exports = function(models, commonMethods){
    var usersModels     = models.users;
    var sessionModels   = models.session;
    return {
        checkUserExistCTRL : function(req, res, next){
            var requestedData  = {
                email_id    : req.body.email_id,
                company_id  : req.localData.companyInfo.id
            };
            
            return indicative.validate(requestedData, {
                email_id : 'required|email'
            })
            .then(function(validatedUserData){
                req['app_params'] = {};
                return usersModels.validateUser.QUERY(validatedUserData)
                .then(function(userData){
                    req.app_params.userData  = userData;
                    next();
                    
                })  
            })
            .catch(function(err){
                return res.setError({
                        type : 'notFound',
                        details : err
                    },
                    'user.register'
                );   
            })
            
        },
        updateUser: function(req, res, next) {
            var data = req.body
            var requestedData = {
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone,
                gender: data.gender,
                alternate_email_id: data.alternate_email_id,
                receive_ft_promotion: data.receive_ft_promotion,
                receive_presenter_promotion: data.receive_presenter_promotion
            };

            indicative.validate(requestedData, usersModels.userDetails.RULES)
                .then(function(validatedUserData) {
                    var userData = appUtils.getSessionUserData(req)

                    return usersModels.userDetails.UPDATE(userData.id, validatedUserData)
                        .then(function(data) {
                            _.extend(req.session, validatedUserData)
                            return sessionModels
                                .set(req.session)
                                .then(function() {
                                    res.okSend({}, "auth.userData.update")
                                })
                        })
                })
                .catch(function(err) {
                    res.setError(err)
                })
        },

        changePassword: function(req, res, next) {
            var data = req.body
            var requestedData = {
                password: data.password,
                new_password: data.new_password,
                confirm_password: data.confirm_password
            };

            indicative.validate(requestedData, {
                    password: "required",
                    new_password: "required|min:6",
                    confirm_password: "same:new_password"
                })
                .then(function(validatedUserData) {
                    var userData = appUtils.getSessionUserData(req)
                    var password = appUtils.genEncryptedPass(validatedUserData.password)
                    var companyId = appUtils.getCompanyId(req)

                    return usersModels.validateUser.QUERY({
                            email_id: userData.email_id,
                            password: password,
                            company_id: companyId
                        })
                        .then(function(data) {
                            if (_.isEmpty(data)) {
                                return res.setError({
                                    type: "preconditionFailed"
                                }, "user.userData");
                            }
                            return usersModels.validateUser.UPDATE(userData.id, { password: appUtils.genEncryptedPass(validatedUserData.new_password) })
                                .then(function(data) {
                                    res.okSend({}, "auth.userData.password")
                                })
                        })
                })
                .catch(function(err) {
                    res.setError(err)
                })
        },

        signUp  : function(req, res, next){
            var payload = req.body;
            //var emailId = payload.email_address;
            var self    = this;

            
            // console.log("check point", existUserDetails);
            //console.log("on here", req.app_params.userData);
            // dummy.data;
            if(!_.isEmpty(req.app_params.userData)){
                return res.setError({
                        type: 'authFailure',
                        details : {
                            value : false
                        }
                    },
                    'user.exist' 
                );
            }
            return indicative.validate(payload, usersModels.validateUser.signupRules)
            .then(function(validatedUserData){
                
                if(validatedUserData.password!=validatedUserData.confirm_password){
                   return res.setError({
                        type: 'unprocessableEntity',
                        details : {
                            value : false
                        }
                    },
                    'user.password_confirm');     
                }

                delete validatedUserData.confirm_password;
                validatedUserData.password = appUtils.genEncryptedPass(validatedUserData.password);
                //validatedUserData.password
                return usersModels.validateUser.INSERT({
                    from        : validatedUserData.from,
                    email_id    : validatedUserData.email_id,
                    password    : validatedUserData.password
                })
                .then(function(userDetails){

                    //console.log("userDetails", userDetails);
                    //dummy.data;
                    var userId = userDetails.insertId;
                    return usersModels.userDetails.INSERT({
                        first_name  : payload.first_name,
                        last_name   : payload.last_name,
                        user_id     : userId 
                    })
                    .then(function(insertedUserDetails){
                        return usersModels.userDetails.getByUserID(userId)
                        .then(function(userDetails){
                            return res.okSend(userDetails, 'auth.user.signUp');
                        })
                    })
                })
            })
            .catch(function(err){
                console.log(err)
                if(_.isArray(err)){
                    return res.setError(err[0]);    
                }
                return res.setError(err);
            })
                //var password = appUtils.genEncryptedPass(validatedUserData.password)
            

        }
    }
}