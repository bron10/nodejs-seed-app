module.exports  = {
    auth : function(){
        return require('./auth');
    },
    venue : function(){
        return require('./venue');
    },
    performances : function(){
        return require('./performance')
        //return require('./performances')
    },
    events : function(){
        return require('./events')
    },
    stats : function(){
        return require('./stats')
    }
} 


