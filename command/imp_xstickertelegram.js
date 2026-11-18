/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stickertelegram.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stickertelegram.js",
  family: "A",
  command: "xstickertelegram",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xstickertelegram",
  aliases: [],
  category: "restored",
  description: "Restored: stickertelegram",
  usage: ".xstickertelegram",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
