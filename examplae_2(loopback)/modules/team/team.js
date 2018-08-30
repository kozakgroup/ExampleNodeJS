'use strict';

const assert = require('assert');
const moment = require('moment');

const { PaymentRequiredError,
        ForbiddenError,
        BadRequestError } = require('../../errors');

const { validateEmail } = require('../email/validate');

const { Base } = require('../base');

const Billing = require('../billing/billing');

const disabledMethods = require('./disabledMethods');
const remoteMethods = require('./remoteMethods');

class Team extends Base {
  constructor(model) {
    super(model);
    this.disabledMethods = disabledMethods;
    this.remoteMethods = remoteMethods;
  }

  get BillingHelper() {
    return Billing.Instance;
  }

  async beforeGetTeamList({ args, req }) {
    req.linkList = await this.Link.find({ where: { userId: req.accessToken.userId }});

    args.filter = {
      where: {
        or: req.linkList.map(({ teamId }) => ({ id: teamId })),
      },
    };
  }

  async beforeUpdateOrDeleteUser({ req }) {
    const { userId, team } = await this.Link.findOne({ where: { id: req.params.fk },  include: ['team'] });
    if (userId == req.accessToken.userId || userId == team().ownerId) {
      throw new ForbiddenError('You can\'t manage you own or team owner record');
    }
  }

  async afterGetTeamList({ req, result }) {
    result.forEach((team) =>
      team.isAdmin = req.linkList.find(({ teamId }) =>
        team.id == teamId).type == 'admin');
  }

  async beforeGetUsers({ args }) {
    args.filter = {
      include: 'user',
    };
  }

  async afterGetUsers({ req, result }) {
    result.map((record) => Object.assign(record, { isAdmin: record.type === 'admin' }));
  }

  async addUser(record) {
    await this.Link.create(record);
  }

  async beforeInvite({ req }) {
    req.body.userId = req.accessToken.userId;
  }

  async inviteUser(teamId, { email, type, userId }) {
    await this.Invintation.create({
      teamId,
      email,
      type,
      userId,
    });
  }

  async beforeAcceptInvite({ req }) {
    const { email } = await this.User.findById(req.accessToken.userId);

    req.body.email = email;
    req.body.userId = req.accessToken.userId;
  }

  async acceptInvintation(inviteId, { email, userId }) {
    try {
      var { id, type, teamId } = await this.Invintation.findOne({
        where: {
          id: inviteId,
          email,
        },
      });
    } catch (e) {
      throw new BadRequestError(e);
    }

    await this.addUser({
      type,
      userId,
      teamId,
    });

    await this.Invintation.deleteById(inviteId);

    return {
      teamId,
    };
  }

  async beforeRemoteCreate({ req }) {
    req.body = JSON.stringify(Object.assign(req.body, {
      ownerId: req.accessToken.userId,
      expires_at: moment().add(1, 'M').toDate(),
    }));
  }

  async afterSave({ instance, isNewInstance }) {
    if (isNewInstance) {
      await this.addUser({
        type: 'admin',
        userId: instance.ownerId,
        teamId: instance.id,
      });
      const { email } = await this.User.findById(instance.ownerId);
      process.cronWorker.send({
        event: 'registerTrialExpirationJob',
        data: {
          date: new Date(instance.expires_at),
          emails: [email],
          teamId: instance.id,
        },
      });
    }
  }

  async afterGetNests({ req, result }) {
    const { length } = await this.Link.find({
      where: {
        teamId: req.params.id,
        userId: req.accessToken.userId,
        type: 'admin',
      },
    });

    if (!length) {
      result.forEach(nest =>
                nest.apiKey = void 0);
    }
  }

  validateTeam({ mode, expires_at, remaining_pishings, enabled }) {
    let valid = remaining_pishings > 0 & new Date(expires_at) > new Date() & enabled;

    if (!valid) {
      throw new PaymentRequiredError('You team is temporary unavilable');
    }
  }

  async writeUpdateFied(context) {
    let model = context.currentInstance || context.instance || context.data;
    model.updated_at = new Date();
  }
}

module.exports = Team;
