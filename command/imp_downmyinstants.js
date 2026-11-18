/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-myinstants.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-myinstants.js",
  family: "B",
  command: "downmyinstants",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downmyinstants",
  aliases: [],
  category: "restored",
  description: "Restored: down-myinstants",
  usage: ".downmyinstants",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
