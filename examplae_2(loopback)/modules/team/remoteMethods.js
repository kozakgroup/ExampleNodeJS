'use strict';

const invintation = {
  accepts: [{
    arg: 'id',
    type: 'string',
    description: 'invite user to team',
    required: true,
  }, {
    arg: 'data',
    type: 'object',
    description: `{
                      "email": "string",
                      "type": "admin/member"
                    }`,
    http: {
      source: 'body',
    },
    required: true,
  }],
  http: {
    path: '/:id/invite',
    verb: 'post',
  },
};

const acceptInvintation = {
  accepts: [{
    arg: 'inviteId',
    type: 'string',
    description: 'accept invite user to team',
  }, {
    arg: 'data',
    type: 'object',
    http: {
      source: 'body',
    },
    required: false,
  }],
  http: {
    path: '/:inviteId/accept',
    verb: 'post',
  },
  returns: {
    root: true,
    type: 'object',
  },
};

module.exports = {
  invintation,
  acceptInvintation,
};
