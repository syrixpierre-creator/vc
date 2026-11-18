/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-threads.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-threads.js",
  family: "B",
  command: "downthreads",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downthreads",
  aliases: [],
  category: "restored",
  description: "Restored: down-threads",
  usage: ".downthreads",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
