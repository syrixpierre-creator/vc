/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-sider.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-sider.js",
  family: "B",
  command: "groupsider",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupsider",
  aliases: [],
  category: "restored",
  description: "Restored: group-sider",
  usage: ".groupsider",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
