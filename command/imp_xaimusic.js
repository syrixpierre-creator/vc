/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for aimusic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "aimusic.js",
  family: "B",
  command: "xaimusic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xaimusic",
  aliases: [],
  category: "restored",
  description: "Restored: aimusic",
  usage: ".xaimusic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
