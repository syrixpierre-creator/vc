/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-clearead.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-clearead.js",
  family: "B",
  command: "ownerclearead",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerclearead",
  aliases: [],
  category: "restored",
  description: "Restored: owner-clearead",
  usage: ".ownerclearead",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
