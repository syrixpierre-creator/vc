const { run } = require('../lib/compat');
const META = {
  file: "downloader-videy.js",
  family: "A",
  command: "videy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "videy",
  aliases: [],
  category: "misc",
  description: "New plugin: videy",
  usage: ".videy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
