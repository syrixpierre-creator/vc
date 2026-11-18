/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw.js",
  family: "B",
  command: "xnsfw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xnsfw",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw",
  usage: ".xnsfw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
