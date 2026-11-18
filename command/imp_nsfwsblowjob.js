/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-sblowjob.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-sblowjob.js",
  family: "B",
  command: "nsfwsblowjob",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwsblowjob",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-sblowjob",
  usage: ".nsfwsblowjob",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
