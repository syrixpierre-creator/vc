/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_mistral.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_mistral.js",
  family: "A",
  command: "newmistral",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newmistral",
  aliases: [],
  category: "restored",
  description: "Restored: new_mistral",
  usage: ".newmistral",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
