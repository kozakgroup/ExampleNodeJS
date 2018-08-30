'use strict';
const assert = require('assert');

const requiredFields = [
  'host',
  'port',
  'secure',
  'auth',
];
/* eslint max-len: ["error", { "ignoreRegExpLiterals": true }] */
const regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function validateEmail(email) {
  return regexp.test(email);
}

function validateConfig(config) {
  try {
    assert.equal(JSON.stringify(requiredFields) ==
                 JSON.stringify(Object.keys(config)), true);
    assert.equal(validateEmail(config.auth.user), true);
    assert.equal(config.auth.pass.length > 0, true);
  } catch (e) {
    console.error('Nodemailer config is not valid');
    process.exit(0);
  }
}

module.exports = {
  validateConfig,
  validateEmail,
};
