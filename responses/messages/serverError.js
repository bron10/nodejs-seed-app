/**
 * @apiDefine ServerError
 *
 * @apiError ServerError Internal server error.
 *
 * @apiErrorExample Server error
 *     HTTP/1.1 500 Server error
 *     {
 *       "error": "Opps!! something went wrong"
 *     }
 */
module.exports = {
    status_code: 500,
    db : {
        connection : {
            message : "Error while connecting to data source"
        }
    },
    performance: {
        create: {
            message: "performance created sucessfully",
            performance: {}
        },
        get: {
            
        },
        list: {
            
        }
    },
    events: {
        get: {
           
        },
        event_id: {
            get: {
              
            }
        }
    },
    ticket : {
        
    },
    transaction :{
        notknown : {
            message : "something went wrong while running returned payment process"
        },
        expired : {
            message : "transaction already completed or expired"
        }
    }
}
