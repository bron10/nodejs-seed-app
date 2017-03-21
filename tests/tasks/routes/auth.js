var chai        = require('chai');
var expect      = chai.expect;
var should      = chai.should();
var assert      = chai.assert;
var request     = require('request');

var promise     = require('bluebird'); 
 
//console.log("appUrl", appUrl);

var authUrl = appUrl;
console.log("currentApp", currentApp);
if(currentApp == '/stats'){
    authUrl = baseUrl;
}
//console.log("authUrl", authUrl);
describe('*************Testing Authentication module***************\n', function () {
    
    it('POST:  Master Password Loggedin', function(done){
            var creds = _.cloneDeep(dummyData.credentials);
            //creds.
            creds.password = "123123";
            var options = {
                url: authUrl+'/session/create',
                headers: config.headers || {},
                json : creds
            };
            console.log("options-->", options);
            //console.log("creds", creds);
            request.post(options, function (error, response, body) {

                console.log("body", error, body);
               //Set cookie on login
               if(useCookie){
                    var setcookie = response.headers["set-cookie"];
                    //console.log("setcookie", setcookie);
                    if(setcookie) {
                        setcookie.forEach(
                            function(cookiestr){
                                config.headers.Cookie = cookiestr;
                                console.log( "COOKIE:" + cookiestr);
                            }
                        );
                    }
               }else{
                    //console.log("config header authtoken-->", error)
                    config.headers.authtoken = body.data.token;
               }

                
                //console.log("Config sett", config);
                //Expect response to be undefined;
                expect(response).to.be.not.a('undefined');
                    
                
                //check if data is an object
                expect(body).to.be.an('object');
                expect(body.status_code).to.not.be.undefined;
                if(typeof body == 'object'){
                    var userData = body.data;
                    //console.log("Loggedin as: ", userData.email_id)
                    switch(response.statusCode){
                        case 200:
                            //Check for valid body data
                            dummyData.venue.venueList   = userData.admin_venues;
                            //dummyData.venue.id          = userData.admin_venues[0].venue_id;
                            //holdpm.promise.resolve(dummyData.venue.venueList);
                            //console.log("dummyData.venue in logiinnn", dummyData.venue);  
                            expect(userData).to.contain.all.keys(['email_id', 'admin_venues', 'id', 'company_id']);
                            if(_.isEmpty(userData.admin_venues)){
                                console.log("No admin venues are present");
                            }
                            expect(userData.admin_venues).that.is.an('array').not.to.be.empty;
                            expect(userData.email_id).to.match(config.body.email.regex);
                            break;
                        case 422:
                            console.error("\t-> Unprocessable entity");
                            expect(body).to.contain.all.keys(['message', 'data']);    
                            //expect(userData.message).to.have.string('bar');
                            break;
                        case 404:
                        case 401:
                            console.error("\t-> Not found entity");
                            expect(body).to.contain.all.keys(['message', 'data']);    
                            //expect(userData.message).to.have.string('bar');
                            break;
                                                                                    
                    }
                   
                }
                done();
            });    
    })

    it('POST: logging in', function(done){
            var options = {
                url: authUrl+'/session/create',
                headers: config.headers || {},
                json : dummyData.credentials
            };

            //console.log("options --> ", options);
            request.post(options, function (error, response, body) {
                //console.log("error", error, body);
               //Set cookie on login
               if(useCookie){
                    var setcookie = response.headers["set-cookie"];
                    //console.log("setcookie", setcookie);
                    if(setcookie) {
                        setcookie.forEach(
                            function(cookiestr){
                                config.headers.Cookie = cookiestr;
                                console.log( "COOKIE:" + cookiestr);
                            }
                        );
                    }
               }else{
                    config.headers.authtoken = body.data.token;
               }

                
                //console.log("Config sett", config);
                //Expect response to be undefined;
                expect(response).to.be.not.a('undefined');
                    
                
                //check if data is an object
                expect(body).to.be.an('object');
                expect(body.status_code).to.not.be.undefined;
                if(typeof body == 'object'){
                    var userData = body.data;
                    //console.log("Loggedin as: ", userData.email_id)
                    switch(response.statusCode){
                        case 200:
                            //Check for valid body data
                            dummyData.venue.venueList   = userData.admin_venues;
                            //dummyData.venue.id          = userData.admin_venues[0].venue_id;
                            //holdpm.promise.resolve(dummyData.venue.venueList);
                            //console.log("dummyData.venue in logiinnn", dummyData.venue);  
                            expect(userData).to.contain.all.keys(['email_id', 'admin_venues', 'id', 'company_id']);
                            if(_.isEmpty(userData.admin_venues)){
                                console.log("No admin venues are present");
                            }
                            expect(userData.admin_venues).that.is.an('array').not.to.be.empty;
                            expect(userData.email_id).to.match(config.body.email.regex);
                            break;
                        case 422:
                            console.error("\t-> Unprocessable entity");
                            expect(body).to.contain.all.keys(['message', 'data']);    
                            //expect(userData.message).to.have.string('bar');
                            break;
                        case 404:
                        case 401:
                            console.error("\t-> Not found entity");
                            expect(body).to.contain.all.keys(['message', 'data']);    
                            //expect(userData.message).to.have.string('bar');
                            break;
                                                                                    
                    }
                   
                }
                done();
            });    
    })
            
    it('GET: '+currentApp+' User session', function(done){
        var options = {
            url: authUrl+'/session',
            //url : 'http://localhost:3000/session',
            headers: config.headers || {},
            json: true
        };
        
        //console.log("options", options);
        request(options, function (error, response, body) {
            //console.log("response", error);
            //Expect response to be undefined;
            expect(response).to.be.not.a('undefined');
                
            //Check if error
            
            if(response.statusCode!= 200){
                console.log("Invalid body: ", body)
            }
            
            //check if data is an object
            expect(body).to.be.an('object');
            
            expect(body.status_code).to.not.be.undefined;
            
            if(typeof body == 'object'){
                var userData = body.data;
                switch(response.statusCode){
                    case 200:
                        //Check for valid body data
                        expect(userData).to.contain.all.keys(['email_id', 'admin_venues', 'id', 'company_id']);
                        expect(userData.admin_venues).that.is.an('array').not.to.be.empty;
                        expect(userData.email_id).to.match(config.body.email.regex);
                        break;
                    case 404:
                        
                    case 401:
                        console.error("\t-> Not found entity");
                        expect(body).to.contain.all.keys(['message', 'data']);    
                        //expect(userData.message).to.have.string('bar');
                        break;         
                }
            }
            done();
         });                      
    }); 
        
});    
 