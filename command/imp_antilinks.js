/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antilinks.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antilinks.js",
  family: "B",
  command: "antilinks",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antilinks",
  aliases: [],
  category: "restored",
  description: "Restored: antilinks",
  usage: ".antilinks",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
