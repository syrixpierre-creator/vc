/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-Tafsir.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-Tafsir.js",
  family: "A",
  command: "internettafsir",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internettafsir",
  aliases: [],
  category: "restored",
  description: "Restored: internet-Tafsir",
  usage: ".internettafsir",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
