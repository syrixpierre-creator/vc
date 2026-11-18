/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-loli2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-loli2.js",
  family: "A",
  command: "animeloli2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animeloli2",
  aliases: [],
  category: "restored",
  description: "Restored: anime-loli2",
  usage: ".animeloli2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
