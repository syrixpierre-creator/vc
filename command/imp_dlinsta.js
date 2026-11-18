/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-insta.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-insta.js",
  family: "B",
  command: "dlinsta",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlinsta",
  aliases: [],
  category: "restored",
  description: "Restored: dl-insta",
  usage: ".dlinsta",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
