/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-t2v.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-t2v.js",
  family: "A",
  command: "ait2v",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ait2v",
  aliases: [],
  category: "restored",
  description: "Restored: ai-t2v",
  usage: ".ait2v",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
