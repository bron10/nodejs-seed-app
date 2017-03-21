GLOBAL._            = require('lodash');
var eventsModel = require('../../models/events');
var Promise     = require('bluebird');
var countArray = [];

countArray.length = 50;
var totalprocess = 0;
var moment = require('moment');
Promise.map(countArray, function(){
    var requestime = moment().valueOf();
    return eventsModel.List.TestbyVenueIdAndLocTime({
       //venue_id            : 491,
        limit               : 100,
        skip                : 0,
        include_inactive    : undefined,
        sortby              : undefined,
        orderby             : undefined,
        search_query        : undefined  
    })
    .then(function(events){
        //console.log("events--->", events.length);   
        var responseTime = moment().valueOf();
        var processtime = responseTime - requestime;
        totalprocess=totalprocess+processtime;
        //console.log("totalprocess", totalprocess);
        console.log({
            requesttime : requestime,
            processtime : processtime,
            responsetime :responseTime  
        });
        return totalprocess;
    })    
})
.then(function(tp){
    console.log("total process time:  ", tp, totalprocess/countArray.length);
    
})

