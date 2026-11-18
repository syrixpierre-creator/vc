/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_antispam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_antispam.js",
  family: "B",
  command: "newantispam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newantispam",
  aliases: [],
  category: "restored",
  description: "Restored: new_antispam",
  usage: ".newantispam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
