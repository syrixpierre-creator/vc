// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';
// import https from 'https';

function fetchWiki(query) {
    return new Promise((resolve, reject) => {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        https.get(url, {
            headers: {
                'User-Agent': 'QUEEN-AKUMA-Bot/3.5.0'
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    reject(new Error('Parse error'));
                }
            });
        }).on('error', reject);
    });
}

module.exports = {
    command: 'wiki',
    aliases: ['wikipedia', 'search', 'encyclopedia'],
    category: 'ai',
    description: 'Search Wikipedia for a topic',
    usage: '.wiki <topic>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        if (!args.length) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 📖 ${botName} ⟯⊷
 *WIKIPEDIA SEARCH*

 *Usage:*
 .wiki <topic>

 *Examples:*
 .wiki Artificial Intelligence
 .wiki Nigeria
 .wiki Albert Einstein

 *Tip:* Use specific keywords for better results.
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
            return;
        }

        const query = args.join(' ');

        try {
            // Send reaction
            await sock.sendMessage(chatId, {
                react: { text: '📖', key: message.key }
            }).catch(() => {});

            const data = await fetchWiki(query);

            // Handle disambiguation pages
            if (data.type === 'disambiguation' || !data.extract) {
                let suggestions = '';
                if (data.pages) {
                    const pageKeys = Object.keys(data.pages).slice(0, 5);
                    suggestions = pageKeys.map(key => {
                        const page = data.pages[key];
                        return `• ${page.title}`;
                    }).join('\n ');
                }

                await sock.sendMessage(chatId, {
                    text: ` ⟮ 📖 ${botName} ⟯⊷
 *WIKIPEDIA - DISAMBIGUATION*

 🔍 Multiple results found for "*${query}*"

 *Did you mean one of these?*
 ${suggestions || 'Try being more specific!'}

 💡 *Tip:* Use a more specific term.
⊷

_⚡ Powered by ${botName}_`
                }, { quoted: fakeSender });
                return;
            }

            // Format the summary
            let summary = data.extract || 'No summary available.';
            const truncated = summary.length > 800;
            summary = summary.slice(0, 800) + (truncated ? '...' : '');

            // Get page URL
            const pageUrl = data.content_urls?.desktop?.page ||
                           data.content_urls?.mobile?.page ||
                           `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`;

            // Build response
            const text = ` ⟮ 📖 ${botName} ⟯⊷
 *${data.title || 'Wikipedia Article'}*

 ${summary}


 📊 *Article Info:*
  📝 Length: ${data.extract?.length || 0} characters
  ${data.pageid ? `📌 Page ID: ${data.pageid}` : ''}
  ${data.timestamp ? `🕐 Updated: ${new Date(data.timestamp).toLocaleDateString()}` : ''}

 🔗 *Read more:*
 ${pageUrl}

 ${data.description ? `📋 *Description:* ${data.description}` : ''}
⊷

_⚡ Powered by ${botName}_`;

            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: fakeSender });

            // Success reaction
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Wiki error:', error);
            await sock.sendMessage(chatId, {
                text: ` ⟮ ❌ ${botName} ⟯⊷
 *WIKIPEDIA ERROR*

 ❌ Could not find Wikipedia page for "*${query}*"

 *Possible reasons:*
 • Topic doesn't exist on Wikipedia
 • Network connection issue
 • API rate limit

 💡 *Tips:*
 • Try different keywords
 • Use simpler search terms
 • Check spelling
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
        }
    }
};