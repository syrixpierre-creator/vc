/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-setppgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-setppgc.js",
  family: "B",
  command: "groupsetppgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupsetppgc",
  aliases: [],
  category: "restored",
  description: "Restored: group-setppgc",
  usage: ".groupsetppgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
