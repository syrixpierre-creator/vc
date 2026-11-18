/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-img.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-img.js",
  family: "B",
  command: "dlimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlimg",
  aliases: [],
  category: "restored",
  description: "Restored: dl-img",
  usage: ".dlimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
