/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-cecankorea.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-cecankorea.js",
  family: "A",
  command: "randomcecankorea",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomcecankorea",
  aliases: [],
  category: "restored",
  description: "Restored: random-cecankorea",
  usage: ".randomcecankorea",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
