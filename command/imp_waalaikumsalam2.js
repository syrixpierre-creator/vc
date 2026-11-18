/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for waalaikumsalam2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "waalaikumsalam2.js",
  family: "B",
  command: "waalaikumsalam2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "waalaikumsalam2",
  aliases: [],
  category: "restored",
  description: "Restored: waalaikumsalam2",
  usage: ".waalaikumsalam2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
