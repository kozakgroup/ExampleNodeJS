'use strict';

const assert = require('assert');

const moment = require('moment');
const generator = require('generate-password');

const { reset_password } = require('../configHelper')('email_redirect_url');

const { BadRequestError,
        ForbiddenError } = require('../../errors');

const FacebookHelper = require('./facebookHelper');
const GoogleHelper = require('./googleHelper');

const { Base } = require('../base');
const Team = require('../team/team');

const disabledMethods = require('./disabledMethods');
const remoteMethods = require('./remoteMethods');

const avilableProviders = ['facebook', 'google'];

class User extends Base {
  constructor(model) {
    super(model);
    this.disabledMethods = disabledMethods;
    this.remoteMethods = remoteMethods;
  }

  get TeamHelper() {
    return Team.Instance;
  }

  async beforeGetUsers({ args, req }) {
    let linkList = await this.Link.find({ where: { userId: req.accessToken.userId }});

    linkList = await this.Link.find({
      where: {
        or: linkList.map(({ teamId }) => ({ teamId })),
      },
    });

    args.filter = {
      where: {
        or: linkList.map(({ userId }) => ({ id: userId })),
      },
    };
  }

  async oAuth2Login({ provider, code, inviteId, rememberMe }) {
    try {
      assert.equal(avilableProviders.includes(provider), true);
    } catch (e) {
      throw new BadRequestError('invalid provider');
    }

    const helper = ((provider) => {
      switch (provider) {
        case 'facebook': return FacebookHelper;
        case 'google':   return GoogleHelper;
      }
    })(provider);

    let { id, name, email, expires_in } = await helper.getUser(code);

    if (!id) {
      throw new BadRequestError('Login failed');
    }

    expires_in = rememberMe ? expires_in : 2700;

    let user = await this.model.findOne({ where: { or: [{ [provider]: id }, { email }] }});

    if (!user) {
      var isNew = true;
      user = await this.model.create({
        email,
        name,
        password: generator.generate({
          length: 10,
          numbers: true,
        }),
        [provider]: id,
      });
      await this.afterCreate({
        req: {
          body: {
            inviteId,
          },
        },
      }, user);
    }

    if (user[provider] != id) {
      await this.model.update({ email }, { [provider]: id });
    }

    const tokenPair = await this.afterLogin({
      result: {
        isNew,
        userId: user.id,
        ttl: expires_in,
      },
    });

    return tokenPair;
  }

  async getRefreshToken({ userId, ttl }) {
    return await this.RefreshToken.create({
      ttl,
      expires_at: moment().add(ttl * 1000).toDate(),
      userId,
    });
  }

  async passTokenToRequest({ req }) {
    req.body.accessToken = req.accessToken;
  }

  async logoutEverywhere(data) {
    await Promise.all(['AccessToken', 'RefreshToken'].map((model) =>
      this[model].destroyAll({
        userId: data.accessToken.userId,
      })
    ));

    return {
      refreshToken: await this.getRefreshToken(data.accessToken),
    };
  }

  async afterChangePassword({ req, res }) {
    const { refreshToken } = await this.logoutEverywhere(req);
    res.send({
      refreshToken,
    });
  }

  async changePasswordAfterReset(data) {
    const user  = await this.model.findById(data.accessToken.userId);
    if (user.reset_token != data.accessToken.id) {
      throw new ForbiddenError('Reset token invalid or expired');
    }
    await user.setPassword(data.password);

    await this.model.update({ id: user.id }, { reset_token: null });

    await this.RefreshToken.destroyAll({
      userId: user.id,
    });
  }

  async afterCreate({ req }, credentails) {
    await this.UserSettings.create({
      userId: credentails.id,
    });
    if (req.body.inviteId) {
      try {
        await this.TeamHelper.acceptInvintation(req.body.inviteId, {
          userId: credentails.id,
          email: credentails.email,
        });
      } catch (e) {
        await this.model.update({ id: credentails.id }, { inviteId: null });
      }
    } else {
      await this.Team.create({
        name: 'General',
        expires_at: moment().add(1, 'M').toDate(),
        ownerId: credentails.id,
      });
    }
    if (credentails.email) {
      await this.Email.sendWelcome(credentails);
    }
  }

  async resetPasword({ accessToken, user }) {
    const options = {
      name: user.name,
      url: `${reset_password}/${accessToken.id}`,
    };
    await this.model.update({ id: user.id }, { reset_token: accessToken.id });
    await this.Email.sendPasswordReset(user.email, options);
  }

  async populateSettings({ result }, user) {
    result.userSettings = await this.UserSettings.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async afterUpdateSettings({ req }) {
    await this.model.update({ id: req.params.id }, { updated_at: new Date() });
  }

  async beforeUpdateUser({ req }) {
    if (req.body.hasOwnProperty('password')) {
      delete req.body.password;
    }
  }

  async afterUpdateUser({ result }) {
    result = await this.model.update({ id: result.id }, { updated_at: new Date() });
  }

  async afterLogin({ result }) {
    const accessToken = await this.AccessToken.create({
      ttl: 1800,
      userId: result.userId,
    });

    result.accessToken = accessToken;

    await this.AccessToken.destroyAll({
      and: [
        { id: { neq: result.accessToken.id }},
        { userId: result.userId },
      ],
    });

    await this.RefreshToken.destroyAll({
      and: [
        { expires_at: { lt: new Date() }},
        { userId: result.userId },
      ],
    });

    result.created = void 0;

    result.refreshToken = await this.getRefreshToken(result);

    return result;
  }

  async refreshToken({ token }) {
    if (!token) {
      throw new BadRequestError('Invalid passed data');
    }

    try {
      var { id, userId, ttl } = await this.RefreshToken.findOne({
        where: {
          id: token,
          expires_at: {
            gt: new Date(),
          },
        },
      });
    } catch (e) {
      throw new BadRequestError('Invalid token');
    }

    await this.RefreshToken.update({ id }, {
      ttl,
      expires_at: moment().add(ttl * 1000).toDate(),
    });

    await this.AccessToken.destroyAll({ userId });

    return {
      accessToken: await this.AccessToken.create({
        ttl: 1800,
        userId,
      }),
    };
  }
}

module.exports = User;
