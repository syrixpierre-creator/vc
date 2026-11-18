/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-gombal.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-gombal.js",
  family: "A",
  command: "quotesgombal",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotesgombal",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-gombal",
  usage: ".quotesgombal",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
