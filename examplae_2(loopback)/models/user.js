'use strict';

const { User } = require('../modules/index');

module.exports = function(model) {
  let user = new User(model);
  user.disableMethods();

  model.oAuth2Login = user.getContextMethod('oAuth2Login');
  model.remoteMethod('oAuth2Login', user.getRemoteMethodDefinition('oAuth2Login'));

  model.refreshToken = user.getContextMethod('refreshToken');
  model.remoteMethod('refreshToken', user.getRemoteMethodDefinition('refresh'));

  model.logoutEverywhere = user.getContextMethod('logoutEverywhere');
  model.remoteMethod('logoutEverywhere', user.getRemoteMethodDefinition('logoutEverywhere'));
  model.beforeRemote('logoutEverywhere', user.getContextMethod('passTokenToRequest'));

  model.changePasswordAfterReset = user.getContextMethod('changePasswordAfterReset');
  model.remoteMethod('changePasswordAfterReset', user.getRemoteMethodDefinition('changePasswordAfterReset'));
  model.beforeRemote('changePasswordAfterReset', user.getContextMethod('passTokenToRequest'));
  model.afterRemote('changePasswordAfterReset', user.getContextMethod('afterChangePassword'));

  model.afterRemote('create', user.getContextMethod('afterCreate'));
  model.afterRemote('findById', user.getContextMethod('populateSettings'));
  model.afterRemote('prototype.__update__settings', user.getContextMethod('afterUpdateSettings'));
  model.afterRemote('prototype.patchAttributes', user.getContextMethod('afterUpdateUser'));
  model.afterRemote('login', user.getContextMethod('afterLogin'));

  model.afterRemote('changePassword', user.getContextMethod('afterChangePassword'));
  model.beforeRemote('prototype.patchAttributes', user.getContextMethod('beforeUpdateUser'));

  model.beforeRemote('find', user.getContextMethod('beforeGetUsers'));

  model.on('resetPasswordRequest', user.getContextMethod('resetPasword'));
};
