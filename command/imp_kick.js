/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for kick.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "kick.js",
  family: "A",
  command: 'kickx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "kickalt",
  aliases: [],
  category: "restored",
  description: "Restored: kick",
  usage: ".kick",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
