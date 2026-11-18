/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for speedtest.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "speedtest.js",
  family: "B",
  command: "speedtest",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "speedtest",
  aliases: [],
  category: "restored",
  description: "Restored: speedtest",
  usage: ".speedtest",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
