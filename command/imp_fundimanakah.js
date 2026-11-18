/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-dimanakah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-dimanakah.js",
  family: "B",
  command: "fundimanakah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fundimanakah",
  aliases: [],
  category: "restored",
  description: "Restored: fun-dimanakah",
  usage: ".fundimanakah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
