const { run } = require('../lib/compat');
const META = {
  file: "nsfw-wmilf.js",
  family: "A",
  command: "wmilf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wmilf",
  aliases: [],
  category: "misc",
  description: "New plugin: wmilf",
  usage: ".wmilf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
