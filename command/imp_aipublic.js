/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-public.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-public.js",
  family: "A",
  command: "aipublic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aipublic",
  aliases: [],
  category: "restored",
  description: "Restored: ai-public",
  usage: ".aipublic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
