/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-cnbc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-cnbc.js",
  family: "A",
  command: "internetcnbc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetcnbc",
  aliases: [],
  category: "restored",
  description: "Restored: internet-cnbc",
  usage: ".internetcnbc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
