/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-wecchi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-wecchi.js",
  family: "B",
  command: "nsfwwecchi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwwecchi",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-wecchi",
  usage: ".nsfwwecchi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
