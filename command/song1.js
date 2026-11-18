// plugins/song3.js - Song Downloader v3 (Fully Hardcoded with Correct API)
// import axios from 'axios';

module.exports = {
    command: 'songx',
    aliases: [],
    category: 'music',
    description: 'Download full songs from YouTube (MP3)',
    usage: '.song3 <song name | YouTube link>',

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();

        // ===== HARDCODED CONFIGURATION =====
        const API_BASE = 'https://api-red-iota-56.vercel.app';
        const API_KEY = 'nova_510035';
        const TIMEOUT = 120000; // 2 minutes

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `🎵 *Song Downloader v3*\n\n` +
                      `Usage: .song3 <song name | YouTube link>\n\n` +
                      `Example:\n.song3 Shape of You`
            }, { quoted: message });
        }

        try {
            // Send searching message
            const msg = await sock.sendMessage(chatId, {
                text: `🔍 *Searching for:*\n🎵 ${query}\n\n⏳ *Please wait...*`
            }, { quoted: message });

            // ===== FIXED: Use /music/song2 endpoint =====
            const response = await axios.get(`${API_BASE}/music/song3`, {
                params: {
                    apikey: API_KEY,
                    query: query
                },
                timeout: TIMEOUT
            });

            // Check response
            if (!response.data || !response.data.success) {
                await sock.sendMessage(chatId, { delete: msg.key });
                return sock.sendMessage(chatId, {
                    text: `❌ *Failed to download song*\n\n${response.data?.message || 'Unknown error'}`
                }, { quoted: message });
            }

            const song = response.data.song;
            const download = response.data.download;

            // Delete searching message
            await sock.sendMessage(chatId, { delete: msg.key });

            // Get thumbnail
            let thumbnailBuffer = null;

            // Try base64 thumbnail first
            if (song.thumbnail_base64) {
                try {
                    const base64Data = song.thumbnail_base64.split(',')[1];
                    if (base64Data) {
                        thumbnailBuffer = Buffer.from(base64Data, 'base64');
                    }
                } catch (e) {
                    thumbnailBuffer = null;
                }
            }

            // If no thumbnail, try URL
            if (!thumbnailBuffer && song.thumbnail) {
                try {
                    const imgRes = await axios.get(song.thumbnail, {
                        responseType: 'arraybuffer',
                        timeout: 15000
                    });
                    thumbnailBuffer = Buffer.from(imgRes.data);
                } catch (e) {
                    thumbnailBuffer = null;
                }
            }

            // Format size
            const sizeMB = (song.size / 1024 / 1024).toFixed(2);
            const sizeLabel = sizeMB > 1 ? `${sizeMB} MB` : `${(song.size / 1024).toFixed(1)} KB`;

            // Send song info
            const infoText = `🎵 *${song.title}*\n` +
                `⏱ *Duration:* ${song.duration || 'Unknown'}\n` +
                `👤 *Artist:* ${song.author || 'Unknown'}\n` +
                `📦 *Size:* ${sizeLabel}`;

            if (thumbnailBuffer && thumbnailBuffer.length > 1000) {
                await sock.sendMessage(chatId, {
                    image: thumbnailBuffer,
                    caption: infoText
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: infoText
                }, { quoted: message });
            }

            // Convert base64 audio to buffer
            let audioBuffer;
            try {
                audioBuffer = Buffer.from(download.audio, 'base64');
            } catch (e) {
                return sock.sendMessage(chatId, {
                    text: `❌ *Failed to decode audio data.* Please try again.`
                }, { quoted: message });
            }

            // Validate audio buffer
            if (!audioBuffer || audioBuffer.length < 10000) {
                return sock.sendMessage(chatId, {
                    text: `❌ *Downloaded file is too small.* Please try again.`
                }, { quoted: message });
            }

            // Generate filename
            const filename = song.filename ||
                `${song.title.replace(/[^\w\s-]/g, '').substring(0, 50)}.mp3`;

            // Send the audio
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: filename,
                ptt: false
            }, { quoted: message });

            // Send success message
            await sock.sendMessage(chatId, {
                text: `✅ *Download complete!*\n🎵 ${song.title}\n📥 *Downloaded by QUEEN AKUMA*`
            }, { quoted: message });

        } catch (error) {
            console.error('Song3 error:', error.message);

            let errorMsg = '❌ *Failed to download song.* Try again later.';

            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMsg = '⏱️ *Download timed out.* Try a shorter song or try again.';
            } else if (error.response?.status === 404) {
                errorMsg = '❌ *Song not found.* Try a different query.';
            } else if (error.response?.status === 429) {
                errorMsg = '🔄 *Rate limited.* Please wait a moment and try again.';
            } else if (error.response?.status === 500) {
                errorMsg = '🔧 *Server error.* Please try again later.';
            }

            await sock.sendMessage(chatId, {
                text: errorMsg
            }, { quoted: message });
        }
    }
};