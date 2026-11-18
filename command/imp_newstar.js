/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_star.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_star.js",
  family: "A",
  command: "newstar",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newstar",
  aliases: [],
  category: "restored",
  description: "Restored: new_star",
  usage: ".newstar",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
