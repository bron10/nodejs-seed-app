// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
//console.log("asas", GLOBAL);

process.chdir(__dirname);
//Third party modules
GLOBAL._            = require('lodash');
GLOBAL.Promise      = require('bluebird');
GLOBAL.rootPath     = __dirname;

require('./services');
GLOBAL.appUtils     = appServices.utils;

var vhost           = require('vhost');
var fs              = require('fs');
var express         = require('express');
var bodyParser      = require('body-parser');
var errorhandler    = require('errorhandler');
var compression     = require('compression');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
//var passport        = require('passport');
var formidable      = require('express-formidable');
//var expressSession  = require('express-session');
var responseTime    = require('response-time')
//console.log("zxcxzc --->");
var os              = require('os');
var helmet          = require('helmet');
var vhost           = require('vhost');
var cors            = require('cors');

var nodeENV         = appUtils.getNodeEnv();
var numCPUs = os.cpus().length;




//custom services
var models          = require('./models');
//console.log("models", models);
var mongoModels     = require('./mongo-models');
//console.log("models", models);
var middlewares     = require('./middlewares');
var sessionModels   = models.session;
//console.log("middlewares", middlewares);
var responder       = middlewares.responseHandler;
var sessionHandler  = middlewares.session;

var config          = appUtils.getConfig()
//console.log("config", config);
//var validators    = services.validators;

//console.log("nodeENV", nodeENV);
express.response = _.assign(express.response, responder);
var app             = express();

var routers = {
    UnAuthRoute : express.Router()
    //, ciRouter    : express.Router()
};


// routers.ciRouter.use(function(req, res, next){
//     console.log("it cam in ci router12");
//     next();
// })

var logDirectory = __dirname + '/log';



//Removes x-powered-by header
app.disable('x-powered-by');

//Simple security lib : https://github.com/helmetjs/helmet
app.use(helmet());

// compress all requests
app.use(compression());


// enable/disable cors
app.options("*", cors({
  "origin": true,
  "methods": "PUT,POST,DELETE,HEAD",
  "preflightContinue": false,
  "credentials": true,
  "optionsSuccessStatus": 200 // 204 can be used but legacy browsers might create problems
}));

app.use(cors({
  "origin": [/localhost:8888$/],
  "methods": "GET,HEAD,PUT,POST,OPTIONS,DELETE",
  "preflightContinue": false,
  "credentials": true
}));

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// only use in development
//console.log("nodeENV", nodeENV)
if (nodeENV === 'development') {
    // process.on('uncaughtException', function(e) {
    //   console.log('An error has occured. error is: %s and stack trace is: %s', e, e.stack);
    //   console.log("Process will restart now.");
    //   process.exit(1);
    // })


    app.use(errorhandler())

    var accessLogStream = fs.createWriteStream(logDirectory + '/' + nodeENV + '_access.log', {
        flags: 'a'
    })

    // setup the logger
    app.use(morgan('combined', {
        stream: accessLogStream
    }))
}

appServices.logger.initLogger(nodeENV)

/**
 * MAINTAIN THE SEQUENCE OF MIDDLEWARE BELOW
**/

/** parse application/json **/
app.use(bodyParser.json());
/** parse application/x-www-form-urlencoded **/
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(function(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON');
        res.status(err.status).send({error : "Bad JSON"});
    }
});

/** Add response time **/
app.use(responseTime());


/** parse formdata **/
app.use(formidable.parse());

/** app.use(middlewares.errorHandler()); **/
app.use(cookieParser());

/** app.use(middlewares.routeValidator());**/
app.use("/doc", express['static'](__dirname + '/doc'));
app.use("/docs", express['static'](__dirname + '/docs'));

if (nodeENV === "production") {
    app.set('trust proxy', 1) // trust first proxy
};

/** Subdomain handler **/
// app.use(vhost('*.mappp.dev', function(req, res, next) {
//     //console.log("in Subdomain");
//     /**
//      * Note : @incomplete Check If CI urls is requires authentication
//      * set auth parameter
//     */
//     var fullUrl         = req.protocol + '://' + req.get('hostname') + req.originalUrl;
//     var subdomainArray  = _.split(req.hostname, '.');

