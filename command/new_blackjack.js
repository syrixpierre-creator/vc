const { run } = require('../lib/compat');
const META = {
  file: "game-blackjack.js",
  family: "A",
  command: "blackjack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "blackjack",
  aliases: [],
  category: "misc",
  description: "New plugin: blackjack",
  usage: ".blackjack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
