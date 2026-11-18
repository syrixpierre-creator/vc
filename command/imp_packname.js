/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for packname.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "packname.js",
  family: "B",
  command: "packname",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "packname",
  aliases: [],
  category: "restored",
  description: "Restored: packname",
  usage: ".packname",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
