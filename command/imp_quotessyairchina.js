/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-syairchina.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-syairchina.js",
  family: "A",
  command: "quotessyairchina",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotessyairchina",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-syairchina",
  usage: ".quotessyairchina",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
