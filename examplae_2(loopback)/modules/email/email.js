'use strict';

const nodemailer = require('nodemailer');
const file2InlinePlugin = require('nodemailer-plugin-file2inline');
const EmailTemplate = require('./emailTemplate');
const { validateConfig } = require('./validate');

class Email {
  constructor(config) {
    validateConfig(config);
    this.transporter = nodemailer.createTransport(config);
    this.transporter.use('compile', file2InlinePlugin({
      cidPrefix: 'prefix_',
      htmlFilePath: `${__dirname}/assets/`,
    }));

    this.emailOptions = {
      from: `Chirpy support <${config.auth.user}}>`,
    };
  }

    // /**
    //  *
    //  * @param {name, email} options
    //  */
  async sendWelcome(options) {
    await this.transporter.sendMail(Object.assign(this.emailOptions, {
      to: options.email,
      subject: 'Welcome to chirpy ✔',
      html: `${new EmailTemplate('welcome', { name: options.name })}`,
    }));
  }

    // /**
    //  *
    //  * @param {string} email
    //  * @param {name, url} options
    //  */
  async sendPasswordReset(email, options) {
    await this.transporter.sendMail(Object.assign(this.emailOptions, {
      to: email, // list of receivers
      subject: 'Reset your password ✔',
      html: `${new EmailTemplate('passwordReset', options)}`,
    }));
  }

  async sendJoinRequest(email, options) {
    await this.transporter.sendMail(Object.assign(this.emailOptions, {
      to: email, // list of receivers
      subject: 'Join to our team ✔',
      html: `${new EmailTemplate('requestToJoin', options)}`,
    }));
  }

  async sendDigest(to, score, feedback) {
    await this.transporter.sendMail(Object.assign(this.emailOptions, {
      to: to, // list of receivers
      subject: 'Your team digest ✔',
      html: `${new EmailTemplate('digest', Object.assign(score, { feedback }))}`,
    }));
  }

  async sendTrialExpirationEmail(to) {
    const result = await this.transporter.sendMail(Object.assign(this.emailOptions, {
      to: to, // list of receivers
      subject: 'Trial Expiration ✔',
      html: `${new EmailTemplate('trialExpiration')}`,
    }));
  }
}

module.exports = Email;
