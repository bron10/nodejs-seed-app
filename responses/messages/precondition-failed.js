/**
 * @apiDefine preconditionFailed
 *
 * @apiError Precondition Failed The server does not meet one of the preconditions that the requester put on the request.
 *
 * @apiErrorExample Precondition Failed
 *     HTTP/1.1 412 Precondition Failed
 *     {
 *       "error": "Opps!! The server does not meet one of the preconditions that the requester put on the request"
 *     }
 */
module.exports = {
	status_code: 412,
	ticket : {
		sold : {
			message : "Sorry, the tickets or ticket type you were trying to book are sold out."
		}
	},
	cart : {
		requestedData : {
			message : "Invalid requested data, please check the requested payload"
		},
		cartStructure : {
			message : "Invalid cart data, please check the cart data"
		},
		cartkey : {
			message : "Invalid cartkey, please key if cart key is valid"
		}
	},
	delivery_method : {
		set :{
			message : "Invalid delivery method payload"	
		},
		cartkey : {
			message : "Invalid cartkey, please key if cart key is valid"
		},
		seatInfo : {
			message : "Invalid seat info, please check all the parameters in seat info are correct"
		},
		interfaceTYPE : {
			message : "Check if delivery type is enabled for current interfaceTYPE"
		}

	},
	accessCode : {
        check  : {
            message : "Invalid Access Code, please check if accessCode is correct or ready to use"
        }
    },
    user: {
    	userData: {
    		message: "Invalid password."
    	}
    }
}