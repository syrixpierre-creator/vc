/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-ttmusic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-ttmusic.js",
  family: "B",
  command: "downttmusic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downttmusic",
  aliases: [],
  category: "restored",
  description: "Restored: down-ttmusic",
  usage: ".downttmusic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
