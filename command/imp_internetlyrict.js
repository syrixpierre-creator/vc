/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-lyrict.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-lyrict.js",
  family: "A",
  command: "internetlyrict",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetlyrict",
  aliases: [],
  category: "restored",
  description: "Restored: internet-lyrict",
  usage: ".internetlyrict",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
