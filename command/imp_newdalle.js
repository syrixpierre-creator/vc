/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_dalle.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_dalle.js",
  family: "A",
  command: "newdalle",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdalle",
  aliases: [],
  category: "restored",
  description: "Restored: new_dalle",
  usage: ".newdalle",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
