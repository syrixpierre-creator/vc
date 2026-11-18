/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sound-sad.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sound-sad.js",
  family: "A",
  command: "soundsad",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "soundsad",
  aliases: [],
  category: "restored",
  description: "Restored: sound-sad",
  usage: ".soundsad",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
