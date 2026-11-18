module.exports = {
  command: 'gpt',
  aliases: ['chatgpt', 'openai'],
  category: 'ai',
  description: 'GPT / AI chat',
  usage: '.gpt <question>',
  async handler(sock, message, args, context = {}) {
    const ai = require('./ai');
    return ai.handler(sock, message, args, context);
  }
};
