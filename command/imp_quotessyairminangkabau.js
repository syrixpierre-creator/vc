/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-syairminangkabau.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-syairminangkabau.js",
  family: "A",
  command: "quotessyairminangkabau",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotessyairminangkabau",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-syairminangkabau",
  usage: ".quotessyairminangkabau",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
