/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-alive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-alive.js",
  family: "B",
  command: "mainalive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mainalive",
  aliases: [],
  category: "restored",
  description: "Restored: main-alive",
  usage: ".mainalive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
