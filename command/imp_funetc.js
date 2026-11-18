/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-etc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-etc.js",
  family: "B",
  command: "funetc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funetc",
  aliases: [],
  category: "restored",
  description: "Restored: fun-etc",
  usage: ".funetc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
