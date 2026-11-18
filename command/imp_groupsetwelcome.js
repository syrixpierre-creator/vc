/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-setwelcome.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-setwelcome.js",
  family: "B",
  command: "groupsetwelcome",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupsetwelcome",
  aliases: [],
  category: "restored",
  description: "Restored: group-setwelcome",
  usage: ".groupsetwelcome",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
