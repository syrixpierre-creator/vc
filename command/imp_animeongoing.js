/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-ongoing.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-ongoing.js",
  family: "B",
  command: "animeongoing",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animeongoing",
  aliases: [],
  category: "restored",
  description: "Restored: anime-ongoing",
  usage: ".animeongoing",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
