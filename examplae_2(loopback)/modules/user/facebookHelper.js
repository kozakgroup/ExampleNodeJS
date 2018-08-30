'use strict';

const { FB } = require('fb');

const facebook = require('../configHelper')('facebook');

class FacebookHelper {
  static async getUser(code) {
    const { access_token, expires_in } = await FB.api('oauth/access_token',  Object.assign(facebook, { code }));
    const { id, name, email } =  await FB.api('me', { fields: ['id', 'name', 'email'], access_token });
    return {
      id,
      name,
      email,
      expires_in,
    };
  }
}

module.exports = FacebookHelper;
