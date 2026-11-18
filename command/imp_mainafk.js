/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-afk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-afk.js",
  family: "B",
  command: "mainafk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mainafk",
  aliases: [],
  category: "restored",
  description: "Restored: main-afk",
  usage: ".mainafk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
