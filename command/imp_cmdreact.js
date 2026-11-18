/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cmdreact.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cmdreact.js",
  family: "A",
  command: "cmdreact",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cmdreact",
  aliases: [],
  category: "restored",
  description: "Restored: cmdreact",
  usage: ".cmdreact",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
