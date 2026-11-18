const { run } = require('../lib/compat');
const META = {
  file: "game-war.js",
  family: "A",
  command: "war",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "war",
  aliases: [],
  category: "misc",
  description: "New plugin: war",
  usage: ".war",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
