/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for schedulelist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "schedulelist.js",
  family: "B",
  command: "schedulelist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "schedulelist",
  aliases: [],
  category: "restored",
  description: "Restored: schedulelist",
  usage: ".schedulelist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
