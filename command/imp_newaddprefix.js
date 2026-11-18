/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_addprefix.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_addprefix.js",
  family: "A",
  command: "newaddprefix",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newaddprefix",
  aliases: [],
  category: "restored",
  description: "Restored: new_addprefix",
  usage: ".newaddprefix",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
