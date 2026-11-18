const { run } = require('../lib/compat');
const META = {
  file: "qc2.js",
  family: "A",
  command: "qc2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "qc2",
  aliases: [],
  category: "misc",
  description: "New plugin: qc2",
  usage: ".qc2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
