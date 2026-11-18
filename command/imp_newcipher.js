/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_cipher.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_cipher.js",
  family: "B",
  command: "newcipher",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newcipher",
  aliases: [],
  category: "restored",
  description: "Restored: new_cipher",
  usage: ".newcipher",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
