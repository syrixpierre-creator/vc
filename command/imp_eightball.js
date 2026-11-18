/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for eightball.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "eightball.js",
  family: "A",
  command: "eightball",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "eightball",
  aliases: [],
  category: "restored",
  description: "Restored: eightball",
  usage: ".eightball",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
