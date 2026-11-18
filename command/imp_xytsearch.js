/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ytsearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ytsearch.js",
  family: "A",
  command: "xytsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xytsearch",
  aliases: [],
  category: "restored",
  description: "Restored: ytsearch",
  usage: ".xytsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
