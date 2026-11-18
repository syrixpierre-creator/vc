/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for play.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "play.js",
  family: "A",
  command: 'playx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "playalt",
  aliases: [],
  category: "restored",
  description: "Restored: play",
  usage: ".play",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
