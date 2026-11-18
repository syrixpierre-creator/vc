/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for komik.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "komik.js",
  family: "B",
  command: "komik",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "komik",
  aliases: [],
  category: "restored",
  description: "Restored: komik",
  usage: ".komik",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
