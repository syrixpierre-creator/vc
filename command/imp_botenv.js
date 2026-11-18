/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bot-env.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bot-env.js",
  family: "B",
  command: "botenv",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "botenv",
  aliases: [],
  category: "restored",
  description: "Restored: bot-env",
  usage: ".botenv",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
