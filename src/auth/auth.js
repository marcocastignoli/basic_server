const config = require('../config')
const fetch = require('node-fetch');

const sendSms = async function (phone, verificationCode, content) {
  if (config.sms_enabled) {
    var options = {
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': config.sms.auth
        },
        body: JSON.stringify({
          to: phone,
          content: verificationCode,
          from: config.sms.from
      })
      
      };
    return await fetch('https://rest-api.d7networks.com/secure/send', options);
  } else {
    return {
      status: 200
    }
  }
}

module.exports = {
    sendToken: async function(userData, verificationCode) {
      switch(config.authMethod) {
        case 'sms': 
          const smsSent = await sendSms(userData.phone, verificationCode)
          if (smsSent.status !== 200) {
              return false
          }
          return true
          break;
        case 'email':
          return await sendEmail(userData.email, verificationCode)
          break;
        default:
      }
    }
}