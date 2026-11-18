/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_crun.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_crun.js",
  family: "B",
  command: "newcrun",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newcrun",
  aliases: [],
  category: "restored",
  description: "Restored: new_crun",
  usage: ".newcrun",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
