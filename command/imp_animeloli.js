/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-loli.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-loli.js",
  family: "A",
  command: "animeloli",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animeloli",
  aliases: [],
  category: "restored",
  description: "Restored: anime-loli",
  usage: ".animeloli",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
