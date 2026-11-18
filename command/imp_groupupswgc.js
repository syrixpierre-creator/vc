/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-upswgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-upswgc.js",
  family: "B",
  command: "groupupswgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupupswgc",
  aliases: [],
  category: "restored",
  description: "Restored: group-upswgc",
  usage: ".groupupswgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
