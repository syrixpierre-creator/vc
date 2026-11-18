/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for env-list.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "env-list.js",
  family: "B",
  command: "envlist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "envlist",
  aliases: [],
  category: "restored",
  description: "Restored: env-list",
  usage: ".envlist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
