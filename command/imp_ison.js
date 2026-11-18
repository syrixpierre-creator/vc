/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ison.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ison.js",
  family: "B",
  command: "ison",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ison",
  aliases: [],
  category: "restored",
  description: "Restored: ison",
  usage: ".ison",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
