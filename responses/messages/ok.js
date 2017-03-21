module.exports = {
    status_code: 200,
    auth: {
        session: {
            get: {
                //status_code: 200,
                //message: "Presenter logged in successful",
            },
            login: {
                message: "User log-in successful"
            },
            exist: {
                message: "You are already logged in!!!"
            },
            logout: {
                message: "You are logged out successfully!"
            },
            logoutUserSessions: {
                message: "All sessions are logged out successfully!"
            }
        },
        userData: {
            update: {
                message: "User information updated successfully!"
            },
            password: {
                message: "Password changed successfully!"
            }
        },
        user: {
            signUp: {
                message: "User sign-up successfully"
            },
            exist: {
                message: "User Present"
            },
            nonexist :{
              message: "User doesnt exist in current system"  
            }
        }
    },
    performance: {
        create: {
            message: "performance created sucessfully",
            performance: {}
        },
        list: {

        },
        get: {

        },
        transactionDetails: {

        }
    },
    events: {
        list: {},
        event_id: {
            get: {}
        }
    },
    stats: {
        events: {
            transactionDetails: {

            }
        },
        performance: {
            transactionDetails: {

            }
        }
    },
    venue: {
        get: {

        },
        set: {

            message: "Venue is configured successfully"
        }
    },
    discount: {
        promocode: {
            get: {},
            applied: {
                message: "promocode already present."
            }
        }
    },
    payment: {
        set: {
            "message": "Payment done sucessfully"
        }
    },
    purchaser: {
        get: {

        }
    },
    delivery_method: {
        get: {},
        set: {
            "message": "Delivery method is set sucessfully"
        }
    },
    accessCode: {
        check: {
            message: "You successfully access this event"
        }
    },
    cart: {
        transaction: {
            remove_ticket: {
                message: "Ticket in transaction removed sucessfully"
            }
        }
    },
    order: {
        getSummary: {
            message: 'Tickets Delivered Succesfully'
        }
    },
    survey: {
        mapSurvey: {
            message: "Survey mapped sucessfully"
        },
        checkSuccess: {
            message: "Checked successfully."
        },
        copied: {
            message: "Survey copied successfully."
        },
        surveyAvailability: {
            message: ""
        }
    },
    booking : {
        success : {
            email_message : ":  Transaction Successful #"
        },
        pending : {
            message :"Transaction Pending"
        }
    }
}
