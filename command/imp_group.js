/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group.js",
  family: "B",
  command: "group",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "group",
  aliases: [],
  category: "restored",
  description: "Restored: group",
  usage: ".group",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
