/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gc-test.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gc-test.js",
  family: "B",
  command: "gctest",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gctest",
  aliases: [],
  category: "restored",
  description: "Restored: gc-test",
  usage: ".gctest",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
