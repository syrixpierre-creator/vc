/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for voice-audio.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "voice-audio.js",
  family: "B",
  command: "voiceaudio",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "voiceaudio",
  aliases: [],
  category: "restored",
  description: "Restored: voice-audio",
  usage: ".voiceaudio",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
