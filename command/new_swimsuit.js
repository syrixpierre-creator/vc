const { run } = require('../lib/compat');
const META = {
  file: "nsfw-random.js",
  family: "A",
  command: "swimsuit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "swimsuit",
  aliases: ["schoolswimsuit", "white", "barefoot", "touhou", "gamecg", "hololive", "uncensored", "sunglasses"],
  category: "misc",
  description: "New plugin: swimsuit",
  usage: ".swimsuit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
