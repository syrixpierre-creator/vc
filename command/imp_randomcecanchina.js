/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-cecanchina.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-cecanchina.js",
  family: "A",
  command: "randomcecanchina",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomcecanchina",
  aliases: [],
  category: "restored",
  description: "Restored: random-cecanchina",
  usage: ".randomcecanchina",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
