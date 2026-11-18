/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-opentime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-opentime.js",
  family: "A",
  command: "groupopentime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupopentime",
  aliases: [],
  category: "restored",
  description: "Restored: group-opentime",
  usage: ".groupopentime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
