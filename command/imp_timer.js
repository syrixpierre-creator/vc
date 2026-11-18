/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for timer.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "timer.js",
  family: "B",
  command: "timer",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "timer",
  aliases: [],
  category: "restored",
  description: "Restored: timer",
  usage: ".timer",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
