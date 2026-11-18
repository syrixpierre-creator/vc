/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_purple.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_purple.js",
  family: "A",
  command: "newpurple",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newpurple",
  aliases: [],
  category: "restored",
  description: "Restored: new_purple",
  usage: ".newpurple",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
