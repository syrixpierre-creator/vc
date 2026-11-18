/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_urldecode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_urldecode.js",
  family: "B",
  command: "newurldecode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newurldecode",
  aliases: [],
  category: "restored",
  description: "Restored: new_urldecode",
  usage: ".newurldecode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
