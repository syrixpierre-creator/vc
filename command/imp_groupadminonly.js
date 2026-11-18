/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-adminonly.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-adminonly.js",
  family: "B",
  command: "groupadminonly",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupadminonly",
  aliases: [],
  category: "restored",
  description: "Restored: group-adminonly",
  usage: ".groupadminonly",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
