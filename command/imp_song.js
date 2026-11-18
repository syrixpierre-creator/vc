/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for song.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "song.js",
  family: "A",
  command: 'songx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "songalt",
  aliases: [],
  category: "restored",
  description: "Restored: song",
  usage: ".song",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
