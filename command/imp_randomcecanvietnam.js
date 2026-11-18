/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-cecanvietnam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-cecanvietnam.js",
  family: "A",
  command: "randomcecanvietnam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomcecanvietnam",
  aliases: [],
  category: "restored",
  description: "Restored: random-cecanvietnam",
  usage: ".randomcecanvietnam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
