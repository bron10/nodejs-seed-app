var indicative 		= require('indicative');
var models          = require('../models');
var sessionModels   = models.session;
//var usersModels     = models.users;
//var companyModel    = models.company;
//var venueModel      = models.venues;

var appUtils        = require('../services').utils;
var Promise         = require('bluebird');

module.exports.validation = function(req, res, next){
   // console.log("1");
    var rowData = _.cloneDeep(req.session.rowData);
    var self = this;

    //console.log("in validation", !_.isEmpty(rowData) && !!rowData.user_id);
    if(!_.isEmpty(rowData) && !!rowData.user_id){
        // console.log("rowData.user_data", rowData.user_data);
        delete rowData.user_data;
        return self.getUserSession(req, res, next)
        .then(function(userInfo){
            // console.log("userInfo", userInfo)
            userInfo['token'] = req.session.id;
            return {
                type : 'exist',
                details : userInfo
            }
        })

    }

    var userData = req.body.user_data || req.body || {};

    /**
     * Check if requested user data is empty
     */
    if(_.isEmpty(userData)){
       userData.details = {
           type : 'authFailure'
       };
       userData.path = 'userData.incomplete';
       return Promise.reject(userData);
    }

    // console.log("3---------", userData);
    /**
    * Validate userData according to user-model rules
    * @param {object} userData [email_id, password]
    * @param {object} sessionModels.validateUser.RULES [email_id, password]
    * @return {object} [promise object]
    */

    return indicative.validate(userData, usersModels.validateUser.RULES)
	.then(function(validatedUserData){
        //console.log("Validated!!!!", validatedUserData)
        var password = appUtils.genEncryptedPass(validatedUserData.password)
        var companyId = validatedUserData.company_id || appUtils.getCompanyId(req)

        return self.isMasterPass(password,companyId)
            .then(function(isMasterPass){
                //console.log("isMasterPass", isMasterPass)
                return usersModels.validateUser.QUERY({
                    email_id    : validatedUserData.email_id,
                    password    : password,
                    company_id  : companyId,
                    isMasterPass: isMasterPass
                })
                .then(function(userResults){
                    //console.log("userResults", userResults);
                    /**
                     * Check if user is present
                     */
                    if(_.isEmpty(userResults)){
                        return Promise.reject({
                            details : {
                                type : 'authFailure'
                            },
                            path : 'userData.absent'
                        });
                    }
                    //console.log("5", validatedUserData);
                    var selectedUserData    = _.cloneDeep(userResults);
                    selectedUserData.token  = req.session.id;

                    validatedUserData = _.assign({}, validatedUserData, {
                        id : selectedUserData.id,
                        company_id : selectedUserData.company_id,
                        from : selectedUserData.from
                    });

                    //console.log("01", selectedUserData);
                    /**
                     * Remove password data
                    */
                    delete validatedUserData.password;
                   // console.log("11")

                    var sessionValidationData       = req.session.rowData;

                    /**
                     * @Note If cart_data is present in session extract it
                     * and assign it seperately
                     */
                    var cartData = undefined;
                    if(sessionValidationData.user_data && !_.isEmpty(sessionValidationData.user_data.cart_data)){
                        cartData = sessionValidationData.user_data.cart_data;
                    }

                    //Set User data in session
                    sessionValidationData.user_data = validatedUserData;
                    sessionValidationData.user_id   = validatedUserData.id;

                    //Reassign cart data in session
                    if(cartData)
                        sessionValidationData.user_data.cart_data = cartData;

                    /**
                     * Validate sessionData according to session-model rules
                     * @param {object}  [session_id, user_agent, user_data, last_activity, ip_address, cookie]
                     * @param {object}  sessionModels.Session.RULES [session_id, user_agent, user_data, last_activity, ip_address, cookie]
                     * @return {object} [promise object]
                     */

                    return indicative.validate(sessionValidationData, {
                        'session_id' : 'required'
                    })
                    .then(function(data){
                        req.session.rowData = data;
                        //console.log("selectedUserData", selectedUserData);
                        //selectedUserData = ;
                        //console.log("123", selectedUserData);
                        delete selectedUserData.password;
                        delete selectedUserData.reset_password_key;
                        return selectedUserData;

                        //return _.omit(selectedUserData, ['reset_password_key', 'password']);
                    })
                    .catch(function(e){
                        if(e.details)
                            return Promise.reject(e);
                        return Promise.reject({
                            details : {
                                message : "Something went wrong while session validation",
                                type : 'authFailure'
                            },
                            path : 'userData.absent'
                        });
                    })
                })
            })
    })
    .catch(function(err){
        console.log("not Validated!!!!")
       console.log("err", err);
        if(err.details){
            return Promise.reject(err);
        }
        userData.details = {
            error : err,
            type : 'authFailure'
        };

        userData.path = 'userData.incomplete';
        return Promise.reject(userData);
	})
}

