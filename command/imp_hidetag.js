/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for hidetag.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "hidetag.js",
  family: "A",
  command: 'hidetagx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "hidetagalt",
  aliases: [],
  category: "restored",
  description: "Restored: hidetag",
  usage: ".hidetag",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
