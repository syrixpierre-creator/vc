/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for mute.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "mute.js",
  family: "A",
  command: 'mutealt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mute",
  aliases: [],
  category: "restored",
  description: "Restored: mute",
  usage: ".mute",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
