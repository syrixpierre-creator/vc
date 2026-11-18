const { run } = require('../lib/compat');
const META = {
  file: "game-tebakanml.js",
  family: "A",
  command: "tebakanml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakanml",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakanml",
  usage: ".tebakanml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
