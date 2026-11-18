const { run } = require('../lib/compat');
const META = {
  file: "search-spotify.js",
  family: "A",
  command: "spotifys",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "spotifys",
  aliases: [],
  category: "misc",
  description: "New plugin: spotifys",
  usage: ".spotifys",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
