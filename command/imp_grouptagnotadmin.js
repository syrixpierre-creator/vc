/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-tagnotadmin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-tagnotadmin.js",
  family: "B",
  command: "grouptagnotadmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouptagnotadmin",
  aliases: [],
  category: "restored",
  description: "Restored: group-tagnotadmin",
  usage: ".grouptagnotadmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
