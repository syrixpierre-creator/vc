/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-unipin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-unipin.js",
  family: "A",
  command: "groupunipin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupunipin",
  aliases: [],
  category: "restored",
  description: "Restored: group-unipin",
  usage: ".groupunipin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
