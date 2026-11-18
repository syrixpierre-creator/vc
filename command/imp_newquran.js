/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_quran.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_quran.js",
  family: "B",
  command: "newquran",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newquran",
  aliases: [],
  category: "restored",
  description: "Restored: new_quran",
  usage: ".newquran",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
