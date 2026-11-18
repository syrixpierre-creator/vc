/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-angka.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-angka.js",
  family: "A",
  command: "funangka",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funangka",
  aliases: [],
  category: "restored",
  description: "Restored: fun-angka",
  usage: ".funangka",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
