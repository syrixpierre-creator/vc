/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for opentime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "opentime.js",
  family: "A",
  command: "xopentime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xopentime",
  aliases: [],
  category: "restored",
  description: "Restored: opentime",
  usage: ".xopentime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