//     if(subdomainArray.length != 3){
//         return res.setError({
//             path : req.url,
//             type : 'notFound',
//             method: req.method
//         }, 'route');
//     }

//     req.localData.interfaceId   = 1;
//     req.localData.venueData     = {
//         venuecode     : subdomainArray[0]
//     };
//     next();
// }));

/**
 * @Method responder.handle
 * @desc set response handler methods in response instance
 */
app.use(responder.handle);
/**
 * Middleware
 * @name dbConfigSetter
 * @description 1.fetch initial db data and set in app.locals
 *
 * @return Middleware for setting company data w.r.t requests
*/
app.use(middlewares.dbConfigSetter(app, models));

/** Set interfacetype **/
app.use('/:interfaceTYPE',function(req, res, next){

    // req.localData = {
    //     interfaceId : 2
    // };

    /**
     * @patch
     * @desc The below code in this middlware, is consider as patch fot current system.
     * The venue code that actually passed from url of request, is implemented through headers
     * for CI.
    */

    console.log("req", req.url)
    //var interfaces = _.values(appUtils.getConstant('interfaces'));

    var interfaceType  = req.params.interfaceTYPE;

    switch(interfaceType){
        case 'docs':
        //app.set('view engine', 'html');
        //console.log("asdas112x")

        return fs.readFile(__dirname + '/code-docs/docs/index.html','utf8', function(error, data){
            if(error)
                res.setError(error);
            //console.log("asdas", error)
            res.send(data);
            return;
        })
        default :
        console.log("Invalid url by interfaceTYPE middleware!!");
        res.setError({
            path    : req.url,
            type    : 'notFound',
            method  : req.method
        }, 'route');
        return;
    }
    next();
})

/**
** @incomplete
/** Session Handler **/
app.use(sessionHandler(function(token){
    return sessionModels.get(token);
}));





/**
 * Set venue for CI
*/



/**
 * Middleware of Unauthenicated routes is attached
*/
//app.use(routers.ciRouter);
app.use(routers.UnAuthRoute);


module.exports = app;


/**
 * Common modules
 */

require('./user')(app, routers.UnAuthRoute);

/**
 * Reports middleware initialization
 */



/**
 * api controllers
 */

require('./controllers')(app, routers.UnAuthRoute);



var appEmitter              = appUtils.appEmitter();

var dbConnectorInterval     = 5000;
var defaultNoOfReconnects   = 6;
var currentDbReconnects     = 0;

appEmitter.on('init-server', function(){

    //console.log("Db connected sucessfully!");
    console.log("Starting app...");

        appUtils.intializeAppSetup(app)

    app.listen(config[nodeENV].port, function() {
        console.log("Server started on: ", process.platform, "and in ", nodeENV, "environment and on port ", config[nodeENV].port)
    });
    appEmitter.removeAllListeners("init-server");
})

app.on('error', function(e) {
    console.log("1--->", e);
    if (e.code == 'EADDRINUSE') {
        console.log('Server crashed!!');
    }
    console.log(e.stack)
});

/**
 * Need to keep below middleware always last
*/
app.use(function(req, res) {
    res.setError({
        path : req.url,
        type : 'notFound',
        method: req.method
    }, 'route');
});

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log("uncaughtException-->", err.stack)
})


/**
 * @event
 * @name  reconnect-db
 * @description
 */
appEmitter.on('reconnect-db', function(e){
    console.log("Came in reconnecting");
    //setInterval
    if(defaultNoOfReconnects === currentDbReconnects){
        currentDbReconnects = 0;
        appEmitter.removeAllListeners("reconnect-db");
        console.log("Reconnecting to Db reached its limits");
        return false;
    }

    setTimeout(function(){
        currentDbReconnects++;
        console.log("setting interval", currentDbReconnects);
        middlewares.dbConfigSetter(app, models)

    }, dbConnectorInterval);
});

appUtils.appEmitter().emit('init-server');
