const { run } = require('../lib/compat');
const META = {
  file: "ttsba.js",
  family: "A",
  command: "ttsba",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ttsba",
  aliases: [],
  category: "misc",
  description: "New plugin: ttsba",
  usage: ".ttsba",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
