/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for acreact.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "acreact.js",
  family: "B",
  command: "acreact",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "acreact",
  aliases: [],
  category: "restored",
  description: "Restored: acreact",
  usage: ".acreact",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
