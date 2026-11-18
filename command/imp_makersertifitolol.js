/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-sertifitolol.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-sertifitolol.js",
  family: "A",
  command: "makersertifitolol",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makersertifitolol",
  aliases: [],
  category: "restored",
  description: "Restored: maker-sertifitolol",
  usage: ".makersertifitolol",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
