/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for techImg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "techImg.js",
  family: "A",
  command: "techimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "techimg",
  aliases: [],
  category: "restored",
  description: "Restored: techImg",
  usage: ".techimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
