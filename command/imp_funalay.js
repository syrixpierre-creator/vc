/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-alay.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-alay.js",
  family: "A",
  command: "funalay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funalay",
  aliases: [],
  category: "restored",
  description: "Restored: fun-alay",
  usage: ".funalay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
