/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-paptt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-paptt.js",
  family: "B",
  command: "nsfwpaptt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwpaptt",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-paptt",
  usage: ".nsfwpaptt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
