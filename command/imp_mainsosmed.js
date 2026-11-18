/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-sosmed.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-sosmed.js",
  family: "B",
  command: "mainsosmed",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mainsosmed",
  aliases: [],
  category: "restored",
  description: "Restored: main-sosmed",
  usage: ".mainsosmed",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
