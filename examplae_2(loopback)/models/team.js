'use strict';

const { Team } = require('../modules/index');

module.exports = function(model) {
  let team = new Team(model);
  team.disableMethods();

  model.validatesPresenceOf('name');

  model.inviteUser = team.getContextMethod('inviteUser');
  model.remoteMethod('inviteUser', team.getRemoteMethodDefinition('invintation'));
  model.beforeRemote('inviteUser', team.getContextMethod('beforeInvite'));

  model.acceptInvintation = team.getContextMethod('acceptInvintation');
  model.remoteMethod('acceptInvintation', team.getRemoteMethodDefinition('acceptInvintation'));
  model.beforeRemote('acceptInvintation', team.getContextMethod('beforeAcceptInvite'));

  model.beforeRemote('create', team.getContextMethod('beforeRemoteCreate'));

  model.afterRemote('prototype.__get__nests', team.getContextMethod('afterGetNests'));

  model.observe('before save', team.getContextMethod('writeUpdateFied'));

  model.beforeRemote('find', team.getContextMethod('beforeGetTeamList'));
  model.afterRemote('find', team.getContextMethod('afterGetTeamList'));

  model.beforeRemote('prototype.__get__users', team.getContextMethod('beforeGetUsers'));
  model.afterRemote('prototype.__get__users', team.getContextMethod('afterGetUsers'));

  model.beforeRemote('prototype.__destroyById__users', team.getContextMethod('beforeUpdateOrDeleteUser'));
  model.beforeRemote('prototype.__updateById__users', team.getContextMethod('beforeUpdateOrDeleteUser'));

  model.observe('after save', team.getContextMethod('afterSave'));
};
