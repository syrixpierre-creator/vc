const { ask } = require('../lib/smartAI');
// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';
// import { ask } from '../lib/smartAI.js';

module.exports = {
    command: 'copilot',
    aliases: ['cpt', 'githubcopilot', 'code'],
    category: 'ai',
    description: 'Chat with Copilot AI - Your programming assistant',
    usage: '.copilot <question>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        if (!args.length) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🤖 ${botName} ⟯⊷
 *COPILOT AI*

 Your AI programming assistant

 *Usage:*
 .copilot <question>

 *Examples:*
 .copilot Write a Python function to reverse a string
 .copilot Explain async/await in JavaScript
 .copilot How to use fetch API

 *Supports:*
 💻 Code generation
 🐞 Debugging help
 📚 Explanations
 🔧 Code review
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
            return;
        }

        const prompt = args.join(' ');

        try {
            // Send reaction
            await sock.sendMessage(chatId, {
                react: { text: '🤖', key: message.key }
            }).catch(() => {});

            // Send thinking message
            const thinkingMsg = await sock.sendMessage(chatId, {
                text: ` ⟮ 🤖 ${botName} ⟯⊷
 *COPILOT AI*

 ⏳ Generating response...
 _This may take a few seconds._
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });

            // Get response from AI
            const key = 'copilot:' + chatId;
            const response = await ask({
                key,
                system: 'You are Copilot, an AI programming assistant. Provide helpful code snippets, explanations, and programming advice. When providing code, use proper formatting with language tags. Be concise but thorough.',
                user: prompt,
            });

            if (!response || !response.trim()) {
                await sock.sendMessage(chatId, {
                    text: `❌ Copilot AI is currently unavailable or returned an empty response.\n\nPlease try again later.`
                }, { quoted: fakeSender });
                return;
            }

            // Format the response (split if too long)
            const maxLength = 4000;
            const responseText = response.trim();

            // Build formatted response
            let resultText = ` ⟮ 🤖 ${botName} ⟯⊷
 *COPILOT AI*

 📝 *Your question:*
 ${prompt}


 *Response:*
`;

            // Split response if too long
            if (responseText.length > maxLength) {
                const parts = responseText.match(/.{1,4000}/g) || [];
                let firstPart = true;

                for (const part of parts) {
                    const text = firstPart ?
                        `${resultText}\n ${part}\n⊷\n\n_⚡ Powered by ${botName}_` :
                        ` ⟮ 🤖 ${botName} ⟯⊷\n *CONTINUED...*\n\n ${part}\n⊷\n\n_⚡ Powered by ${botName}_`;

                    await sock.sendMessage(chatId, {
                        text: text
                    }, { quoted: fakeSender });
                    firstPart = false;
                }
            } else {
                // Single message
                const finalText = `${resultText}\n ${responseText}\n⊷\n\n_⚡ Powered by ${botName}_`;

                await sock.sendMessage(chatId, {
                    text: finalText
                }, { quoted: fakeSender });
            }

            // Delete thinking message
            try {
                await sock.sendMessage(chatId, {
                    delete: thinkingMsg.key
                });
            } catch {}

            // Success reaction
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (err) {
            console.error('[copilot]', err.message);
            await sock.sendMessage(chatId, {
                text: ` ⟮ ❌ ${botName} ⟯⊷
 *COPILOT AI ERROR*

 ❌ Service error: ${err.message || 'Please try again later.'}

 *Possible solutions:*
 • Try again in a few seconds
 • Reduce the complexity of your question
 • Check your internet connection

 💡 *Tip:* Try .gpt or .ai as alternatives
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
        }
    }
};