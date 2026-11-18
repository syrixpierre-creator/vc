/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nulis.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nulis.js",
  family: "B",
  command: "nulis",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nulis",
  aliases: [],
  category: "restored",
  description: "Restored: nulis",
  usage: ".nulis",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
