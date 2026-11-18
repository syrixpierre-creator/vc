/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-tagsw.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-tagsw.js",
  family: "A",
  command: "grouptagsw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouptagsw",
  aliases: [],
  category: "restored",
  description: "Restored: group-tagsw",
  usage: ".grouptagsw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
