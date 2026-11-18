const { run } = require('../lib/compat');
const META = {
  file: "nsfw-nhentaidl.js",
  family: "A",
  command: "nhentaidl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nhentaidl",
  aliases: [],
  category: "misc",
  description: "New plugin: nhentaidl",
  usage: ".nhentaidl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
