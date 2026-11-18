const { run } = require('../lib/compat');
const META = {
  file: "info-runtime.js",
  family: "A",
  command: "statusbot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "statusbot",
  aliases: ["botinfo", "infobot"],
  category: "misc",
  description: "New plugin: statusbot",
  usage: ".statusbot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
