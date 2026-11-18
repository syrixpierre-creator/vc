/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _antitoxic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_antitoxic.js",
  family: "B",
  command: "xantitoxic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantitoxic",
  aliases: [],
  category: "restored",
  description: "Restored: _antitoxic",
  usage: ".xantitoxic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
