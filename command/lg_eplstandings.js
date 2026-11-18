const { run } = require('../lib/compat');
const META = {"file":"eplstandings.js","family":"B","command":"eplstandings","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "eplstandings2",
  aliases: ["epltable","standings","finishedeplmatches","eplfinished","eplresults","upcomingeplmatches","eplmatches","epl"],
  category: "sports",
  description: "fetch epl standings 📊",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
