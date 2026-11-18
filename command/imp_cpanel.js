/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cpanel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cpanel.js",
  family: "B",
  command: "cpanel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cpanel",
  aliases: [],
  category: "restored",
  description: "Restored: cpanel",
  usage: ".cpanel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
