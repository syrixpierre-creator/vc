/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gc-promote.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gc-promote.js",
  family: "B",
  command: "gcpromote",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcpromote",
  aliases: [],
  category: "restored",
  description: "Restored: gc-promote",
  usage: ".gcpromote",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
