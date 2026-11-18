const { run } = require('../lib/compat');
const META = {
  file: "zelapi-nokos.js",
  family: "A",
  command: "sms",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sms",
  aliases: [],
  category: "misc",
  description: "New plugin: sms",
  usage: ".sms",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
