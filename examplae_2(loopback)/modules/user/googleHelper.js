'use strict';

const { promisify } = require('util');

const google = require('../configHelper')('google');

const goauth2 = require('google-oauth2')(google);

const request = require('../requestWrapper/request');

const getTokensForAuthCode = promisify(goauth2.getTokensForAuthCode);

class GoogleHelper {
  static async getUser(code) {
    const { id_token, access_token } = await getTokensForAuthCode(code);

    const { email, expires_in } = await request({
      host: 'www.googleapis.com',
      path: `/oauth2/v3/tokeninfo?access_token=${access_token}`,
    });

    const { id, displayName } = await request({
      host: 'www.googleapis.com',
      path: `/plus/v1/people/me?access_token=${access_token}`,
    });

    return {
      id,
      email,
      name: displayName,
      expires_in,
    };
  }
}

module.exports = GoogleHelper;
