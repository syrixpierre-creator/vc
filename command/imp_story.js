/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for story.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "story.js",
  family: "B",
  command: "story",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "story",
  aliases: [],
  category: "restored",
  description: "Restored: story",
  usage: ".story",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
