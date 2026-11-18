/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-tagsw.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-tagsw.js",
  family: "B",
  command: "ownertagsw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownertagsw",
  aliases: [],
  category: "restored",
  description: "Restored: owner-tagsw",
  usage: ".ownertagsw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
