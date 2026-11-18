/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-cuaca.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-cuaca.js",
  family: "B",
  command: "internetcuaca",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetcuaca",
  aliases: [],
  category: "restored",
  description: "Restored: internet-cuaca",
  usage: ".internetcuaca",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
