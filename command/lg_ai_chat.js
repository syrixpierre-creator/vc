const { run } = require('../lib/compat');
const META = {"file":"ai-chat.js","family":"B","command":"dj","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "dj",
  aliases: ["gpt4","openai","chatgpt","gpt3","open-gpt","deepseek","seekai"],
  category: "ai",
  description: "Chat with an AI model",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
