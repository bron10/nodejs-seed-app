var responses       = require('../responses')
var cookieSig       = require('cookie-signature');
//var appUtils        = require('./utils');
var jwt         = require('jsonwebtoken');
function Session(verifyCallback) {

	var cookieName = 'app-cookie';
    var secretkey = appUtils.getConfig('session').secret;

    function setDefaultSessionData(req){
        // if(req.session && req.session.rowData){
        //    // console.log("we gotta here", req.session.rowData);
        //     return req.session.rowData;
        // }
        return {
            //session_id  : appUtils.getUniqueId(),
            user_agent  : req.headers['user-agent'] || 'anonymous-user-agent',
            last_activity : Date.now(),
            ip_address :req.connection.remoteAddress
           // cookie  :      '{}'
        }
    }

    /**
     * @bugFixes : [#10752]
     * @Desc
     */
	return function (req, res, next) {

		/**
         * set cookie in response
        */
        //console.log("request --->", req.url);
        cookieName      = req.headers.host + "-" + appUtils.getNodeEnv();
        var cookie      = req.cookies[cookieName];
        var sessionId   = "";
        req.session     = {};

        var authtoken       = _.trim(req.headers.authtoken);
        var sessionData = {};
        var defaultSessionData = setDefaultSessionData(req);
        //console.log("authtoken ala pan incorrect hai", authtoken);
        if(!!authtoken){
            //sessionId = authtoken;
            //console.log("authtoken-->", authtoken);
            try{
                /**
                 *
                */
                sessionData = jwt.verify(authtoken, secretkey);
                sessionId  = authtoken;
                //console.log("sessionData", )
            }catch(e){
                //console.log("errorr -->", e);

                return res.setError({
                    type : 'authFailure'
                }, 'session.token');

                // return res.setError({
                //             type : 'notFound'
                // }, 'events.event_id.get');
            }

        }else if(!!cookie){
            sessionId = cookieSig.unsign(cookie, secretkey);
        }else{
           //sessionId  = appUtils.getUniqueId();

           /**
            * Cases
            * - no authtoken present generate new one
            * - no cookie present
           */

            sessionId      = jwt.sign(appUtils.getUniqueId(), secretkey);
            req.session.rowData             = defaultSessionData;
        }

        //console.log("before verifyCallback sessionId", sessionId);
        //dummy.data;
        //req.session.id = sessionId;
        verifyCallback(sessionId)
        .then(function(data){
            //console.log("data-->", JSON.stringify(data));
            if(data){
                //console.log("set default session if present", sessionId)
                req.session    = data;
            }else{
                //req.session.session_id = sessionId;
                //console.log("set default session if not present", sessionId)
                req.session.rowData    = defaultSessionData;
                req.session.rowData.session_id = sessionId;
                //console.log("2")
            }

            req.session.id = sessionId;
            //console.log("req.session", req.session);
            res.cookie(cookieName, cookieSig.sign(sessionId, secretkey), {httpOnly: true});
            return next();
        });


   	}

}

module.exports = Session;


// for (var i = 10 - 1; i >= 0; i--) {
//     console.log("hahaa->",jwt.sign(appUtils.getUniqueId(), 'secretkey'));
// }
