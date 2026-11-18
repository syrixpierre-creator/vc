/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gc-demote.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gc-demote.js",
  family: "B",
  command: "gcdemote",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcdemote",
  aliases: [],
  category: "restored",
  description: "Restored: gc-demote",
  usage: ".gcdemote",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
