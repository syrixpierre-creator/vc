/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_setgroupdp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_setgroupdp.js",
  family: "B",
  command: "newsetgroupdp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsetgroupdp",
  aliases: [],
  category: "restored",
  description: "Restored: new_setgroupdp",
  usage: ".newsetgroupdp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
