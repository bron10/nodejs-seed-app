/**
 * @apiDefine ForbiddenError
 *
 * @apiError Forbidden Access denied.
 *
 * @apiErrorExample Forbidden
 *     HTTP/1.1 403 Access denied
 *     {
 *       "error": "You dont have acces to this."
 *     }
 */
module.exports = {
    status_code: 403,
    performance: {
        create: {
            message: "performance created sucessfully",
            performance: {}
        }
    },
    payment : {
        method : {
            message : "Invalid payment method type"
        
        }
    },
    sale : {
        completed : {
            message : "Online sale ended"
        },
        presale : {
            message : "Cannot book ticket before sale time starts"
        },
        postsale : {
            message : "Cannot book ticket afer sale time ends"
        }
    },
    interfaces : {
        get : {
            message : "Invalid interfaces parameters"
        }
    },
    accessCode : {
        checkUsed  :{
            message : "You have used an access code. Please complete your current transaction before adding more tickets."
        },
        checkRedeemed : {
            message : "This code has previously been redeemed"
        }
    }
}
