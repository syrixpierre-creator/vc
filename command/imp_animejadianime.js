/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-jadianime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-jadianime.js",
  family: "A",
  command: "animejadianime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animejadianime",
  aliases: [],
  category: "restored",
  description: "Restored: anime-jadianime",
  usage: ".animejadianime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
