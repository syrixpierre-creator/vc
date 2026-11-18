/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_impressive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_impressive.js",
  family: "A",
  command: "newimpressive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newimpressive",
  aliases: [],
  category: "restored",
  description: "Restored: new_impressive",
  usage: ".newimpressive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
