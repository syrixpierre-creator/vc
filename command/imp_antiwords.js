/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antiwords.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antiwords.js",
  family: "B",
  command: "antiwords",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antiwords",
  aliases: [],
  category: "restored",
  description: "Restored: antiwords",
  usage: ".antiwords",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
