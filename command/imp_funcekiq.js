/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-cekiq.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-cekiq.js",
  family: "B",
  command: "funcekiq",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funcekiq",
  aliases: [],
  category: "restored",
  description: "Restored: fun-cekiq",
  usage: ".funcekiq",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
