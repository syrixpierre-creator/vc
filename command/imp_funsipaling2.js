/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-sipaling2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-sipaling2.js",
  family: "A",
  command: "funsipaling2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funsipaling2",
  aliases: [],
  category: "restored",
  description: "Restored: fun-sipaling2",
  usage: ".funsipaling2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
