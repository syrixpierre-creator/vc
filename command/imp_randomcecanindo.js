/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-cecanindo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-cecanindo.js",
  family: "A",
  command: "randomcecanindo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomcecanindo",
  aliases: [],
  category: "restored",
  description: "Restored: random-cecanindo",
  usage: ".randomcecanindo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
