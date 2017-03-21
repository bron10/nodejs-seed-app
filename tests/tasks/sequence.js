var Promise     = require('bluebird');
var routes 	    = require('./routes');
var request     = require('request');
var dummyData   = require('./data');
// var chai        = require('chai');
// var expect      = chai.expect;
// var should      = chai.should();
// var assert      = chai.assert;
//require('it-each')({ testPerIteration: true });
describe('\t----> Testing Apis in sequence', function(){


    routes.auth();
    
})
