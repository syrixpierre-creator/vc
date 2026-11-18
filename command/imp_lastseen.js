/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for lastseen.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "lastseen.js",
  family: "B",
  command: "lastseen",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "lastseen",
  aliases: [],
  category: "restored",
  description: "Restored: lastseen",
  usage: ".lastseen",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
