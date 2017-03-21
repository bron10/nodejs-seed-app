/**
 * @apiDefine UnprocessableEntity
 *
 * @apiError UnprocessableEntity Missing/wrong data sent.
 *
 * @apiErrorExample Unprocessable entity
 *     HTTP/1.1 422 Server error
 *     {
 *       "error": "Missing/wrong data sent"
 *     }
 */
module.exports = {
    status_code: 422,
    payload: {
        message: "Payload is invalid"
    },
    query: {
        message: "Invalid query. Please check query parameters"
    },
    venue: {
        set: {
            incomplete: {
                message: "Venue Id not provided"
            }
        },
        get: {
            incomplete: {
                message: "Venue Id not provided"
            }
        }
    },
    events: {
        getTransStats: {
            invalid: {
                message: "Event id in url is not valid"
            }
        }
    },
    performances: {
        getTransStats: {
            invalid: {
                message: "Event id in url is not valid"
            }
        }
    },
    payment: {
        requestData: {
            message: "Requested payload is not valid, please check your requested data"
        },
        methods: {
            message: "Requested payload contains wrong combination of payment methods"
        },
        na: {
            message: "Invalid payment method"
        }
    },
    questionnaire: {
        requestData: {
            message: "Requested payload is not valid, Please check questionnaire payload"
        }
    },
    accessCode: {
        check: {
            message: "Requested access_code is not valid, Please check questionnaire access_code"
        }
    },
    survey: {
        mapSurvey: {
            message: "No surveys found for the events added in the cart"
        },
        surveyIncomplete: {
            message : "Survey is incomplete."
        }
    },
    orderSummary : {
        venue : {
            message : "The venue in request doesn't match the venue present in order"
        },
        ftOrderId : {
            message : "Please check if order id is valid or transaction is complete"
        }
    }
}
