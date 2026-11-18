/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pull.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pull.js",
  family: "A",
  command: "pull",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pull",
  aliases: [],
  category: "restored",
  description: "Restored: pull",
  usage: ".pull",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
