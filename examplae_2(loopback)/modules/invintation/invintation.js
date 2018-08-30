'use strict';

const { ForbiddenError,
        BadRequestError } = require('../../errors');

const { Base } = require('../base');

const { invite_user } = require('../configHelper')('email_redirect_url');

const disabledMethods = require('./disabledMethods');

class Invintation extends Base {
  constructor(model) {
    super(model);
    this.disabledMethods = disabledMethods;
  }

  async beforeCreate({ instance, isNewInstance }) {
    if (!isNewInstance) {
      throw new ForbiddenError('You can not modify invintation');
    }

    const { teamId, email } = instance;

    const invintation = await this.model.findOne({
      where: {
        teamId,
        email,
      },
    });

    if (invintation) {
      throw new BadRequestError('The invintation for this user has already sent');
    }
  }

  async afterCreate({ instance }) {
    const team = await this.Team.findById(instance.teamId);
    const user = await this.User.findById(instance.userId);

    const options = {
      type: instance.type,
      teamName: team.name,
      fromName: user.name,
      fromEmail: user.email,
      joinUrl: `${invite_user}/${instance.id}`,
    };

    this.Email.sendJoinRequest(instance.email, options);
  }
}

module.exports = Invintation;
