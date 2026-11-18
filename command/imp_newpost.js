/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_post.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_post.js",
  family: "A",
  command: "newpost",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newpost",
  aliases: [],
  category: "restored",
  description: "Restored: new_post",
  usage: ".newpost",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
