/**
 * QUEEN AKUMA — API registry (.dexapi) — 60 categorized templates
 */
const fs = require('fs');
const path = require('path');

const REG_PATH = path.join(process.cwd(), 'data', 'api-registry.json');
const QASIM = process.env.DEMON_API_BASE || 'https://api.qasimdev.dpdns.org';
const QKEY = process.env.DEMON_API_KEY || 'qasim-dev';

const DEFAULT_TEMPLATES = {
  "download": {
    "purpose": "Generic media download",
    "file": "lib/downloadApis.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/loaderto/download?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://youtu.be/dQw4w9WgXcQ"
    }
  },
  "youtube": {
    "purpose": "YouTube MP4",
    "file": "lib/downloadApis.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/youtube/mp4?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://youtu.be/dQw4w9WgXcQ"
    }
  },
  "ytmp3": {
    "purpose": "YouTube MP3",
    "file": "plugins/ytmp3.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/youtube/mp3?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://youtu.be/dQw4w9WgXcQ"
    }
  },
  "tiktok": {
    "purpose": "TikTok video",
    "file": "plugins/tiktok.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tiktok/download?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://www.tiktok.com/"
    }
  },
  "instagram": {
    "purpose": "Instagram reel/post",
    "file": "lib/downloadApis.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/instagram/download?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://www.instagram.com/"
    }
  },
  "facebook": {
    "purpose": "Facebook video",
    "file": "plugins/facebook.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/facebook/download?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://www.facebook.com/"
    }
  },
  "twitter": {
    "purpose": "Twitter/X video",
    "file": "lib/downloadApis.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/twitter/download?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://twitter.com/"
    }
  },
  "mediafire": {
    "purpose": "MediaFire file",
    "file": "plugins/mediafire.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/mediafire?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://www.mediafire.com/"
    }
  },
  "gdrive": {
    "purpose": "Google Drive",
    "file": "lib/downloadApis.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/gdrive?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://drive.google.com/"
    }
  },
  "apk": {
    "purpose": "APK download/search",
    "file": "lib/downloadApis.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/apk/search/sfile?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "whatsapp"
    }
  },
  "song": {
    "purpose": "Song / YT audio search",
    "file": "plugins/song.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/youtube/mp3?apiKey={key}&query={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "despacito"
    }
  },
  "play": {
    "purpose": "Play Spotify search",
    "file": "plugins/play.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/spotify/search?apiKey={key}&query={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "shape of you"
    }
  },
  "spotify": {
    "purpose": "Spotify download",
    "file": "lib/downloadApis.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/spotify/download?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://open.spotify.com/"
    }
  },
  "soundcloud": {
    "purpose": "SoundCloud track",
    "file": "lib/apiRegistry.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/soundcloud?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://soundcloud.com/"
    }
  },
  "lyrics": {
    "purpose": "Song lyrics",
    "file": "lib/apiRegistry.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/lyrics?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "perfect ed sheeran"
    }
  },
  "tts": {
    "purpose": "Text to speech",
    "file": "plugins/tts2.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tts?apiKey={key}&text={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "hello"
    }
  },
  "joox": {
    "purpose": "Joox music search",
    "file": "lib/apiRegistry.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/joox?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "love"
    }
  },
  "ringtone": {
    "purpose": "Ringtone search",
    "file": "lib/apiRegistry.js",
    "category": "2-Music",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/ringtone?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "iphone"
    }
  },
  "igstalk": {
    "purpose": "Instagram profile stalk",
    "file": "lib/apiRegistry.js",
    "category": "3-Stalk",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/stalk/instagram?apiKey={key}&user={user}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "user": "instagram"
    }
  },
  "ttstalk": {
    "purpose": "TikTok profile stalk",
    "file": "lib/apiRegistry.js",
    "category": "3-Stalk",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/stalk/tiktok?apiKey={key}&user={user}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "user": "tiktok"
    }
  },
  "ghstalk": {
    "purpose": "GitHub user stalk",
    "file": "lib/apiRegistry.js",
    "category": "3-Stalk",
    "method": "GET",
    "url": "https://api.github.com/users/{user}",
    "keyEnv": "",
    "sample": {
      "user": "github"
    }
  },
  "tgstalk": {
    "purpose": "Telegram stalk",
    "file": "lib/downloadApis.js",
    "category": "3-Stalk",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/stalk/telegram?apiKey={key}&user={user}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "user": "telegram"
    }
  },
  "ytstalk": {
    "purpose": "YouTube channel stalk",
    "file": "plugins/ytstalk.js",
    "category": "3-Stalk",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/stalk/youtube?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "mrbeast"
    }
  },
  "wastalk": {
    "purpose": "WhatsApp number check",
    "file": "plugins/whatsapp.js",
    "category": "3-Stalk",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tools/whatsapp?apiKey={key}&number={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "554488138425"
    }
  },
  "npmstalk": {
    "purpose": "NPM package info",
    "file": "plugins/dl-npm.js",
    "category": "3-Stalk",
    "method": "GET",
    "url": "https://registry.npmjs.org/{query}",
    "keyEnv": "",
    "sample": {
      "query": "axios"
    }
  },
  "info": {
    "purpose": "General tools / SEO",
    "file": "config.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tools/seo?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "whatsapp"
    }
  },
  "lookup": {
    "purpose": "Domain / query lookup",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tools/seo?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "google.com"
    }
  },
  "github": {
    "purpose": "GitHub API",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.github.com/users/{user}",
    "keyEnv": "",
    "sample": {
      "user": "octocat"
    }
  },
  "onlineinfo": {
    "purpose": "Online status host ping",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.github.com/zen",
    "keyEnv": "",
    "sample": {}
  },
  "ip": {
    "purpose": "IP geolocation",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://ipapi.co/{ip}/json/",
    "keyEnv": "",
    "sample": {
      "ip": "8.8.8.8"
    }
  },
  "numberinfo": {
    "purpose": "Phone number info template",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tools/phone?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "554488138425"
    }
  },
  "weather": {
    "purpose": "Weather by city",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/weather?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "Delhi"
    }
  },
  "translate": {
    "purpose": "Language translate",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/translate?apiKey={key}&text={query}&to=hi",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "hello"
    }
  },
  "wiki": {
    "purpose": "Wikipedia summary",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://en.wikipedia.org/api/rest_v1/page/summary/{query}",
    "keyEnv": "",
    "sample": {
      "query": "WhatsApp"
    }
  },
  "qr": {
    "purpose": "QR read / tools",
    "file": "lib/downloadApis.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tools/readqr?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://files.catbox.moe/"
    }
  },
  "reverse": {
    "purpose": "Reverse image search",
    "file": "lib/downloadApis.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/tools/reverse?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "url": "https://files.catbox.moe/mu6qp7.png"
    }
  },
  "giphy": {
    "purpose": "Giphy GIF search",
    "file": "settings.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://api.giphy.com/v1/gifs/search?api_key={key}&q={query}&limit=1",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "hello"
    }
  },
  "anime": {
    "purpose": "Anime image/quote",
    "file": "plugins/anime.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://api.some-random-api.com/animu",
    "keyEnv": "",
    "sample": {}
  },
  "quote": {
    "purpose": "Would you rather / quotes",
    "file": "lib/downloadApis.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/quote/wyr?apiKey={key}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {}
  },
  "joke": {
    "purpose": "Random jokes",
    "file": "lib/apiRegistry.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://official-joke-api.appspot.com/random_joke",
    "keyEnv": "",
    "sample": {}
  },
  "ai": {
    "purpose": "AI chatbot endpoint",
    "file": "lib/apiRegistry.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://zellapi.autos/ai/chatbot",
    "keyEnv": "",
    "sample": {}
  },
  "image": {
    "purpose": "Google image search",
    "file": "lib/downloadApis.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/dl/gimage?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "cat"
    }
  },
  "istock": {
    "purpose": "Stock image search",
    "file": "lib/downloadApis.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/dl/istock?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "nature"
    }
  },
  "wallpaper": {
    "purpose": "4K wallpaper",
    "file": "plugins/4kwallpaper.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/wallpaper?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "anime"
    }
  },
  "netflix": {
    "purpose": "Netflix search template",
    "file": "lib/apiRegistry.js",
    "category": "6-Games-Stream",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/search?apiKey={key}&query={query}&type=netflix",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "stranger things"
    }
  },
  "freefire": {
    "purpose": "Free Fire ID info",
    "file": "lib/apiRegistry.js",
    "category": "6-Games-Stream",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/game/freefire?apiKey={key}&id={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "12345678"
    }
  },
  "mlbb": {
    "purpose": "Mobile Legends ID",
    "file": "lib/apiRegistry.js",
    "category": "6-Games-Stream",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/game/mlbb?apiKey={key}&id={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "12345678"
    }
  },
  "pubg": {
    "purpose": "PUBG ID info",
    "file": "lib/apiRegistry.js",
    "category": "6-Games-Stream",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/game/pubg?apiKey={key}&id={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {
      "query": "12345678"
    }
  },
  "whatsapp": {
    "purpose": "WhatsApp channel tools",
    "file": "settings.js",
    "category": "6-Games-Stream",
    "method": "GET",
    "url": "https://api.github.com/zen",
    "keyEnv": "",
    "sample": {}
  },
  "qasim": {
    "purpose": "Primary API host",
    "file": "lib/downloadApis.js",
    "category": "7-Hosts",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/",
    "keyEnv": "",
    "sample": {}
  },
  "siputzx": {
    "purpose": "Fallback downloader host",
    "file": "lib/downloadApis.js",
    "category": "7-Hosts",
    "method": "GET",
    "url": "https://api.siputzx.my.id/",
    "keyEnv": "",
    "sample": {}
  },
  "tikwm": {
    "purpose": "Tikwm TikTok API",
    "file": "lib/downloadApis.js",
    "category": "7-Hosts",
    "method": "GET",
    "url": "https://www.tikwm.com/api/?url={url}",
    "keyEnv": "",
    "sample": {
      "url": "https://www.tiktok.com/"
    }
  },
  "catbox": {
    "purpose": "Catbox upload CDN",
    "file": "assets/links.js",
    "category": "7-Hosts",
    "method": "GET",
    "url": "https://catbox.moe/user/api.php",
    "keyEnv": "",
    "sample": {}
  },
  "lolhuman": {
    "purpose": "LolHuman API base",
    "file": "config.js",
    "category": "7-Hosts",
    "method": "GET",
    "url": "https://api.lolhuman.xyz",
    "keyEnv": "",
    "sample": {}
  },
  "neoxr": {
    "purpose": "Neoxr API base",
    "file": "config.js",
    "category": "7-Hosts",
    "method": "GET",
    "url": "https://api.neoxr.my.id",
    "keyEnv": "",
    "sample": {}
  },
  "zenzapis": {
    "purpose": "Zenzapis API base",
    "file": "config.js",
    "category": "7-Hosts",
    "method": "GET",
    "url": "https://zenzapis.xyz",
    "keyEnv": "",
    "sample": {}
  },
  "pinterest": {
    "purpose": "Pinterest image search",
    "file": "lib/apiRegistry.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/pinterest?apiKey={key}&q={query}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {"query": "nature"}
  },
  "capcut": {
    "purpose": "CapCut template download",
    "file": "lib/apiRegistry.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/capcut?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {"url": "https://www.capcut.com/"}
  },
  "threadsdl": {
    "purpose": "Threads post download",
    "file": "lib/apiRegistry.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://api.qasimdev.dpdns.org/api/threads?apiKey={key}&url={url}",
    "keyEnv": "DEMON_API_KEY",
    "sample": {"url": "https://www.threads.net/"}
  },
  "urbandict": {
    "purpose": "Urban Dictionary define",
    "file": "lib/apiRegistry.js",
    "category": "4-Info",
    "method": "GET",
    "url": "https://api.urbandictionary.com/v0/define?term={query}",
    "keyEnv": "",
    "sample": {"query": "bot"}
  }
,
  "blackbox": {
    "purpose": "Blackbox AI chat (Arslan)",
    "file": "lib/apiRegistry.js",
    "category": "5-Fun",
    "method": "GET",
    "url": "https://arslan-apis-v2.vercel.app/ai/blackbox?q={query}",
    "keyEnv": "",
    "sample": { "query": "hello" },
    "fallbacks": [
      "https://arslan-apis-v2.vercel.app/ai/blackbox?q={query}"
    ]
  },
  "ytmp4": {
    "purpose": "YouTube MP4 (Arslan fast)",
    "file": "lib/downloadApis.js",
    "category": "1-Download",
    "method": "GET",
    "url": "https://arslan-apis-v2.vercel.app/download/ytmp4?url={url}",
    "keyEnv": "",
    "sample": { "url": "https://youtu.be/dQw4w9WgXcQ" },
    "fallbacks": [
      "https://arslan-apis-v2.vercel.app/download/ytmp4?url={url}"
    ]
  }
};

