/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for animequotes.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "animequotes.js",
  family: "A",
  command: "xanimequotes",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xanimequotes",
  aliases: [],
  category: "restored",
  description: "Restored: animequotes",
  usage: ".xanimequotes",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
