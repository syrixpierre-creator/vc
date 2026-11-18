/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-aio.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-aio.js",
  family: "B",
  command: "downaio",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downaio",
  aliases: [],
  category: "restored",
  description: "Restored: down-aio",
  usage: ".downaio",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
