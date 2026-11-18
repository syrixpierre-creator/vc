/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-diamakah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-diamakah.js",
  family: "A",
  command: "fundiamakah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fundiamakah",
  aliases: [],
  category: "restored",
  description: "Restored: fun-diamakah",
  usage: ".fundiamakah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
