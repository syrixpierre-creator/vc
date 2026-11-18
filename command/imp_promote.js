/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for promote.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "promote.js",
  family: "A",
  command: 'promotex',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "promotealt",
  aliases: [],
  category: "restored",
  description: "Restored: promote",
  usage: ".promote",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
