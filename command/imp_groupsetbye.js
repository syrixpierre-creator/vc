/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-setbye.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-setbye.js",
  family: "B",
  command: "groupsetbye",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupsetbye",
  aliases: [],
  category: "restored",
  description: "Restored: group-setbye",
  usage: ".groupsetbye",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
