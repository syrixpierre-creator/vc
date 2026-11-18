/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_metallic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_metallic.js",
  family: "A",
  command: "newmetallic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newmetallic",
  aliases: [],
  category: "restored",
  description: "Restored: new_metallic",
  usage: ".newmetallic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
