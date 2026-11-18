/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_video2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_video2.js",
  family: "B",
  command: "newvideo2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newvideo2",
  aliases: [],
  category: "restored",
  description: "Restored: new_video2",
  usage: ".newvideo2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
