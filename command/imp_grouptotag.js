/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-totag.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-totag.js",
  family: "A",
  command: "grouptotag",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouptotag",
  aliases: [],
  category: "restored",
  description: "Restored: group-totag",
  usage: ".grouptotag",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
