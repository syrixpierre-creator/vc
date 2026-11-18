/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-ngasal.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-ngasal.js",
  family: "A",
  command: "quotesngasal",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotesngasal",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-ngasal",
  usage: ".quotesngasal",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
