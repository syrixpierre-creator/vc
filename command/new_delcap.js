const { run } = require('../lib/compat');
const META = {
  file: "fun-cap.js",
  family: "A",
  command: "delcap",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "delcap",
  aliases: [],
  category: "misc",
  description: "New plugin: delcap",
  usage: ".delcap",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
