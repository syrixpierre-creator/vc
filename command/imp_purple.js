/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for purple.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "purple.js",
  family: "B",
  command: "purple",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "purple",
  aliases: [],
  category: "restored",
  description: "Restored: purple",
  usage: ".purple",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
