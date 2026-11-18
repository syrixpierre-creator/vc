/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-mltour.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-mltour.js",
  family: "B",
  command: "internetmltour",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetmltour",
  aliases: [],
  category: "restored",
  description: "Restored: internet-mltour",
  usage: ".internetmltour",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
