/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _antispam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_antispam.js",
  family: "B",
  command: "xantispam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantispam",
  aliases: [],
  category: "restored",
  description: "Restored: _antispam",
  usage: ".xantispam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
