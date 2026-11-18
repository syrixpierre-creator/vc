/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-beritabola.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-beritabola.js",
  family: "A",
  command: "internetberitabola",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetberitabola",
  aliases: [],
  category: "restored",
  description: "Restored: internet-beritabola",
  usage: ".internetberitabola",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
