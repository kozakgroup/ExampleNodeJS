'use strict';

async function beforeGetTeamDependsList({ args, req }) {
  const linkList = await this.Link.find({ where: { userId: req.accessToken.userId }});

  args.filter = {
    where: {
      or: linkList.map(({ teamId }) => ({ teamId })),
    },
  };
}

class Base {
  constructor(model) {
    this.model = model;
    Object.defineProperty(this.constructor, 'Instance', {
      writable: false,
      value: this,
    });
  }

  get Link() {
    return this.model.app.models.link;
  }

  get User() {
    return this.model.app.models.user;
  }

  get Invintation() {
    return this.model.app.models.invintation;
  }

  get Hatchling() {
    return this.model.app.models.hatchling;
  }

  get Nest() {
    return this.model.app.models.nest;
  }

  get Chirp() {
    return this.model.app.models.chirp;
  }

  get Pishing() {
    return this.model.app.models.pishing;
  }

  get Email() {
    return this.model.app.email;
  }

  get Team() {
    return this.model.app.models.team;
  }

  get UserSettings() {
    return this.model.app.models.userSettings;
  }

  get AccessToken() {
    return this.model.app.models.accessToken;
  }

  get RefreshToken() {
    return this.model.app.models.refreshToken;
  }

  disableMethods() {
    this.disabledMethods.forEach((method) =>
            this.model.disableRemoteMethodByName(method));
  }

  getContextMethod(method) {
    return this[method].bind(this);
  }

  getRemoteMethodDefinition(method) {
    return this.remoteMethods[method];
  }
}

module.exports = {
  Base,
  beforeGetTeamDependsList,
};
