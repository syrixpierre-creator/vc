/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-catbox.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-catbox.js",
  family: "B",
  command: "ucatbox",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ucatbox",
  aliases: [],
  category: "restored",
  description: "Restored: u-catbox",
  usage: ".ucatbox",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
