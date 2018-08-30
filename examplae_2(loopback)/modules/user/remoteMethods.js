'use strict';

const refresh = {
  description: 'Returns token pairs',
  accepts: [{
    arg: 'data',
    type: 'object',
    description: `{
                    "token": "string",
                  }`,
    http: {
      source: 'body',
    },
    required: true,
  }],
  http: {
    path: '/refresh',
    verb: 'post',
  },
  returns: {
    root: true,
    type: 'object',
  },
};

const changePasswordAfterReset = {
  description: 'Change password after reset by email',
  accepts: [{
    arg: 'data',
    type: 'object',
    description: `{
                    "password": "string",
                  }`,
    http: {
      source: 'body',
    },
    required: true,
  }],
  http: {
    path: '/change-password-after-reset',
    verb: 'post',
  },
};

const logoutEverywhere = {
  description: 'Remove all tokens and returns new refresh token',
  accepts: [{
    arg: 'data',
    type: 'object',
    http: {
      source: 'body',
    },
  }],
  http: {
    path: '/logout-everywhere',
    verb: 'post',
  },
  returns: {
    root: true,
    type: 'object',
  },
};

const oAuth2Login = {
  description: 'Login as facebook/google/twitter user',
  accepts: [{
    arg: 'data',
    type: 'object',
    description: `{
                    "provider": "facebook/google/twitter - string"
                    "oauth_token": "string",
                  }`,
    http: {
      source: 'body',
    },
    required: true,
  }],
  http: {
    path: '/oauth2',
    verb: 'post',
  },
  returns: {
    root: true,
    type: 'object',
  },
};

module.exports = {
  refresh,
  oAuth2Login,
  logoutEverywhere,
  changePasswordAfterReset,
};
