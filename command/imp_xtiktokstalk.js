/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tiktokstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tiktokstalk.js",
  family: "B",
  command: "xtiktokstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtiktokstalk",
  aliases: [],
  category: "restored",
  description: "Restored: tiktokstalk",
  usage: ".xtiktokstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
