/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for botname.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "botname.js",
  family: "B",
  command: "botname",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "botname",
  aliases: [],
  category: "restored",
  description: "Restored: botname",
  usage: ".botname",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
