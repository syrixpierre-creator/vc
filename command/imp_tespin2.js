/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tes-pin2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tes-pin2.js",
  family: "B",
  command: "tespin2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tespin2",
  aliases: [],
  category: "restored",
  description: "Restored: tes-pin2",
  usage: ".tespin2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
