/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_distance.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_distance.js",
  family: "B",
  command: "newdistance",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdistance",
  aliases: [],
  category: "restored",
  description: "Restored: new_distance",
  usage: ".newdistance",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
