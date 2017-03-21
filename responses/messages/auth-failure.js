/**
 * @apiDefine authFailure
 *
 * @apiError request requires user authentication
 *
 * @apiErrorExample authFailure
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Request requires user authentication."
 *     }
 */
module.exports = {
    status_code: 401,
    session: {
        token : {
            message : "Invalid token!"
        },
        get: {
            //message: "Presenter logged in successful",
        },
        post: {
            message: "You are already logged in!!!",
        },
        venue : {
            message : "Venue not found in session"
        }
    },
    user : {

        exist : {
            message : "User exist"
        },
        password: {
            message: "Invalid password."
        },
        password_confirm : {
            message: "Invalid password_confirm. Please make user if both password matches"  
        }
    },
    access_denied: {
        message: "You must be loggedin to continue"
    },
    userData: {
            incomplete: {
                message: "Data provided is Invalid"
            },
            absent: {
                message: "Oops! this is an unregistered user"
            }
	}
}
