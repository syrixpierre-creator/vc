/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for channel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "channel.js",
  family: "A",
  command: "channel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "channel",
  aliases: [],
  category: "restored",
  description: "Restored: channel",
  usage: ".channel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
