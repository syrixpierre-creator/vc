/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-wfauzuri.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-wfauzuri.js",
  family: "B",
  command: "nsfwwfauzuri",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwwfauzuri",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-wfauzuri",
  usage: ".nsfwwfauzuri",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
