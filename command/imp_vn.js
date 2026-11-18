/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for vn.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "vn.js",
  family: "B",
  command: "vn",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "vn",
  aliases: [],
  category: "restored",
  description: "Restored: vn",
  usage: ".vn",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
