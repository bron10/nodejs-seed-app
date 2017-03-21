var logger = require("../services/logger");

module.exports = {
    RULES: {

    },
    DEFAULT: function() {
        return _.cloneDeep({
            from: new Date - 24 * 60 * 60 * 1000,
            until: new Date,
            limit: 10,
            start: 0,
            order: 'desc',
            // fields: ["message"],
            q: ""
        })
    },
    LIST: function(data) {
        var data = _.cloneDeep(this.DEFAULT(), data)
        return logger.query(data);
    }


}
