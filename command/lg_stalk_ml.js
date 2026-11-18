const { run } = require('../lib/compat');
const META = {"file":"stalk-ml.js","family":"A","command":"mlstalk","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "mlstalk",
  aliases: [],
  category: "stalk",
  description: "Legacy tool: mlstalk <userId> <zoneId>",
  usage: "mlstalk <userId> <zoneId>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
