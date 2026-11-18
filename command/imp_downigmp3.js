/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-igmp3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-igmp3.js",
  family: "B",
  command: "downigmp3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downigmp3",
  aliases: [],
  category: "restored",
  description: "Restored: down-igmp3",
  usage: ".downigmp3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
