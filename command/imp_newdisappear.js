/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_disappear.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_disappear.js",
  family: "B",
  command: "newdisappear",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdisappear",
  aliases: [],
  category: "restored",
  description: "Restored: new_disappear",
  usage: ".newdisappear",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
