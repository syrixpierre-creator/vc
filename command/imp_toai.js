/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for toai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "toai.js",
  family: "A",
  command: "toai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toai",
  aliases: [],
  category: "restored",
  description: "Restored: toai",
  usage: ".toai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
