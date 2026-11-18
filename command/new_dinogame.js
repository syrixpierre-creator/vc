const { run } = require('../lib/compat');
const META = {
  file: "game-dino.js",
  family: "A",
  command: "dinogame",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dinogame",
  aliases: [],
  category: "misc",
  description: "New plugin: dinogame",
  usage: ".dinogame",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
