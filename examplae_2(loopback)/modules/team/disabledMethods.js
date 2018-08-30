'use strict';
/** base methods */
const baseMethods = [
  'replaceOrCreate',
  'patchOrCreate',
  'findOne',
  'createChangeStream',
  'updateAll',
  'replaceOrCreate',
  'replaceById',
  'upsert',
  'upsertWithWhere',
  'count',
  'deleteById',
  'exists',
  'findById',
];

const relatedUserMethods = [
  'prototype.__findById__users',
  'prototype.__count__users',
  'prototype.__delete__users',
  'prototype.__create__users',
];

const relatedNestMethods = [
  'prototype.__findById__nests',
  'prototype.__destroyById__nests',
  'prototype.__updateById__nests',
  'prototype.__count__nests',
  'prototype.__delete__nests',
  'prototype.__create__nests',
];

module.exports = baseMethods.concat(relatedUserMethods,
                                    relatedNestMethods);
