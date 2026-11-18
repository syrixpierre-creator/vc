/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for set-identity.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "set-identity.js",
  family: "B",
  command: "setidentity",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setidentity",
  aliases: [],
  category: "restored",
  description: "Restored: set-identity",
  usage: ".setidentity",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
