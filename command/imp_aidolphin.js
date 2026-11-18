/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-dolphin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-dolphin.js",
  family: "A",
  command: "aidolphin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aidolphin",
  aliases: [],
  category: "restored",
  description: "Restored: ai-dolphin",
  usage: ".aidolphin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
