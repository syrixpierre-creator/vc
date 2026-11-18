/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sharechat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sharechat.js",
  family: "A",
  command: "sharechat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "sharechat",
  aliases: [],
  category: "restored",
  description: "Restored: sharechat",
  usage: ".sharechat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
