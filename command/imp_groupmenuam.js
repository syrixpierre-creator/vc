/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Group-menuam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Group-menuam.js",
  family: "B",
  command: "groupmenuam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupmenuam",
  aliases: [],
  category: "restored",
  description: "Restored: Group-menuam",
  usage: ".groupmenuam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
