/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-manage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-manage.js",
  family: "A",
  command: "groupmanage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupmanage",
  aliases: [],
  category: "restored",
  description: "Restored: group-manage",
  usage: ".groupmanage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
