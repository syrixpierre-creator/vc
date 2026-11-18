/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anilist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anilist.js",
  family: "B",
  command: "xanilist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xanilist",
  aliases: [],
  category: "restored",
  description: "Restored: anilist",
  usage: ".xanilist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
