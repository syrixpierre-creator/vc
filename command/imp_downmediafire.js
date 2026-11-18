/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-mediafire.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-mediafire.js",
  family: "B",
  command: "downmediafire",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downmediafire",
  aliases: [],
  category: "restored",
  description: "Restored: down-mediafire",
  usage: ".downmediafire",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
