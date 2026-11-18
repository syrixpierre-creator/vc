/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for truthdare.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "truthdare.js",
  family: "A",
  command: "truthdare",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "truthdare",
  aliases: [],
  category: "restored",
  description: "Restored: truthdare",
  usage: ".truthdare",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
