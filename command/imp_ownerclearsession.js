/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-clearsession.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-clearsession.js",
  family: "B",
  command: "ownerclearsession",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerclearsession",
  aliases: [],
  category: "restored",
  description: "Restored: owner-clearsession",
  usage: ".ownerclearsession",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
