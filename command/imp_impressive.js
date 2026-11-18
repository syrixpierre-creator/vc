/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for impressive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "impressive.js",
  family: "B",
  command: "impressive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "impressive",
  aliases: [],
  category: "restored",
  description: "Restored: impressive",
  usage: ".impressive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
