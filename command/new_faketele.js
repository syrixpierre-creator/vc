const { run } = require('../lib/compat');
const META = {
  file: "maker-faketele.js",
  family: "A",
  command: "faketele",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "faketele",
  aliases: ["faketelegram"],
  category: "misc",
  description: "New plugin: faketele",
  usage: ".faketele",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
