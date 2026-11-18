/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for linkgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "linkgc.js",
  family: "A",
  command: "xlinkgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xlinkgc",
  aliases: [],
  category: "restored",
  description: "Restored: linkgc",
  usage: ".xlinkgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
