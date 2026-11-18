/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw2.js",
  family: "B",
  command: "nsfw2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfw2",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw2",
  usage: ".nsfw2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
