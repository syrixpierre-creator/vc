/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-antiunadmin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-antiunadmin.js",
  family: "B",
  command: "groupantiunadmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupantiunadmin",
  aliases: [],
  category: "restored",
  description: "Restored: group-antiunadmin",
  usage: ".groupantiunadmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
