/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakeml.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakeml.js",
  family: "A",
  command: "makerfakeml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakeml",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakeml",
  usage: ".makerfakeml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
