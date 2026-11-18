/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-kick.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-kick.js",
  family: "B",
  command: "groupkick",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupkick",
  aliases: [],
  category: "restored",
  description: "Restored: group-kick",
  usage: ".groupkick",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
