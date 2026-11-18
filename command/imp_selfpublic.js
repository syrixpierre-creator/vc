/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for self-public.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "self-public.js",
  family: "B",
  command: "selfpublic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "selfpublic",
  aliases: [],
  category: "restored",
  description: "Restored: self-public",
  usage: ".selfpublic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
