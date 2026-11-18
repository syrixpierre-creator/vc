/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for closetime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "closetime.js",
  family: "A",
  command: "xclosetime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xclosetime",
  aliases: [],
  category: "restored",
  description: "Restored: closetime",
  usage: ".xclosetime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
