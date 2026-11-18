/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pm2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pm2.js",
  family: "B",
  command: "pm2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pm2",
  aliases: [],
  category: "restored",
  description: "Restored: pm2",
  usage: ".pm2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
