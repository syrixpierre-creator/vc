/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-antilink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-antilink.js",
  family: "B",
  command: "groupantilink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupantilink",
  aliases: [],
  category: "restored",
  description: "Restored: group-antilink",
  usage: ".groupantilink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
