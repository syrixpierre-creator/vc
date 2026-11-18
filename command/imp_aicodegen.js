/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-codegen.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-codegen.js",
  family: "B",
  command: "aicodegen",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aicodegen",
  aliases: [],
  category: "restored",
  description: "Restored: ai-codegen",
  usage: ".aicodegen",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
