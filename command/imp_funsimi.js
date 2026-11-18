/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-simi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-simi.js",
  family: "A",
  command: "funsimi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funsimi",
  aliases: [],
  category: "restored",
  description: "Restored: fun-simi",
  usage: ".funsimi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
