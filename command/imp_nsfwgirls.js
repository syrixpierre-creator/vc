/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-girls.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-girls.js",
  family: "B",
  command: "nsfwgirls",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwgirls",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-girls",
  usage: ".nsfwgirls",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
