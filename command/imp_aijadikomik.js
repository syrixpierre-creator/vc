/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-jadikomik.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-jadikomik.js",
  family: "A",
  command: "aijadikomik",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aijadikomik",
  aliases: [],
  category: "restored",
  description: "Restored: ai-jadikomik",
  usage: ".aijadikomik",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
