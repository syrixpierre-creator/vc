/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for echo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "echo.js",
  family: "A",
  command: "echo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "echo",
  aliases: [],
  category: "restored",
  description: "Restored: echo",
  usage: ".echo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
