/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tes123.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tes123.js",
  family: "B",
  command: "tes123",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tes123",
  aliases: [],
  category: "restored",
  description: "Restored: tes123",
  usage: ".tes123",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
