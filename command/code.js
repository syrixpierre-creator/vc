const { ask } = require('../lib/smartAI');
// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';
// import { ask } from '../lib/smartAI.js';

module.exports = {
    command: 'code',
    aliases: ['codehelp', 'coder', 'programming', 'dev'],
    category: 'ai',
    description: 'Get coding help from AI',
    usage: '.code <your programming question>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        if (!args.length) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 💻 ${botName} ⟯⊷
 *CODE ASSISTANT*

 Your AI programming helper

 *Usage:*
 .code <question>

 *Examples:*
 .code write a python function to reverse a string
 .code explain async/await in JavaScript
 .code how to use fetch API in React
 .code create a REST API in Node.js

 *Supports:*
 📝 Code generation
 🐞 Debugging
 📚 Explanations
 🔧 Best practices
 💡 Optimization tips
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
            return;
        }

        const question = args.join(' ');

        try {
            // Send reaction
            await sock.sendMessage(chatId, {
                react: { text: '💻', key: message.key }
            }).catch(() => {});

            // Send thinking message
            const thinkingMsg = await sock.sendMessage(chatId, {
                text: ` ⟮ 💻 ${botName} ⟯⊷
 *CODE ASSISTANT*

 ⏳ Analyzing your question...
 _Generating code and explanation..._
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });

            // Get AI response
            const response = await ask({
                key: 'code:' + chatId,
                system: 'You are an expert programming assistant. Give correct, concise code with a short explanation. Use fenced code blocks with language tags. Provide practical, working examples. If appropriate, include performance considerations and potential pitfalls.',
                user: question,
            });

            // Delete thinking message
            try {
                await sock.sendMessage(chatId, {
                    delete: thinkingMsg.key
                });
            } catch {}

            if (!response) {
                await sock.sendMessage(chatId, {
                    text: `❌ AI is busy right now. Try again in a moment.`
                }, { quoted: fakeSender });
                return;
            }

            // Format the response with code block detection
            let formattedResponse = response.trim();

            // Check if response already has code blocks
            const hasCodeBlock = formattedResponse.includes('```');

            // If no code blocks and it looks like code, wrap it
            if (!hasCodeBlock && (
                formattedResponse.includes('function') ||
                formattedResponse.includes('const ') ||
                formattedResponse.includes('let ') ||
                formattedResponse.includes('var ') ||
                formattedResponse.includes('def ') ||
                formattedResponse.includes('class ') ||
                formattedResponse.includes('import ') ||
                formattedResponse.includes('return ')
            )) {
                // Detect language from context
                let lang = 'javascript';
                if (formattedResponse.includes('def ') || formattedResponse.includes('class') && formattedResponse.includes(':')) {
                    lang = 'python';
                } else if (formattedResponse.includes('function') || formattedResponse.includes('const ') || formattedResponse.includes('let ')) {
                    lang = 'javascript';
                } else if (formattedResponse.includes('<?php')) {
                    lang = 'php';
                } else if (formattedResponse.includes('SELECT') || formattedResponse.includes('INSERT')) {
                    lang = 'sql';
                }
                formattedResponse = `\`\`\`${lang}\n${formattedResponse}\n\`\`\``;
            }

            // Split response if too long
            const maxLength = 4000;
            if (formattedResponse.length > maxLength) {
                const parts = formattedResponse.match(/.{1,4000}/g) || [];
                let firstPart = true;

                for (const part of parts) {
                    const text = firstPart ?
                        ` ⟮ 💻 ${botName} ⟯⊷\n *CODE ASSISTANT*\n\n 📝 *Question:*\n ${question}\n\n \n *Response:*\n ${part}\n⊷\n\n_⚡ Powered by ${botName}_` :
                        ` ⟮ 💻 ${botName} ⟯⊷\n *CONTINUED...*\n\n ${part}\n⊷\n\n_⚡ Powered by ${botName}_`;

                    await sock.sendMessage(chatId, {
                        text: text
                    }, { quoted: fakeSender });
                    firstPart = false;
                }
            } else {
                // Single message
                await sock.sendMessage(chatId, {
                    text: ` ⟮ 💻 ${botName} ⟯⊷
 *CODE ASSISTANT*

 📝 *Question:*
 ${question}


 *Response:*
 ${formattedResponse}
⊷

_⚡ Powered by ${botName}_`
                }, { quoted: fakeSender });
            }

            // Success reaction
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Code error:', error);
            await sock.sendMessage(chatId, {
                text: ` ⟮ ❌ ${botName} ⟯⊷
 *CODE ASSISTANT ERROR*

 ❌ Failed to get coding help

 *Error:* ${error.message || 'Unknown error'}

 *Try:*
 • Rephrase your question
 • Use simpler terms
 • Try again in a few seconds
 • Use .gpt as alternative
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
        }
    }
};