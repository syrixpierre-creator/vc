const { run } = require('../lib/compat');
const META = {
  file: "owner-crm2.js",
  family: "A",
  command: "crm2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "crm2",
  aliases: [],
  category: "misc",
  description: "New plugin: crm2",
  usage: ".crm2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
