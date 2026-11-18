/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-whatmusic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-whatmusic.js",
  family: "A",
  command: "toolswhatmusic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolswhatmusic",
  aliases: [],
  category: "restored",
  description: "Restored: tools-whatmusic",
  usage: ".toolswhatmusic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
