/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-tagall.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-tagall.js",
  family: "B",
  command: "grouptagall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouptagall",
  aliases: [],
  category: "restored",
  description: "Restored: group-tagall",
  usage: ".grouptagall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
