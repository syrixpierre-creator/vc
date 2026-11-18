/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-threads.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-threads.js",
  family: "B",
  command: "dlthreads",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlthreads",
  aliases: [],
  category: "restored",
  description: "Restored: dl-threads",
  usage: ".dlthreads",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
