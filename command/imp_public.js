/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for public.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "public.js",
  family: "B",
  command: "public",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "public",
  aliases: [],
  category: "restored",
  description: "Restored: public",
  usage: ".public",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
