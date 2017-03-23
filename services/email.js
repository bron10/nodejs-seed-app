var nodemailer  = require('nodemailer');
var mongoModels = require('./mongo-sdk');

module.exports = function(globalData) {
    

    var globalData          = _.assign({}, appUtils.getAppLocalData())
    //console.log("globalData", globalData);
    var cmpyEmailSett       = globalData.companyEmailSettings
    var cmpyList            = globalData.companyInfo
    var cmpyEmailTemp       = globalData.companyEmailTemplates
    var cmpyMarketingUrls   = globalData.companyMarketingUrls

    // var services = require("./index")
    // var appUtils = services.utils

    function initEmailConnection(emailSetting){
        if (!emailSetting) {
            return null
        }

        var host = emailSetting.smtp_host.split("://")
        host = host[1] || host[0] || ""


        var transporter = nodemailer.createTransport({
            port: emailSetting.smtp_port,
            host: host,
            secure: true,
            requireTLS: emailSetting.starttls || false,
            auth: {
                user: emailSetting.smtp_user,
                pass: emailSetting.smtp_password
            },
            pooled: true,
            debug: !(appUtils.getNodeEnv() == "production"),
            maxConnections: 5,
            maxMessages: 100 // per connection parally
        });

        transporter.on('idle', function() {
            // send next messages from the pending queue
            while (transporter.isIdle() && messages.length) {
                transporter.send(messages.shift());
            }
        });

        return transporter
    }

    return {
        sendMail            : function(userOptions, data, companyId) {
            //console.log("userOptions, data, companyId", userOptions, data, companyId);
            var emailConn           = null;
            // if(typeof companyId == 'number'){
            //     companyId = ""+companyId;
            // }
            var companyId           = companyId || _.findKey(appUtils.getConstant('interfaces'), 'online');
            var emailSetting        = cmpyEmailSett[companyId];
            var emailTemplate       = cmpyEmailTemp[companyId];
            var cmpySetting         = cmpyList[companyId];
            var cmpyMarketingUrl    = cmpyMarketingUrls[companyId];
            var data                = data || {};

            if (emailSetting) {
                emailSetting["connection"] = emailConn = emailSetting["connection"] ? emailSetting["connection"] : initEmailConnection(emailSetting)
            } else {
                return Promise.reject({
                    message: "Email configuration failed"
                })
            }
            var options = userOptions || {
                to: ['bron11@mailinator.com'], // list of receivers
                subject: 'Test'
            }

            if (_.isEmpty(options.to))
                return Promise.resolve({
                    message: "Email to be sent to is empty"
                })


              // console.log("emails", emails)
              options.to = _.pullAll(options.to, emails);
              // console.log("options.to", options.to)


              data.auto_email_url = cmpyMarketingUrl.auto_email_url;
                  // if (!_.isEmpty(options.text))
                  //     options.text = appUtils.getCompiledHandelbarText(emailTemplate[options.template], data)
              //console.log("sendmail", options.template)
              //try {
                  if (!_.isEmpty(options.template))
                      var content = appUtils.getCompiledHandelbarText(emailTemplate[options.template], data)
              // } catch (e) {
              //     console.log("Handlebar email template failure", e.stack)
              // }


              options.from = emailSetting.sender_email_address
              options.html = appUtils.getCompiledHandelbarText(emailTemplate.framework, { companyInfo: cmpySetting, content: content })

              if (emailSetting.default_email_bcc)
                  options.bcc = emailSetting.default_email_bcc

              emailConn.sendMail(options)

        }



    }
}
