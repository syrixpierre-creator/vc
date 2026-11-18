const axios = require('axios');
const config = require('../settings');
const { sam } = require('../sam');
const fs = require('fs');
let bioInterval;
const defaultBio = config.AUTO_BIO_TEXT || "QUEEN AKUMA | Quote: {quote}";
const quoteApiUrl = config.QUOTE_API_URL || 'https://apis.davidcyriltech.my.id/random/quotes';
const updateInterval = config.AUTO_BIO_INTERVAL || 30 * 1000; // Default to 30 seconds
// Fallback quotes if API fails
const fallbackQuotes = [
    "Stay curious, keep learning!",
    "Dream big, work hard!",
    "The best is yet to come.",
    "Keep it real, always.",
    "Life is a journey, enjoy it!"
];
sam({
    pattern: 'autobio',
    alias: ['autoabout'],
    desc: 'Toggle automatic bio updates with random quotes',
    category: 'misc',
    filename: __filename,
    usage: `${config.PREFIX}autobio [on/off] [text]`
}, async (malvin, mek, m, { args, reply, isOwner }) => {
    const [action, ...bioParts] = args;
    const customBio = bioParts.join(' ') || defaultBio;
    try {
        if (action === 'on') {
            if (config.AUTO_BIO === "true") {
                return reply("ℹ️ AUTO-BIO Is ALREADY ENABLED");
            }
            config.AUTO_BIO = "true";
            config.AUTO_BIO_TEXT = customBio;
            // Optionally persist config
            // fs.writeFileSync('./settings.json', JSON.stringify(config, null, 2));
            startAutoBio(malvin, customBio);
            return reply(`✅ AUTO-BIO ENABLED\nCURRENT TExT: "${customBio}"`);
        }
        else if (action === 'off') {
            if (config.AUTO_BIO !== "true") {
                return reply("ℹ️ AUTO-BIO Is ALREADY DIsABLED");
            }
            config.AUTO_BIO = "false";
            stopAutoBio();
            // Optionally persist config
            // fs.writeFileSync('./settings.json', JSON.stringify(config, null, 2));
            return reply("✅ AUTO-BIO DIsABLED");
        }
        else {
            return reply(` 🤖 *AUTO-BIO* \n` +
                `\n` +
                ` 📜 *UsAGE:*\n` +
                ` ➸ ${config.PREFIX}autobio on [text] - ENABLE WITH CUsTOM TExT\n` +
                ` ➸ ${config.PREFIX}autobio off - DIsABLE AUTO-BIO\n` +
                `\n` +
                ` 🔖 *PLACEHOLDERs:*\n` +
                ` ➸ {quote} - RANDOM OUOTE\n` +
                `\n` +
                ` 💡 *sTATUs:* ${config.AUTO_BIO === "true" ? 'ON' : 'OFF'}\n` +
                ` 📝 *TExT:* "${config.AUTO_BIO_TEXT || defaultBio}"\n` +
                `⚬⚬⚬⚬⚬⚬⚬⚬⚬⚬⚬⚬⚬⚬`);
        }
    }
    catch (error) {
        console.error('❌ Auto-bio error:', error.message);
        return reply("❌ ғAILED TO UPDATE AUTO-BIO sETTINGs");
    }
});
// Fetch random quote
async function fetchQuote() {
    try {
        const response = await axios.get(quoteApiUrl);
        if (response.status === 200 && response.data.content) {
            return response.data.content;
        }
        throw new Error('Invalid quote API response');
    }
    catch (error) {
        console.error('Quote fetch error:', error.message);
        return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
}
// Start auto-bio updates
async function startAutoBio(malvin, bioText) {
    stopAutoBio();
    bioInterval = setInterval(async () => {
        try {
            const quote = await fetchQuote();
            const formattedBio = bioText.replace('{quote}', quote);
            await malvin.updateProfileStatus(formattedBio);
        }
        catch (error) {
            console.error('❌ Bio update error:', error.message);
            setTimeout(async () => {
                try {
                    const quote = await fetchQuote();
                    const formattedBio = bioText.replace('{quote}', quote);
                    await malvin.updateProfileStatus(formattedBio);
                }
                catch (retryError) {
                    console.error('❌ Bio retry error:', retryError.message);
                    stopAutoBio();
                }
            }, 5000);
        }
    }, updateInterval);
}
// Stop auto-bio updates
function stopAutoBio() {
    if (bioInterval) {
        clearInterval(bioInterval);
        bioInterval = null;
    }
}
// Initialize auto-bio if enabled
module.exports.init = (malvin) => {
    if (config.AUTO_BIO === "true") {
        const bioText = config.AUTO_BIO_TEXT || defaultBio;
        startAutoBio(malvin, bioText);
    }
};
