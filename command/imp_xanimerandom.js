/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-random.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-random.js",
  family: "A",
  command: "xanimerandom",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xanimerandom",
  aliases: [],
  category: "restored",
  description: "Restored: anime-random",
  usage: ".xanimerandom",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
