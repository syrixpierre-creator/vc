/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-pilih.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-pilih.js",
  family: "A",
  command: "funpilih",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funpilih",
  aliases: [],
  category: "restored",
  description: "Restored: fun-pilih",
  usage: ".funpilih",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
