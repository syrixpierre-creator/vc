/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-surah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-surah.js",
  family: "B",
  command: "internetsurah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetsurah",
  aliases: [],
  category: "restored",
  description: "Restored: internet-surah",
  usage: ".internetsurah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
