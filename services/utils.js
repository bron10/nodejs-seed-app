var config            = require("../config"),
    moment            = require('moment'),
    momentTZ          = require('moment-timezone'),
    constants         = Object.freeze(config.constants),
    crypto            = require('crypto'),
    CreditCard        = require('credit-card'),
    uuid              = require('node-uuid'),
    buffer            = require('buffer'),
    microtime         = require('microtime'),
    AllHtmlEntities   = require('html-entities').AllHtmlEntities,
    emailService      = require("./email"),
    phantom           = require('phantom'),
    fs                = require('fs'),
    handlebarsService = require("./handlebars"),
    geoip2            = require('geoip2'),
    urlParser         = require('url'),
    requestIp         = require('request-ip');



var responses   =require('../responses');
//console.log("responses", responses);
var views       = require('../views');
//console.log("constants", constants);
var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();

//console.log("microtime", microtime.now());
var htmlEntityInst = new AllHtmlEntities()
var emailInstance = null;
var localStorage  = null;

var utils = {
    dateFormat: 'YYYY[-]MM[-]DD',
    datetimeFormat: 'YYYY[-]MM[-]DD HH:mm:ss',
    timezone: process.env.TZ || 'America/Danmarkshavn', //UTC +0:00
    transIdPreText: 'est',
    regex: {
        alphaNumHyphenUnderscore: "/^[a-zA-Z0-9-_]+$/g"
    },
    getResponseMessages : responses.getMessages,
    getConfig: function(key) {
        if (key)
            return config[key];
        return config;
    },
    getNodeEnv: function() {
        return process.env.NODE_ENV || "development";
    },
    appEmitter: function() {
        return ee;
    },

    /**
     * Returns current or specificed date by YYYY-MM-DD format
     */
    getDateOnly: function(dt) {
        return moment(dt).format(this.dateFormat);
    },
    /**
     * Returns current or specificed date by YYYY-MM-DD format
     */
    getDateTimeOnly: function(dt) {
        return moment(dt).format(this.datetimeFormat);
    },

    getView : function(viewkey){
      return views[viewkey];
    },
    getStartDate: function(dt) {

        //console.log("IS VAlid in getStartDate --  --  - - -- - >", moment(dt).utc())
        if (moment(dt || "").isValid()){
            return moment(dt).utc().format(this.dateFormat + ' 00:00:00');
        }
        else
          return undefined;
    },
    /**
     * [getNoUTCStartDate Get start date without converting to utc]
     * @param  {[type]} dt date
     * @return {[type]}    return calculated start date in defined format
     */
    getNoUTCStartDate: function(dt) {

        //console.log("IS VAlid in getStartDate --  --  - - -- - >", moment(dt).utc())
        if (moment(dt || "").isValid()){
            return moment(dt).format(this.dateFormat + ' 00:00:00');
        }
        else
          return undefined;
    },

    getEndDate: function(dt) {
        dt = _.trim(dt);
        //console.log("get start date valid--->", dt);
        if (moment(dt).isValid()){
            //console.log("IS VAlid --  --  - - -- - >")
            return moment(dt).utc().format(this.dateFormat + ' 23:59:59');
        }
        else return undefined;
    },

    /**
     * [getNoUTCEndDate Get enddate without utc]
     * @param  {[type]} dt required date
     * @return {[type]}    converted end date with respective format
     */
    getNoUTCEndDate: function(dt) {
        dt = _.trim(dt);
        if (moment(dt).isValid()){
            return moment(dt).format(this.dateFormat + ' 23:59:59');
        }
        else return undefined;
    },
    getMonthStartEndDate : function(month, year) {
        year          = year ||  moment().year();
        // month in moment is 0 based
        month         = month ? month-1  : moment().month();
        var self      = this;
        var startDate = moment().month(month).year(year).date(1).format(self.dateFormat);

        // make sure to call toDate() for plain JavaScript date type
        return { start: startDate, end: moment(startDate).endOf('month').format(self.dateFormat) };
    },
    getLocationDateTime : function(dt, TZ) {
        //console.log("get start date valid tz", dt);
        dt = _.trim(dt) || undefined;
        //console.log("moment(dt).isValid()", moment(dt).isValid(), dt);
        if (moment(dt).isValid())
            return momentTZ(dt).tz(TZ || this.timezone).format(this.datetimeFormat);
        else return undefined;
    },
    getPrevDaysDate: function(dt, noOfDays) {
        return moment(dt).utc().subtract(noOfDays, 'days').format('YYYY[-]MM[-]DD');
    },
    getYesterdaysDate: function(dt) {
        return moment(dt).utc().subtract(1, 'days').format(this.datetimeFormat);
    },
    getZoneoffset: function(tz){
        return momentTZ().tz(tz || this.timezone).format('Z');
    },

    minus12hrs: function() {
        return moment().utc().subtract(12, 'hours').format(this.datetimeFormat);
    },
    subtractTime : function(dt, SubValue, unit){
     // console.log("dt, SubValue, unit", dt, SubValue, unit);
      return moment(dt).subtract(SubValue, unit).format(this.datetimeFormat);
    },
    addTime : function(dt, SubValue, unit){
            return moment(dt).add(SubValue, unit).format(this.datetimeFormat);
    },

    /**
     * @previous_php_method FT_model->get_server_time
     *
     * @param   String TZ
     * @param   Date/timestamp dt
     * @return  STRING date
     *
     * @Desc get server time according to its timezone for available datetime
     */
    getServerTime: function(TZ, dt) {
        TZ = TZ || this.timezone
        var dtTimestamp = moment.utc(dt).unix(); // in seconds
        //console.log("tdtimestamp-->", dtTimestamp);
        return moment.unix((dtTimestamp - ((momentTZ.tz.zone(TZ).offset(dtTimestamp) * 60) * (-1)))).utc().format(this.datetimeFormat);

    },

    /**
     * @previous_php_method get_today_date
     *
     * @param   String TZ
     * @return  STRING date
     *
     * @Desc Though the actual use of php_method: get_local_time() differs from this method,
     * this method can be used  as alias of get_local_time() with single argument timezone.
     * @alias if used as this.getLocationDateTime(undefined, <TZ>)
     */
    getCurrentTZDate: function(TZ, DF) {
        DF = DF || this.datetimeFormat;
        return momentTZ().tz(TZ || this.timezone).format(DF);
    },

    //php date
    getUTCDateTime: function(df) {
        return moment().utc().format(df || this.datetimeFormat);
    },
    getUnixTime: function(dt) {
        return moment.utc(dt).unix() // in seconds;
    },
    getUnixTimeByTZ: function(dt, TZ) {
        return momentTZ.tz(dt, TZ).utc().unix();
    },

    /**
     * @previous_php_method convert_date_in_local_language
     *
     * @param   STRING dt {datetime}
     * @param   STRING TZ {timezone}
     * @return
     *
     * @Desc Almost same as getCurrentTZDate
     *
     */
    convertToLocale: function(dt, TZ, DF) {
        return momentTZ(dt).tz(TZ || this.timezone).format(DF || this.dateFormat);
    },

    /**
     * @previous_php_method get_local_time2
     *
     * @param   STRING dt {datetime}
     * @param   STRING TZ {timezone}
     * @return
     *
     * @Desc Almost same as getCurrentTZDate
     *
     */
    getLocalTime: function(dt, TZ, DF) {
        return momentTZ(dt).tz(TZ || this.timezone).format(DF || this.dateFormat);
    },
    isStringEmpty: function(data) {
        if (data)
            return _.isEmpty(data.trim());
        return true;
    },
    genEncryptedPass: function(pass) {
        return crypto.createHash('sha1').update(pass || "").digest('hex')
    },
    numberFormat: function(data, placementUnit) {
        placementUnit = placementUnit || 2;
        return ((parseFloat(data)).toFixed(placementUnit) * 1) || 0;
    },
    getConstant: function(path) {
        return _.get(constants, path, {});
    },
    parseJSON: function(data) {
        try {
            data = JSON.parse(data);
        } catch (e) {}
        return data;
    },
    stringifyJSON: function(data) {
        try {
            data = JSON.stringify(data) || "";
        } catch (e) {}
        return data;
    },
    getSessionUserData: function(request) {
        return this.getSessionData(request).user_data;
    },
    getInterfaceId  : function(req){
      return req.localData.interfaceId;
    },
    getInterface : function(req){
      return this.getConstant('interfaces.'+this.getInterfaceId(req));
    },
    getVenueData: function(request) {
        if(appUtils.getInterfaceId(request) === 1){
            return request.localData.venueData;
        }
        var userData    = this.getSessionUserData(request);
        return userData ? userData.venueData : {};
    },
    isPaylater : function(val){
      return val =='paylater' || val=='10';
    },
    getSessionData: function(request) {
        //console.log("request.session.rowData", request.session);
        return request.session.rowData;
    },
    getCartData: function(request, interfaceId) {
        var venueData = appUtils.getVenueData(request).selectedVenue
        var venueCartData = appUtils.getSessionUserData(request).cart_data[venueData.venue_code]
        if (interfaceId)
          var cartData = venueCartData[interfaceId];
        return !interfaceId ? venueCartData : cartData;
    },
    resetSessionUserData : function(request){
      request.session.rowData.user_data.cart_data = {};
      return request;
    },
    assign: function(defaultt, source) {
        //console.log("_.assignInWith", defaultt, source);
        return _.assignWith(defaultt, source, function(defaultValue, sourceValue) {
            if (_.isUndefined(sourceValue))
                return defaultValue;

            return sourceValue;
        });
    },
    strToLower : function(str){
        str = str || "";
        return str.toLowerCase();
    },
    removeAllSpecialChars: function(data, replacer) {
        return _.replace(this.decodeHtmlEntities(data), this.regex.alphaNumHyphenUnderscore, replacer || ' ');
    },
    compactMap: function(data, cb) {
        return _.compact(_.map(data, cb))
    },
    getUniqueId: function() {
        return uuid();
    },
    getUniqTransId: function(data) {
        return this.transIdPreText + microtime.now();
    },
    validateAndGetCardType: function(cardNum) {
        if (!CreditCard.luhn(cardNum)) return false

        var cardType = CreditCard.determineCardType(cardNum)
        return cardType;
    },
    /**
     * @previous_php_method html_entity_decode
     *
     * @param   STRING str {html string}
     * @return  pased string
     *
     * @Desc Returns the html parsed string
     *
     */
    decodeHtmlEntities: function(str) {
        if (!_.isString(str)) return str

        return htmlEntityInst.decode(str)
    },

    //base64_encode
    base64Encoder: function(str) {
        var str = str || ""
        return new Buffer(str).toString('base64');
    },

    decodeToAscii: function(str){
      var str = str || ""
      //new Buffer(enc,'base64').toString()
      return new Buffer(str, 'base64').toString();
    },

    intializeAppSetup: function(app) {
        this.storeLocalData(app);
        emailInstance = emailService();
        return emailInstance;
    },

    storeLocalData : function(app){
      localStorage = app.locals;
      //console.log("local")
    },

    getAppLocalData : function(keypath){
      console.log(keypath);
      //if(keypath == `companyMarketingUrls.1`){
       // console.log("companyMarketingUrls data", localStorage['companyMarketingUrls']);
       if(keypath)
          return _.get(localStorage, keypath);
    //  }
      return localStorage;
    },

    isTypeRefunded : function(type){
      return _.endsWith(_.lowerCase(type), 'refund');
    },

    getEmailConnection: function() {
        return emailInstance
    },

    getHostFromRequest : function(req){
      return req.protocol + '://' + req.headers.host;
    },

    createhostUrl :  function(venueCode, interfaceId, noProtocol){
       var configEnvironment = _.cloneDeep(config[this.getNodeEnv()] || {});
       var url = _.replace(configEnvironment.hosts[""+interfaceId].url, '<VENUE_CODE>', venueCode);
      return url;
    },

    removeProtocol : function(url){
      var configEnvironment = _.cloneDeep(config[this.getNodeEnv()] || {});
      return _.replace(url, configEnvironment.protocol, '');
    },
    getEventUrl : function(option){
      //console.log("getEventUrl option", option);
      return this.createhostUrl(option.venueCode, option.interfaceId)+`/event/index/`+option.eventId+`/`+this.getAppLocalData('companyMarketingUrls.'+option.companyId).auto_email_url;
    },

    makeTicketUrl : function(option){
      //console.log("makeTicketUrl option", option);
      return this.createhostUrl(option.venueCode, option.interfaceId)+`/booking/ticket/`+option.xsactionOrderId+`/?ticket[]=`+_.join(option.tickets, '&ticket[]=');
    },

    getEmailTemplates : function(companyId, templateUrl){
      if(templateUrl)
      return localStorage[companyId][templateUrl];

      return localStorage[companyId];
    },

    /**
     * @previous_php_method convert_money_format
     * @incomplete true
    */
    toMoneyFormat: function(currencyDetails, amount) {
      //console.log("limit, skip, total", data, limit, skip, total);
      //var currencyDetails = venueDetails.currency_details;
        if(currencyDetails.symbol_position == 'R')
            return amount+' '+currencyDetails.symbol;
        else
            return currencyDetails.symbol+amount;
    },

    /**
     * @previous_php_method
     *
     * @param   OBJECT data    {}
     * @param   Integer limit   {}
     * @param   Integer skip    {}
     * @param   Integer total   {}
     *
     * @Desc Returns paginated data
     *
     */
    paginateIt: function(data, limit, skip, total) {
      //console.log("limit, skip, total", data, limit, skip, total);
        data['pagination'] = {
            limit: limit,
            skip: skip,
            total: total,
            current_page: _.ceil(skip / limit) + 1,
            total_page: _.ceil(total / limit)
        }
        return data;
    },

    attachFile : function(url, mailDetails, companyId){
      var self = this;
      //console.log("url", url);
      return phantom.create().then(function(ph) {
        //console.log("phantom create");
        return ph.createPage().then(function(page) {
          //console.log("phantom create page", url);
          //console.log("page.settings", page);
          page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.256');
          return page.open(url).then(function(status) {
                //console.log("phantom open");
                //console.log("status, data", status, data);
                if(status!='success'){
                    ph.exit();
                    return Promise.reject();
                }

                var fileName = './temp/attach-'+self.getUniqTransId()+'.pdf';
                return page.render(fileName)
                .then(function(renderStatus){
                  console.log("page render");

                  mailDetails.option.attachments = [{
                    'path': fileName,
                    encoding: 'base64'
                  }];

                  //console.log("mail detials", JSON.stringify(mailDetails), companyId);
                  return self.getEmailConnection().sendMail(mailDetails.option, mailDetails.body, companyId)
                })
                .catch(function(err){
                  //console.log("err  -->", err);
                  return Promise.reject(err);
                })
                .finally(function(){
                    //console.log("Asd Asd cool");
                    fs.unlink(fileName);
                    return ph.exit();
                })
            });
        })
      });
    },

    /**
     *
     * @param   Object questionaireDetails
     * @param   Object payload
     * @return  pased string
     *
     * @Desc validate questionaire payload
     *
     */
    validateQuestionarePayload : function(questionaireDetails, payload, req){

          // console.log("questionaireDetails", JSON.stringify(questionaireDetails));
          // dummy.data;
        return _.every(questionaireDetails, function(fieldData){
            //console.log("fieldData", fieldData);
            var aa = checkIfValidField(fieldData, req);
            //console.log("aa", aa);
            return aa;
        });
        //dummy.data;
        function checkIfValidField(fieldData, req){
            var payload             = req.body;
            var keys                = _.keys(payload);
            var rules               = fieldData.schema;

            if(rules.display){
                //console.log("fieldData", fieldData);
                return _.every(keys, function(key){
                    var cartPayload = {};
                    var payloadDatum = payload[key];

                    //payloadDatum

                    //Check if field key is valid/present
                    var selectedTicketData = _.find(payloadDatum.attendee_info_per_ticket, function(ticketData){
                        var hasData             = _.has(ticketData.field_struct, fieldData.field_key);

                        ticketData.field_struct = cartPayload;
                        return hasData;
                    }) || { field_struct : {}};

                    //console.log("selectedTicketData", selectedTicketData[fieldData.field_key], fieldData.field_key, selectedTicketData);
                    var selectedFieldValue = _.trim(selectedTicketData.field_struct[fieldData.field_key]);
                    //check if field key data is ""
                    if(rules.mandatory && !selectedFieldValue){

                        return false;
                    }


                    if(fieldData.inbuilt){
                        if(selectedTicketData.field_struct[fieldData.field_key])
                            cartPayload[fieldData.field_key] = selectedFieldValue;
                    }else{
                        if(!cartPayload['custom']){
                            cartPayload['custom'] = []
                        };
                        cartPayload.custom.push({
                            field_id    : fieldData.field_key,
                            field_value : selectedFieldValue
                        })
                    }

                    //console.log("cartPayload", cartPayload);
                    return true;
                })
                //return matchedPayload;
            }
            return true;
        }
    },
    updateImagesList: function(images) {
        var imageUrls = this.getConstant("images");
        return _.each(images, function(i) {
            var url = i.url
            if (i.cover_photo == "yes") {
                i.url = imageUrls.show_url + url
                i.thumb_url = imageUrls.show_thumb_url + url
                i.original_url = imageUrls.show_original_url + url
            } else {
                i.url = imageUrls.gallery_url + url
                i.thumb_url = imageUrls.gallery_thumb_url + url
                i.original_url = imageUrls.gallery_original_url + url
            }
        })
    },

    checkIfNumber : function(data){
      data = this.parseJSON(data);
      return _.isNumber(data);
    },

    getVenueCodeFromPaymentUrl : function(url){

      var parsedUrlObject = urlParser.parse(url);
      url = parsedUrlObject.pathname;
      if(~parsedUrlObject.pathname.indexOf('return_by_payment_processor') || ~parsedUrlObject.pathname.indexOf('return_by_redirect_payment')){
        var arr = _.split(url, '/');
        return arr[arr.length-1];
      }
      return;
    },

    /**
     * [getTZByLocationType Extract timezone by checking performance location type]
     * @param  {Object} performanceInfo
     * @return {String}             [description]
     */
    getTZByLocationType : function(performanceInfo){
      if(performanceInfo.location_type == 'web'){
          return performanceInfo.location_id;
      }else{
          return performanceInfo.timezone;
      }
    },



    getIpFromRequest: function(req){
      return requestIp.getClientIp(req);
    },

    checkForSaleEndDate : function(performance, formattedCurrentTime){

      return (performance.sale_end == 'specific_end_date' && (this.getUnixTime(performance['sale_end_datetime']) < this.getUnixTime(formattedCurrentTime)))
    },

    /**
     * Incomplete - Will be used to fetch the language keys value to be used by the node to generate templates
     * @param  {String} key  [Language key]
     * @param  {String} lang [Language choosen]
     * @return {String}      [Lnaguage keys value]
     */
    getLangTranslationKeyValue: function(key, lang) {
      var lang = this.getLanguageData(lang)

      if (lang[key]) {
        return lang[key]
      }

      return key
    },

    /**
     * [getLanguageData get language data from files]
     * @param  {String} key
     * @return {OBJECT} language json
     */
    getLanguageData : function(key){
      var key = key || "en"
      if(key)
        return languages[key];

      return languages;
    },
    /**
     * Php function get_device_type
     * [getLanguageData get language data from files]
     * @param  {String} key
     * @return {OBJECT} language json
     */
    getDeviceType: function(agent) {
        var agent = agent || ""
        var agentDeviceType = "unknown"
            // Check for Device Type. Computer, Tablet, Mobile, Bot
        var devicesTypes = {
            "desktop": ["msie 10", "msie 9", "msie 8", "windows.*firefox", "windows.*chrome", "x11.*chrome", "x11.*firefox", "macintosh.*chrome", "macintosh.*firefox", "opera"],
            "tablet": ["tablet", "android", "ipad", "tablet.*firefox"],
            "mobile": ["mobile ", "android.*mobile", "iphone", "ipod", "opera mobi", "opera mini"],
            "bot": ["googlebot", "mediapartners-google", "adsbot-google", "duckduckbot", "msnbot", "bingbot", "ask", "facebook", "yahoo", "addthis"]
        };

        _.each(devicesTypes, function(devices, deviceType) {
            _.each(devices, function(device) {
                var reg = new RegExp(device, "i")
                if (agent.match(reg)) {
                    agentDeviceType = deviceType
                    return false
                }
            })
        })

        return agentDeviceType;
    }
}
module.exports = _.assign(utils, handlebarsService)
