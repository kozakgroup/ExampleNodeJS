'use strict';

const { mjml2html } = require('mjml');

const templates = {
  welcome: require('./templates/welcome.html'),
  passwordReset: require('./templates/passwordReset.html'),
  requestToJoin: require('./templates/requestToJoin.html'),
  digest: require('./templates/digest.html'),
  trialExpiration: require('./templates/trialExpiration.html'),
};

class EmailTemplate extends String {
  constructor(name, params) {
    const names = Object.keys(params || {});
    const values = Object.values(params || {});
    const template = new Function(...names, `return \`${templates[name]}\`;`)(...values);
    super(mjml2html(template).html);
  }
}

module.exports = EmailTemplate;
