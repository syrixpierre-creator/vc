/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-togif.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-togif.js",
  family: "B",
  command: "toolstogif",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolstogif",
  aliases: [],
  category: "restored",
  description: "Restored: tools-togif",
  usage: ".toolstogif",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
