/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for demote.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "demote.js",
  family: "A",
  command: 'demotex',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "demotealt",
  aliases: [],
  category: "restored",
  description: "Restored: demote",
  usage: ".demote",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
