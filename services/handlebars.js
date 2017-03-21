var Hbars = require('handlebars');
var mysql = require('mysql')


module.exports = {
    getCompiledHandelbarText: function(text, data) {
        if (!_.isString(text)) return ""
            // console.log(text, data)
        return Hbars.compile(text)(data || {})
    }
}


Hbars.registerHelper('compare', function(lvalue, operator, rvalue, options) {
    if (typeof lvalue === 'undefined') lvalue = '';
    if (lvalue === null) lvalue = '';
    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        'or' : function(l, r){
            return l || r;
        },
        'and' : function(l, r){
            return l && r;
        },
        '==': function(l, r) {
            return l == r;
        },
        '===': function(l, r) {
            return l === r;
        },
        '!=': function(l, r) {
            return l != r;
        },
        '!==': function(l, r) {
            return l !== r;
        },
        '<': function(l, r) {
            return l < r;
        },
        '>': function(l, r) {
            return l > r;
        },
        '<=': function(l, r) {
            return l <= r;
        },
        '>=': function(l, r) {
            return l >= r;
        },
        'typeof': function(l, r) {
            return typeof l == r;
        },
        'in_array': function(l, r) {
            l = l.split(',');
            for (var i = 0; i < l.length; i++) {
                if (l[i] == r) {
                    return true;
                }
            }
            return false;
        }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Hbars.registerHelper('escape', function(options) {
    return new Hbars.SafeString(mysql.escape(options.fn(this)))
});

Hbars.registerHelper('escapeId', function(options) {
    return new Hbars.SafeString(mysql.escapeId(options.fn(this)))
});