/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for jadwalsholat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "jadwalsholat.js",
  family: "A",
  command: "xjadwalsholat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xjadwalsholat",
  aliases: [],
  category: "restored",
  description: "Restored: jadwalsholat",
  usage: ".xjadwalsholat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
