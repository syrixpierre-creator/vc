const { run } = require('../lib/compat');
const META = {
  file: "game-tebaklagu.js",
  family: "A",
  command: "tebaklagu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebaklagu",
  aliases: [],
  category: "misc",
  description: "New plugin: tebaklagu",
  usage: ".tebaklagu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
