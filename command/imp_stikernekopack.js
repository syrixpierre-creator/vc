/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stiker-nekopack.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stiker-nekopack.js",
  family: "A",
  command: "stikernekopack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stikernekopack",
  aliases: [],
  category: "restored",
  description: "Restored: stiker-nekopack",
  usage: ".stikernekopack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
