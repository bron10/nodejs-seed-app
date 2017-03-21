/**
 * @apiDefine largeEntity
 *
 * @apiError Payload Too Large.
 *
 * @apiErrorExample Forbidden
 *     HTTP/1.1 413 Payload Too Large
 *     {
 *       "error": "Requested Entity Too Large"
 *     }
 */
module.exports = {
    status_code: 413,
    payment : {
        methods :{
            message :"More then required payment methods are requested"
        }
    },
    cart : {
    	transactions :{
    		message : "The number of transactions in a single order should be limited"
    	},
    	requestedData : {
    		seats  : {
    			message : "The number of seats booked in a single transaction should be limited"
    		}
    	}
    }
}
