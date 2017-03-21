var indicative = require("indicative")

module.exports = {
    getValidator: function() {
    	return indicative
    }
}

const isNumber = function(data, field, message, args, get) {
    return new Promise(function(resolve, reject) {
        var isNumber = _.isNumber(Number(data[field]))
        isNumber ? resolve() : reject(field + " should be a number")
    })
}

indicative.extend('isNumber', isNumber)
