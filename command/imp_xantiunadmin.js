/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anti-unadmin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anti-unadmin.js",
  family: "B",
  command: "xantiunadmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantiunadmin",
  aliases: [],
  category: "restored",
  description: "Restored: anti-unadmin",
  usage: ".xantiunadmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
