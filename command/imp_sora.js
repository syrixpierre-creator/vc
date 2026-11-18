/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sora.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sora.js",
  family: "A",
  command: "sora",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "sora",
  aliases: [],
  category: "restored",
  description: "Restored: sora",
  usage: ".sora",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
