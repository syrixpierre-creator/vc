/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for afk-afk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "afk-afk.js",
  family: "B",
  command: "xafkafk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xafkafk",
  aliases: [],
  category: "restored",
  description: "Restored: afk-afk",
  usage: ".xafkafk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
