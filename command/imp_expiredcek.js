/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for expired-cek.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "expired-cek.js",
  family: "A",
  command: "expiredcek",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "expiredcek",
  aliases: [],
  category: "restored",
  description: "Restored: expired-cek",
  usage: ".expiredcek",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
