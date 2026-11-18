/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antiNewsletter.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antiNewsletter.js",
  family: "B",
  command: "xantinewsletter",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantinewsletter",
  aliases: [],
  category: "restored",
  description: "Restored: antiNewsletter",
  usage: ".xantinewsletter",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
