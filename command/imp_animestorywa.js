/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-storywa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-storywa.js",
  family: "B",
  command: "animestorywa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animestorywa",
  aliases: [],
  category: "restored",
  description: "Restored: anime-storywa",
  usage: ".animestorywa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
