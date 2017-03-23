var core    = require('../core');
var models  = require('../models');
//var server = oauth2orize.createServer();


module.exports  = function(app, UnauthRouteHandler){
    ///console.log("core", core);
    //console.log("Arguments", arguments)
    var sessionCtrl         = require('./session')(models, core);
    var userCtrl            = require('./user')(models, core);
	/**
     * @api {post} session/create create session
     * @apiName Loginuser
     * @apiGroup Session
     * @apiVersion 0.1.0
     *
     * @apiParam {String{3..}} email_id Mandatory: Registered email id in system
     * @apiParam {String{6..}} password Mandatory: Password for account
     *
     * @apiParamExample {json} Request-Example:
     *     {
     *       "email_id": "kala@gmail.com",
     *       "password": "123123"
     *     }
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
                "message": "User log-in successful",
                "data": {
                    "id": 1478,
                    "email_id": "kala@gmail.com",
                    "invite_code_reedem": "no",
                    "from": "portal",
                    "venue_count": 1,
                    "company_id": 1,
                    "stop_email": 0,
                    "test_flag": "no",
                    "july_24_notification_flag": 1,
                    "admin_venues": [
                        {
                            "user_id": 1478,
                            "venue_id": 373,
                            "name": "Kala",
                            "venue_code": "kala123",
                            "timezone_detail": "+05:30"
                        },
                        {
                            "user_id": 1478,
                            "venue_id": 491,
                            "name": "bd",
                            "venue_code": "bron",
                            "timezone_detail": "+05:30"
                        }
                    ],
                    "token": "IPqpzrnzGU8sHQ4Tn6xny9DPzJWKO_ca"
                }
            }
     *  @apiUse NotFoundError
     *  @apiUse ForbiddenError
     *  @apiUse ServerError
     *  @apiUse UnprocessableEntity
     *
     */
    UnauthRouteHandler.post('/session/create', sessionCtrl.create);

    /**
     * @api {get} session Get loggedin user info
     * @apiName GetUser
     * @apiGroup Session
     * @apiVersion 0.1.0
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
            "data": {
                "id": 1478,
                "email_id": "kala@gmail.com",
                "invite_code_reedem": "no",
                "from": "portal",
                "venue_count": 1,
                "company_id": 1,
                "stop_email": 0,
                "test_flag": "no",
                "admin_venues": [
                    {
                        "user_id": 1478,
                        "venue_id": 373,
                        "name": "Kala",
                        "venue_code": "kala123",
                        "timezone_detail": "+05:30"
                    },
                    {
                        "user_id": 1478,
                        "venue_id": 491,
                        "name": "bd",
                        "venue_code": "bron",
                        "timezone_detail": "+05:30"
                    }
                ]
            }
        }
     *
     *  @apiUse NotFoundError
     *  @apiUse ForbiddenError
     *  @apiUse ServerError
     *  @apiUse UnprocessableEntity
     */
    app.get('/session', sessionCtrl.GET);

    /**
     * @api {get} session Get loggedin user info
     * @apiName GetUser
     * @apiGroup Session
     * @apiVersion 0.1.0
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *
     *  @apiUse NotFoundError
     *  @apiUse ForbiddenError
     *  @apiUse ServerError
     *  @apiUse UnprocessableEntity
     */
    UnauthRouteHandler.get('/session/authtoken', sessionCtrl.getAuthtoken);


    /**
     * @api {delete} session/destroy destroy user
     * @apiName LogoutUser
     * @apiGroup Session
     * @apiVersion 0.1.0
     *
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
                "message": "You are logged out successfully!!",
                "data": {}
            }
     *
     *  @apiUse NotFoundError
     *  @apiUse ForbiddenError
     *  @apiUse ServerError
     *  @apiUse UnprocessableEntity
     */
	app.delete('/session/destroy', sessionCtrl.destroy);

	/**
     * @api {post} /user/check_user_exist Check if user exist
     * @apiName checkUserExist
     * @apiGroup User
     * @apiVersion 0.1.0
     *
     * @apiParamExample {json} Request-Example:
     *     {
     *       "email_id": "kala@gmail.com"
     *     }
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     *
     *  @apiUse NotFoundError
     *  @apiUse ForbiddenError
     *  @apiUse ServerError
     *  @apiUse UnprocessableEntity
     */
	UnauthRouteHandler.post('/user/check_user_exist', [userCtrl.checkUserExistCTRL, function(req, res, next){
            if(_.isEmpty(req.app_params.userData)){
                return res.okSend({
                            value : false
                        },
                    'auth.user.nonexist'
                );
            }
            return res.okSend({ value : true }, 'auth.user.exist');
        }]);

	/*For internal use only*/
	/**
     * @api {delete} session/destroy_all destroy all user sessions
     * @apiName LogoutAllUser
     * @apiGroup Session
     * @apiVersion 0.1.0
     * @apiDescription This is experimental need to still work on it!!
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
                "message": "All are logged out successfully!!",
                "data": {}
            }
     *
     *  @apiUse NotFoundError
     *  @apiUse ForbiddenError
     *  @apiUse ServerError
     *  @apiUse UnprocessableEntity
     */
	app.delete('/session/destroy_all', sessionCtrl.destroyAll);

    /**
        * @api {PUT} user Update user data
        * @apiName update-user
        * @apiGroup User
        *
        * @apiParam {first_name} first_name Mandatory: First name of the user.
        * @apiParam {first_name} last_name Mandatory: Last name of the user.
        * @apiParam {phone} phone Contact number of user.
        * @apiParam {gender} gender Male or female.
        * @apiParam {receive_ft_promotion} receive_ft_promotion Yes or no.
        * @apiParam {receive_presenter_promotion} receive_presenter_promotion Yes or no.
        *
        * @apiSuccessExample Success-Response:
        *     HTTP/1.1 200 OK
        *   {
                "message": "User information updated successfully!",
                "data": {},
                "status_code": 200
            }
        *  @apiUse NotFoundError
        *  @apiUse ForbiddenError
        *  @apiUse ServerError
        *  @apiUse UnprocessableEntity
        *
    */
    app.put('/user', userCtrl.updateUser);

    /**
        * @api {PUT} user/change_password Change password
        * @apiName change-password
        * @apiGroup User
        *
        * @apiParam {password} password Mandatory: Current users login password.
        * @apiParam {new_password} new_password Mandatory: New password.
        * @apiParam {confirm_password} confirm_password Mandatory: confirm password.
        *
        * @apiSuccessExample Success-Response:
        *     HTTP/1.1 200 OK
        *   {
                "message": "Password changed successfully!",
                "data": {},
                "status_code": 200
            }
        *  @apiUse NotFoundError
        *  @apiUse ForbiddenError
        *  @apiUse ServerError
        *  @apiUse UnprocessableEntity
        *
    */
    app.put('/user/change_password', userCtrl.changePassword);


    /**
        * @api {PUT} user/signup signup new user
        * @apiName signup
        * @apiGroup User
        *
        * @apiParam (from) {STRING="venue","customer","iphone","portal","presenter"} specify particular interfaceTYPE type
        * @apiParam (email_id) {email} Email id of user.
        * @apiParam (password) password password
        * @apiParam (first_name) {STRING} First name
        * @apiParam (last_name) {STRING} Last name
        * @apiParam (confirm_password) {STRING} retype password to confirm

        *
        * @apiSuccessExample Success-Response:
        *     HTTP/1.1 200 OK
        *   {
                "message": "Password changed successfully!",
                "data": {},
                "status_code": 200
            }
        *  @apiUse NotFoundError
        *  @apiUse ForbiddenError
        *  @apiUse ServerError
        *  @apiUse UnprocessableEntity
        *
    */
    UnauthRouteHandler.post('/user/signup', [userCtrl.checkUserExistCTRL, userCtrl.signUp])
}