function load() {
  try {
    let j = { password: 'demon@dex', templates: {}, custom: {} };
    if (fs.existsSync(REG_PATH)) {
      try { j = JSON.parse(fs.readFileSync(REG_PATH, 'utf8')) || j; } catch (_) {}
    }
    j.templates = { ...DEFAULT_TEMPLATES, ...(j.templates || {}) };
    for (const k of Object.keys(DEFAULT_TEMPLATES)) {
      j.templates[k] = { ...DEFAULT_TEMPLATES[k], ...(j.templates[k] || {}) };
      if (!j.templates[k].purpose) j.templates[k].purpose = DEFAULT_TEMPLATES[k].purpose;
      if (!j.templates[k].file) j.templates[k].file = DEFAULT_TEMPLATES[k].file;
      if (!j.templates[k].category) j.templates[k].category = DEFAULT_TEMPLATES[k].category;
    }
    j.custom = j.custom || {};
    if (!j.password) j.password = 'demon@dex';
    save(j);
    return j;
  } catch {
    return { password: 'demon@dex', templates: { ...DEFAULT_TEMPLATES }, custom: {} };
  }
}

function save(data) {
  const dir = path.dirname(REG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(REG_PATH, JSON.stringify(data, null, 2));
}

function listAll() {
  const d = load();
  return { ...d.templates, ...d.custom };
}

function setTemplate(name, conf) {
  const d = load();
  d.custom[name] = {
    purpose: conf.purpose || conf.label || name,
    file: conf.file || 'custom (.dexapi add)',
    category: conf.category || '8-Custom',
    method: conf.method || 'GET',
    url: conf.url,
    keyEnv: conf.keyEnv || 'DEMON_API_KEY',
    sample: conf.sample || { query: 'test', url: 'https://example.com' }
  };
  save(d);
  return d.custom[name];
}

function removeTemplate(name) {
  const d = load();
  if (d.custom[name]) { delete d.custom[name]; save(d); return true; }
  if (d.templates[name]) {
    d.custom[name] = { ...d.templates[name], disabled: true };
    save(d); return true;
  }
  return false;
}

function setPassword(pw) { const d = load(); d.password = String(pw); save(d); }
function getPassword() { return load().password || 'demon@dex'; }

function fillUrl(tpl, vars = {}) {
  let url = tpl.url || '';
  const rt = (function(){ try { const d=JSON.parse(require('fs').readFileSync(REG_PATH,'utf8')); return d; } catch { return {}; } })();
  const key = process.env[tpl.keyEnv || 'DEMON_API_KEY'] || process.env.DEMON_API_KEY || rt.key || QKEY;
  const map = { key, ...(tpl.sample || {}), ...vars };
  for (const [k, v] of Object.entries(map)) {
    url = url.replace(new RegExp('\\{' + k + '\\}', 'g'), encodeURIComponent(String(v ?? '')));
  }
  return url;
}

async function testEndpoint(name, vars = {}) {
  const all = listAll();
  const tpl = all[name];
  if (!tpl || tpl.disabled) return { name, ok: false, error: 'template not found / disabled' };
  const url = fillUrl(tpl, vars);
  const started = Date.now();
  try {
    const axios = require('axios');
    const r = await axios({
      method: (tpl.method || 'GET').toLowerCase(),
      url,
      timeout: 20000,
      validateStatus: () => true,
      headers: { 'User-Agent': 'QUEEN-AKUMA-dexapi/1.0', Accept: 'application/json' }
    });
    let preview = '';
    try {
      const data = r.data;
      preview = typeof data === 'string' ? data.slice(0, 160) : JSON.stringify(data).slice(0, 160);
    } catch { preview = String(r.statusText || ''); }
    return {
      name, ok: r.status >= 200 && r.status < 400, status: r.status,
      ms: Date.now() - started, url, preview,
      purpose: tpl.purpose, file: tpl.file, category: tpl.category
    };
  } catch (e) {
    return { name, ok: false, error: e.message, ms: Date.now() - started, url, purpose: tpl.purpose, file: tpl.file };
  }
}

async function testAll() {
  const all = listAll();
  const names = Object.keys(all).filter((n) => !all[n].disabled);
  const results = [];
  for (const n of names) results.push(await testEndpoint(n));
  return results;
}

function formatStatus() {
  const all = listAll();
  const names = Object.keys(all).sort((a, b) => {
    const ca = all[a].category || '';
    const cb = all[b].category || '';
    if (ca !== cb) return ca.localeCompare(cb);
    return a.localeCompare(b);
  });
  let lastCat = '';
  const blocks = [];
  names.forEach((name, i) => {
    const t = all[name];
    const cat = t.category || 'Other';
    if (cat !== lastCat) {
      blocks.push('━━━━━━━━━━━━━━━━\n📂 *' + cat + '*');
      lastCat = cat;
    }
    const off = t.disabled ? ' ⛔ OFF' : '';
    blocks.push(
      '*' + (i + 1) + '. ' + name + '*' + off + '\n' +
      '📌 Purpose: ' + (t.purpose || '-') + '\n' +
      '📄 File: `' + (t.file || '-') + '`\n' +
      '🔗 URL:\n' + (t.url || '-')
    );
  });
  return (
    '📡 *DEX API STATUS*\n' +
    'Total APIs: *' + names.length + '*\n' +
    'Host: `' + QASIM + '`\n\n' +
    blocks.join('\n\n') +
    '\n\nTest: `.dexapi test` | `.dexapi show <name>` | `.dexapi cat`'
  );
}

function listCategories() {
  const all = listAll();
  const cats = {};
  for (const [n, t] of Object.entries(all)) {
    const c = t.category || 'Other';
    cats[c] = cats[c] || [];
    cats[c].push(n);
  }
  return cats;
}


/** Resolve a named API with variables — used by downloadApis / plugins */
function resolveUrl(name, vars = {}) {
  const all = listAll();
  const tpl = all[name];
  if (!tpl || tpl.disabled) return null;
  return fillUrl(tpl, vars);
}

async function fetchNamed(name, vars = {}) {
  const all = listAll();
  const tpl = all[name];
  if (!tpl || tpl.disabled) {
    return { ok: false, error: 'API not found or disabled: ' + name };
  }
  const url = fillUrl(tpl, vars);
  try {
    const axios = require('axios');
    const r = await axios({
      method: (tpl.method || 'GET').toLowerCase(),
      url,
      timeout: 45000,
      validateStatus: () => true,
      headers: { 'User-Agent': 'QUEEN-AKUMA-dexapi/1.0', Accept: 'application/json, */*' }
    });
    if (r.status >= 400) {
      return { ok: false, status: r.status, error: (r.data && (r.data.message || r.data.error)) || r.statusText, url, data: r.data };
    }
    return { ok: true, status: r.status, url, data: r.data };
  } catch (e) {
    return { ok: false, error: e.message, url };
  }
}

function setBaseAndKey(base, key) {
  const d = load();
  if (base) d.base = String(base).replace(/\/$/, '');
  if (key) d.key = String(key);
  save(d);
  // also patch env for this process
  if (base) process.env.DEMON_API_BASE = d.base;
  if (key) process.env.DEMON_API_KEY = d.key;
  return d;
}

function getRuntimeConfig() {
  const d = load();
  return {
    base: d.base || process.env.DEMON_API_BASE || QASIM,
    key: d.key || process.env.DEMON_API_KEY || QKEY
  };
}

function enableApi(name, on) {
  const d = load();
  const all = { ...d.templates, ...d.custom };
  if (!all[name] && !d.templates[name] && !d.custom[name]) return false;
  if (d.custom[name]) {
    if (on) delete d.custom[name].disabled;
    else d.custom[name].disabled = true;
  } else {
    d.custom[name] = { ...(d.templates[name] || {}), disabled: !on };
  }
  save(d);
  return true;
}



/**
 * Multi-URL race/failover:
 * tries primary + fallbacks; skips slow (>slowMs) and failed; returns first OK
 */
async function fetchNamedFast(name, vars = {}, { slowMs = 8000, timeoutMs = 15000 } = {}) {
  const all = listAll();
  const tpl = all[name];
  if (!tpl || tpl.disabled) {
    return { ok: false, error: 'API not found or disabled: ' + name };
  }
  const urls = [];
  const primary = fillUrl(tpl, vars);
  if (primary) urls.push(primary);
  const fbs = tpl.fallbacks || tpl.mirrors || [];
  for (const fb of fbs) {
    let u = String(fb);
    const key = process.env.DEMON_API_KEY || (getRuntimeConfig && getRuntimeConfig().key) || '';
    const map = { key, ...(tpl.sample || {}), ...vars };
    for (const [k, v] of Object.entries(map)) {
      u = u.replace(new RegExp('\\{' + k + '\\}', 'g'), encodeURIComponent(String(v ?? '')));
    }
    if (u && !urls.includes(u)) urls.push(u);
  }
  // also try related names for ytmp4/youtube
  if (name === 'ytmp4' || name === 'youtube') {
    for (const alt of ['ytmp4', 'youtube', 'download']) {
      if (alt === name) continue;
      const u = resolveUrl(alt, vars);
      if (u && !urls.includes(u)) urls.push(u);
    }
  }
  if (name === 'blackbox' || name === 'ai') {
    for (const alt of ['blackbox', 'ai']) {
      if (alt === name) continue;
      const u = resolveUrl(alt, vars);
      if (u && !urls.includes(u)) urls.push(u);
    }
  }

  const axios = require('axios');
  const errors = [];

  for (const url of urls) {
    const started = Date.now();
    try {
      const r = await axios({
        method: (tpl.method || 'GET').toLowerCase(),
        url,
        timeout: timeoutMs,
        validateStatus: () => true,
        headers: { 'User-Agent': 'QUEEN-AKUMA-dexapi/1.0', Accept: 'application/json, */*' }
      });
      const ms = Date.now() - started;
      if (r.status >= 400) {
        errors.push({ url, ms, error: 'HTTP ' + r.status });
        continue;
      }
      // treat empty as fail
      if (r.data == null || r.data === '') {
        errors.push({ url, ms, error: 'empty body' });
        continue;
      }
      if (ms > slowMs && urls.indexOf(url) < urls.length - 1) {
        // slow but OK — keep as candidate but try next for faster
        // actually if OK within timeout, accept first success
      }
      return { ok: true, status: r.status, ms, url, data: r.data, tried: errors.length + 1 };
    } catch (e) {
      errors.push({ url, ms: Date.now() - started, error: e.message });
    }
  }
  return { ok: false, error: 'All endpoints failed', errors };
}


module.exports = {
  load, save, listAll, setTemplate, removeTemplate,
  setPassword, getPassword, testEndpoint, testAll,
  fillUrl, formatStatus, listCategories, DEFAULT_TEMPLATES, resolveUrl, fetchNamed, fetchNamedFast, setBaseAndKey, getRuntimeConfig, enableApi
};
