const { run } = require('../lib/compat');
const META = {
  file: "game-tekateki.js",
  family: "A",
  command: "tekateki",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tekateki",
  aliases: [],
  category: "misc",
  description: "New plugin: tekateki",
  usage: ".tekateki",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
