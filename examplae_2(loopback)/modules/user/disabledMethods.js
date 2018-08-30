'use strict';
/** base methods */
const baseMethods = [
  'replaceOrCreate',
  'patchOrCreate',
  'findOne',
  'createChangeStream',
  'updateAll',
  'replaceById',
  'upsert',
  'upsertWithWhere',
  'exists',
  'deleteById',
  'setPassword',
  'logout',
  'confirm',
  'count',
  'prototype.verify',
];

const relatedIdentitiesMethods = [
  'prototype.__count__identities',
  'prototype.__create__identities',
  'prototype.__delete__identities',
  'prototype.__destroyById__identities',
  'prototype.__findById__identities',
  'prototype.__get__identities',
  'prototype.__updateById__identities',
];

const relatedCredentialsMethods = [
  'prototype.__count__credentials',
  'prototype.__create__credentials',
  'prototype.__delete__credentials',
  'prototype.__destroyById__credentials',
  'prototype.__findById__credentials',
  'prototype.__get__credentials',
  'prototype.__updateById__credentials',
];

const relatedAccessTokensMethods = [
  'prototype.__count__accessTokens',
  'prototype.__create__accessTokens',
  'prototype.__delete__accessTokens',
  'prototype.__destroyById__accessTokens',
  'prototype.__findById__accessTokens',
  'prototype.__get__accessTokens',
  'prototype.__updateById__accessTokens',
];

const relatedUserSettingsMethods = [
  'prototype.__create__settings',
  'prototype.__destroy__settings',
  'prototype.__get__settings',
];

module.exports = baseMethods.concat(relatedIdentitiesMethods,
                                    relatedCredentialsMethods,
                                    relatedAccessTokensMethods,
                                    relatedUserSettingsMethods);
