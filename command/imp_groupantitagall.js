/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-antitagall.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-antitagall.js",
  family: "B",
  command: "groupantitagall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupantitagall",
  aliases: [],
  category: "restored",
  description: "Restored: group-antitagall",
  usage: ".groupantitagall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
