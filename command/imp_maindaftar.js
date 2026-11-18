/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-daftar.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-daftar.js",
  family: "B",
  command: "maindaftar",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "maindaftar",
  aliases: [],
  category: "restored",
  description: "Restored: main-daftar",
  usage: ".maindaftar",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
