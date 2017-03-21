var indicative          = require('indicative');
var moment              = require('moment');

module.exports.data = {

    paginator   : function (req, res, next) {
        var requestQuery    = req.query;
        var pagination      = appUtils.getConstant('pagination');
        requestQuery.skip   = parseInt(requestQuery.skip);
        requestQuery.limit   = parseInt(requestQuery.limit);

        //requestQuery.limit  = requestQuery.limit ? parseInt(requestQuery.limit) : pagination.skip;
        //console.log("requestQuery--->", requestQuery);
        requestQuery.skip   = _.isNaN(requestQuery.skip) ? pagination.skip : requestQuery.skip;
        requestQuery.limit  = _.isNaN(requestQuery.limit) || requestQuery.limit === 0 ? pagination.limit : requestQuery.limit;
        if(requestQuery.limit > 100){
            requestQuery.limit = pagination.max_limit;
        }
        req.query           = requestQuery;
        return next();
    },
    sorter      : function(req, res, next){
        var requestQuery        = req.query;
        requestQuery.sortby     = undefined;
        requestQuery.orderby    = undefined;
        var ascBy        = requestQuery.asc_by ? requestQuery.asc_by.trim() : "";
        var descBy       = requestQuery.desc_by? requestQuery.desc_by.trim() : "";
        if(!_.isUndefined(ascBy) && ascBy.length){
            requestQuery['sortby']   = 'ASC';
            requestQuery['orderby']  = ascBy;
        }
        if(!_.isUndefined(descBy) && descBy.length){
            requestQuery['sortby']   = 'DESC';
            requestQuery['orderby']  = descBy;
        }
        req.query =  requestQuery;
        //console.log("requestQuery-->", requestQuery);
        return next();
    },
}

module.exports.db  = {}
