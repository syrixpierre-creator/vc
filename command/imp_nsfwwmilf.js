/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-wmilf.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-wmilf.js",
  family: "B",
  command: "nsfwwmilf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwwmilf",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-wmilf",
  usage: ".nsfwwmilf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
