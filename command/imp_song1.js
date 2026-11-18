/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for song1.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "song1.js",
  family: "B",
  command: "song1",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "song1",
  aliases: [],
  category: "restored",
  description: "Restored: song1",
  usage: ".song1",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
