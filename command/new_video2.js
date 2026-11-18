"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const yt_search_1 = __importDefault(require("yt-search"));
const APIs = __importStar((function(){try{return require("../lib/api");}catch(e){return {};}}()));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
const API_KEY = 'xbps-install-Syu';
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const downloadWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios_1.default.get(DL_API, {
                params: { apiKey: API_KEY, format: '360', url },
                timeout: 90000
            });
            if (data?.data?.downloadUrl)
                return data.data;
            throw new Error('No download URL');
        }
        catch (err) {
            if (i === retries - 1)
                throw err;
            await wait(5000);
        }
    }
    throw new Error('All download attempts failed');
};
exports.default = {
    command: 'video2',
    aliases: ['mp4', 'vida'],
    category: 'download',
    description: 'Download YouTube videos by link or search',
    usage: '.video <youtube link | search query>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        if (!query) {
            return sock.sendMessage(chatId, {
                text: '🎥 *Video Downloader*\n\nUsage: .video <song name | YouTube link>\nExample: .video Alan Walker Faded'
            }, { quoted: message });
        }
        try {
            let videoUrl;
            let videoTitle;
            let videoThumbnail;
            if (query.startsWith('http://') || query.startsWith('https://')) {
                videoUrl = query;
            }
            else {
                const { videos } = await (0, yt_search_1.default)(query);
                if (!videos?.length)
                    return sock.sendMessage(chatId, { text: '❌ No videos found!' }, { quoted: message });
                videoUrl = videos[0].url;
                videoTitle = videos[0].title;
                videoThumbnail = videos[0].thumbnail;
            }
            const validYT = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
            if (!validYT)
                return sock.sendMessage(chatId, { text: '❌ Not a valid YouTube link!' }, { quoted: message });
            const ytId = validYT[1];
            const thumb = videoThumbnail || `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`;
            await sock.sendMessage(chatId, {
                image: { url: thumb },
                caption: `🎬 *${videoTitle || query}*\n🔄 *Downloading video...*`
            }, { quoted: message });
            let videoData = null;
            let videoBuffer = null;
            let downloadSuccess = false;
            try {
                videoData = await downloadWithRetry(videoUrl);
                const videoResponse = await axios_1.default.get(videoData.downloadUrl, {
                    responseType: 'arraybuffer',
                    timeout: 120000
                });
                videoBuffer = Buffer.from(videoResponse.data);
                if (videoBuffer && videoBuffer.length > 500000) {
                    downloadSuccess = true;
                }
            }
            catch (ownApiErr) {
                const apiMethods = [
                    { name: 'EliteProTech', method: () => APIs.getEliteProTechVideoByUrl(videoUrl) },
                    { name: 'Yupra', method: () => APIs.getYupraVideoByUrl(videoUrl) },
                    { name: 'Okatsu', method: () => APIs.getOkatsuVideoByUrl(videoUrl) }
                ];
                for (const apiMethod of apiMethods) {
                    try {
                        const result = await apiMethod.method();
                        const videoUrl_result = result.download;
                        if (!videoUrl_result)
                            continue;
                        const videoResponse = await axios_1.default.get(videoUrl_result, {
                            responseType: 'arraybuffer',
                            timeout: 120000
                        });
                        videoBuffer = Buffer.from(videoResponse.data);
                        if (videoBuffer && videoBuffer.length > 500000) {
                            videoData = result;
                            downloadSuccess = true;
                            break;
                        }
                    }
                    catch (apiErr) {
                        continue;
                    }
                }
            }
            if (!downloadSuccess || !videoBuffer) {
                throw new Error('All download sources failed');
            }
            await sock.sendMessage(chatId, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                fileName: `${(videoData?.title || videoTitle || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
                caption: `🎬 *${videoData?.title || videoTitle || 'Video'}*\n\n📥 *DOWNLOADED BY QUEEN AKUMA*`
            }, { quoted: message });
            try {
                const tempDir = path_1.default.join(process.cwd(), 'temp');
                if (fs_1.default.existsSync(tempDir)) {
                    const files = fs_1.default.readdirSync(tempDir);
                    const now = Date.now();
                    files.forEach(file => {
                        const filePath = path_1.default.join(tempDir, file);
                        try {
                            const stats = fs_1.default.statSync(filePath);
                            if (now - stats.mtimeMs > 10000) {
                                if (file.endsWith('.mp4') || file.endsWith('.mp3')) {
                                    fs_1.default.unlinkSync(filePath);
                                }
                            }
                        }
                        catch (e) { }
                    });
                }
            }
            catch (cleanupErr) { }
        }
        catch (err) {
            console.error('[VIDEO] Error:', err.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to download video. Try again later.`
            }, { quoted: message });
        }
    }
};

module.exports = exports.default;
