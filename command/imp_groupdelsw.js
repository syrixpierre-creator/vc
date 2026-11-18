/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-delsw.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-delsw.js",
  family: "A",
  command: "groupdelsw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupdelsw",
  aliases: [],
  category: "restored",
  description: "Restored: group-delsw",
  usage: ".groupdelsw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
