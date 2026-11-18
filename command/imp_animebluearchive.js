/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-bluearchive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-bluearchive.js",
  family: "A",
  command: "animebluearchive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animebluearchive",
  aliases: [],
  category: "restored",
  description: "Restored: anime-bluearchive",
  usage: ".animebluearchive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
