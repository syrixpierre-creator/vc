/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-setcostum.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-setcostum.js",
  family: "A",
  command: "groupsetcostum",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupsetcostum",
  aliases: [],
  category: "restored",
  description: "Restored: group-setcostum",
  usage: ".groupsetcostum",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
