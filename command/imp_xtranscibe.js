/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for transcibe.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "transcibe.js",
  family: "A",
  command: "xtranscibe",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtranscibe",
  aliases: [],
  category: "restored",
  description: "Restored: transcibe",
  usage: ".xtranscibe",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
