/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antimention.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antimention.js",
  family: "B",
  command: "xantimention",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantimention",
  aliases: [],
  category: "restored",
  description: "Restored: antimention",
  usage: ".xantimention",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
