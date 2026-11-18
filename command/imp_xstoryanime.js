/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for story-anime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "story-anime.js",
  family: "B",
  command: "xstoryanime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xstoryanime",
  aliases: [],
  category: "restored",
  description: "Restored: story-anime",
  usage: ".xstoryanime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
