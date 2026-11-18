const { lee } = require('../lee');
const axios = require('axios');
const { fakevCard } = require('../lib/fakevCard');
const { getPrefix } = require('../lib/prefix');
const prefix = getPrefix();

const IMAGE_APIS = [
    (p) => `https://stable.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://dalle.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://flux.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(p)}`
];

const generateImage = async (prompt) => {
    for (const apiUrl of IMAGE_APIS) {
        try {
            const { data } = await axios.get(apiUrl(prompt), {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const buf = Buffer.from(data);
            if (buf[0] === 0x89 || buf[0] === 0xFF)
                return buf;
        }
        catch {
            continue;
        }
    }
    throw new Error('All image generation APIs failed');
};

const enhancePrompt = (prompt) => {
    const enhancers = [
        'high quality', 'detailed', 'masterpiece', 'best quality',
        'ultra realistic', '4k', 'highly detailed', 'cinematic lighting'
    ];
    const selected = enhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 3);
    return `${prompt}, ${selected.join(', ')}`;
};

lee({
    pattern: "diffusion",
    alias: ["aiimage", "draw", "genimage", "imagine", "flux", "dalle"],
    desc: "Generate an AI image based on your prompt",
    category: "ai",
    react: "🎨",
    use: ".diffusion <prompt>",
    filename: __filename,
}, async (malvin, mek, m, { from, args, reply }) => {
    const query = args.join(' ').trim();

    if (!query) {
        return reply(`🎨 *AI Image Generator*\n\n📌 *Usage:* ${prefix}diffusion <prompt>\n\n📝 *Examples:*\n${prefix}diffusion a beautiful sunset over mountains\n${prefix}aiimage a futuristic city\n${prefix}draw a cyberpunk cat\n${prefix}genimage a realistic dragon`);
    }

    try {
        // Send processing message
        const processingMsg = await malvin.sendMessage(from, {
            text: '🎨 *Generating your image...* Please wait ⏳',
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: fakevCard });

        // Enhance the prompt
        const enhanced = enhancePrompt(query);
        console.log(`Enhanced prompt: ${enhanced}`);

        // Generate the image
        const imageBuffer = await generateImage(enhanced);

        // Delete processing message
        await malvin.sendMessage(from, {
            delete: processingMsg.key
        });

        // Send ONLY the image - no caption, no text
        await malvin.sendMessage(from, {
            image: imageBuffer
            // NO caption field
            // NO contextInfo
        }, { quoted: fakevCard });

    } catch (error) {
        console.error('Diffusion image generation error:', error.message);
        await reply('❌ Failed to generate image. Please try again later.');
    }
});