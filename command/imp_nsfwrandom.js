/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-random.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-random.js",
  family: "B",
  command: "nsfwrandom",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwrandom",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-random",
  usage: ".nsfwrandom",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
