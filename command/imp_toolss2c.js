/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-s2c.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-s2c.js",
  family: "A",
  command: "toolss2c",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolss2c",
  aliases: [],
  category: "restored",
  description: "Restored: tools-s2c",
  usage: ".toolss2c",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
