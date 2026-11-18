/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for unmute.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "unmute.js",
  family: "A",
  command: 'unmutealt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "unmute",
  aliases: [],
  category: "restored",
  description: "Restored: unmute",
  usage: ".unmute",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
