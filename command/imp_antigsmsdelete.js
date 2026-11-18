/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antigsmsdelete.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antigsmsdelete.js",
  family: "B",
  command: "antigsmsdelete",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antigsmsdelete",
  aliases: [],
  category: "restored",
  description: "Restored: antigsmsdelete",
  usage: ".antigsmsdelete",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
