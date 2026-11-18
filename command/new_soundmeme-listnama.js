const { run } = require('../lib/compat');
const META = {
  file: "search-soundmeme.js",
  family: "A",
  command: "soundmeme-listnama",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "soundmeme-listnama",
  aliases: ["soundmeme-random", "soundmeme-search"],
  category: "misc",
  description: "New plugin: soundmeme-listnama",
  usage: ".soundmeme-listnama",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
