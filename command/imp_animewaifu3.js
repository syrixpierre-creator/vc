/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-waifu3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-waifu3.js",
  family: "A",
  command: "animewaifu3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animewaifu3",
  aliases: [],
  category: "restored",
  description: "Restored: anime-waifu3",
  usage: ".animewaifu3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