/**
* Post authentication settings
*/
module.exports.authentication = function(req, selectedUserData){

    var venueIds = [];
    return usersModels.getAdministratorVenue.QUERY(selectedUserData)
    .map(function(venueMapping) {
        selectedUserData['admin_venues'] = [];
        return venueModel.getVenueInfo.byIdJoinedOnTZ(venueMapping)
        .then(function(venueInfo) {
            var venueDatum = venueInfo[0];
            var venue =  _.assign(venueMapping, venueDatum, {})
            venueIds.push(venue.venue_id);
            selectedUserData['admin_venues'].push({
                user_id             : venue.user_id,
                venue_id            : venue.venue_id,
                name                : venue.name,
                venue_code          : venue.venue_code,
                timezone_detail     : appUtils.getZoneoffset(venue.timezone),
            })
            return venue;
        })
    })
    .then(function(adminVenues){
        //var currencyIds = [];
        /**
         * Set venue data in session
         */
        req.session.rowData.user_data['venueData'] = {
            venue_ids : venueIds
        };

        /**
         * Remove unwanted data and return new object
        */
        return _.omit(selectedUserData, ['venueData']);


    })
}


module.exports.getUserSession = function(req, res, next){
    var rowData = req.session.rowData;
    var self    = this;
    if (rowData && rowData.user_id) {
        //console.log("getUserSession")
        return Promise.join(
            usersModels.getUserById.QUERY(rowData.user_data.id),
            self.authentication(req, rowData.user_data),
            function(userData, authenticatedVenueData){
                // console.log("userData", userData);
                // console.log("authenticatedVenueData]", authenticatedVenueData);
                userData[0]['token'] = req.session.id;

                /**
                 * Delete password details
                */
                return _.assign(authenticatedVenueData, _.omit(userData[0], ['reset_password_key', 'password', 'july_24_notification_flag']))
            })
    }
    // console.log("authFailure")
    return Promise.reject({
        details : {
            type : 'authFailure',
            message : "Invalid authtoken or session"
        },
        path : 'userData.absent'
    });
}

module.exports.isMasterPass = function(password, companyID) {
        return companyModel.getMiscellaneousSettings(companyID)
            .then(function(data){
                var cmpySett = data[0] || {}
                var masterPass = cmpySett.password

                return !_.isEmpty(masterPass) && masterPass === password
            })
}

/**
 * @previous_php_method booking_model/manage_account_details
 * @param {Object} accountDetails
 * @param {Integer} venueId
 *
 * @return {Promise [userID : returns customer/user id]}
 *
 * @Desc
 */
module.exports.manageAccountDetails = function(userData, userAccountInfo){
        //console.log("accountDetails", accountDetails);
        var validatedUser = usersModels.validateUser;
        var userId = userAccountInfo.id;
        var userDetailsModel = usersModels.userDetails;
        //console.log("1.userId->", userData);
        /***
         *@optimization The below db call getByUserID can be removed as we already have data in localdata.
         * The only issue is regarding
        */
        return userDetailsModel.getByUserID(userId, 'user_id, first_name, last_name')
        .then(function(userResults){
            //console.log("2.userResults", userResults);
            //console.log("exp 2->", userResults)
            var userPromise = Promise.resolve(null);
            if(_.isEmpty(userResults)){
                userPromise = userDetailsModel.INSERT(userData.details)
            }else{
                // console.log("userData.details", userData.details);
                // dummy.data;
                if(!_.isEmpty(userData.details) && userId!=0){

                    if(userResults['first_name']=="" && userId){
                        userPromise = userDetailsModel.UPDATE(userId, userData.details)

                }
                else if(!userResults['phone']){
                    //console.log("exp 3");
                    delete userData.details['first_name'];
                    delete userData.details['last_name'];
                    if(userData.details['birth_date']=="--")
                        delete userData.details['birth_date'];

                    //console.log("ala nai ", userData, userId);
                    if(!_.isEmpty(userData.details)){
                        userPromise = userDetailsModel.UPDATE(userId, userData.details)
                    }
                }
                }

            }

            //console.log("cam here2")
            return userPromise.then(function(){
                return usersModels.userAddress.getInfoByUserID(userId, 'user_id')
                .then(function(userIDResults){
                    //console.log("userIDResults", userIDResults);
                    //TC : Case address case test
                    userData.address['user_id'] = userId;
                    if(_.isEmpty(userIDResults)){
                        return usersModels.userAddress.INSERT(userData.address)
                    }else{
                        //console.log("seq")
                        if(_.isEmpty(userData['user_address']))
                            return usersModels.userAddress.INSERT(userData.address)
                    }

                })

            })
            .then(function(){
                //console.log("at lassss");
                return userId;
            })
        })
     }
