/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antilink2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antilink2.js",
  family: "B",
  command: "antilink2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antilink2",
  aliases: [],
  category: "restored",
  description: "Restored: antilink2",
  usage: ".antilink2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
