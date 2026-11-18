const fetch = require("node-fetch");
const LANG_NAMES = {
  'af': "Afrikaans",
  'sq': "Albanian",
  'am': 'Amharic',
  'ar': "Arabic",
  'hy': "Armenian",
  'az': "Azerbaijani",
  'eu': "Basque",
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bs': "Bosnian",
  'bg': "Bulgarian",
  'ca': "Catalan",
  'ceb': "Cebuano",
  'ny': "Chichewa",
  'zh': "Chinese",
  'co': "Corsican",
  'hr': "Croatian",
  'cs': 'Czech',
  'da': "Danish",
  'nl': "Dutch",
  'en': 'English',
  'eo': "Esperanto",
  'et': "Estonian",
  'tl': "Filipino",
  'fi': "Finnish",
  'fr': "French",
  'fy': "Frisian",
  'gl': "Galician",
  'ka': "Georgian",
  'de': "German",
  'el': "Greek",
  'gu': 'Gujarati',
  'ht': "Haitian Creole",
  'ha': "Hausa",
  'haw': "Hawaiian",
  'iw': 'Hebrew',
  'hi': "Hindi",
  'hmn': "Hmong",
  'hu': "Hungarian",
  'is': "Icelandic",
  'ig': "Igbo",
  'id': "Indonesian",
  'ga': 'Irish',
  'it': "Italian",
  'ja': "Japanese",
  'jw': "Javanese",
  'kn': 'Kannada',
  'kk': "Kazakh",
  'km': "Khmer",
  'ko': 'Korean',
  'ku': "Kurdish",
  'ky': 'Kyrgyz',
  'lo': "Lao",
  'la': "Latin",
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'lb': "Luxembourgish",
  'mk': "Macedonian",
  'mg': "Malagasy",
  'ms': 'Malay',
  'ml': "Malayalam",
  'mt': "Maltese",
  'mi': "Maori",
  'mr': "Marathi",
  'mn': "Mongolian",
  'my': "Myanmar",
  'ne': 'Nepali',
  'no': "Norwegian",
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': "Polish",
  'pt': "Portuguese",
  'pa': "Punjabi",
  'ro': "Romanian",
  'ru': "Russian",
  'sm': "Samoan",
  'gd': "Scots Gaelic",
  'sr': "Serbian",
  'st': "Sesotho",
  'sn': "Shona",
  'sd': "Sindhi",
  'si': "Sinhala",
  'sk': "Slovak",
  'sl': "Slovenian",
  'so': "Somali",
  'es': "Spanish",
  'su': "Sundanese",
  'sw': "Swahili",
  'sv': "Swedish",
  'tg': "Tajik",
  'ta': "Tamil",
  'te': 'Telugu',
  'th': "Thai",
  'tr': "Turkish",
  'uk': "Ukrainian",
  'ur': "Urdu",
  'uz': "Uzbek",
  'vi': "Vietnamese",
  'cy': "Welsh",
  'xh': "Xhosa",
  'yi': "Yiddish",
  'yo': "Yoruba",
  'zu': "Zulu"
};
function getLangName(v1) {
  if (!v1 || v1 === "auto") {
    return 'Auto-detected';
  }
  return LANG_NAMES[v1.toLowerCase()] || v1.toUpperCase();
}
module.exports = {
  'name': "translate2",
  'aliases': ["trt2", "tr2"],
  'category': "utility",
  'description': "Translate text with source→target language note",
  'usage': ".translate2 <lang> (reply) | .translate2 <text> <lang>",
  async 'execute'(v2, v3, v4) {
    try {
      const v5 = v3.key.remoteJid;
      await v2.sendPresenceUpdate("composing", v5);
      let v6 = '';
      let v7 = '';
      const v8 = v3.message?.["extendedTextMessage"]?.["contextInfo"]?.["quotedMessage"];
      if (v8) {
        v6 = v8.conversation || v8.extendedTextMessage?.['text'] || v8.imageMessage?.["caption"] || v8.videoMessage?.["caption"] || '';
        v7 = v4.join(" ").trim() || 'en';
      } else {
        if (v4.length < 1) {
          return await v2.sendMessage(v5, {
            'text': "*TRANSLATOR 2*\n\n*Usage:*\n• Reply to a message: _.translate2 <lang>_\n• Direct: _.translate2 <text> <lang>_\n• No lang = defaults to English\n\n*Examples:*\n_.trt2 Bonjour fr_  →  translates to French\n_.trt2 Hello_  →  translates to English\n\n*Common codes:* en es fr de it pt ru ja ko zh ar hi sw"
          }, {
            'quoted': v3
          });
        }
        const v9 = v4[v4.length - 1];
        const v10 = /^[a-zA-Z]{2,5}$/.test(v9) && v4.length >= 2;
        if (v10) {
          v7 = v9.toLowerCase();
          v6 = v4.slice(0, -1).join(" ");
        } else {
          v7 = 'en';
          v6 = v4.join(" ");
        }
      }
      if (!v6.trim()) {
        return await v2.sendMessage(v5, {
          'text': "❌ No text to translate."
        }, {
          'quoted': v3
        });
      }
      let v11 = null;
      let v12 = null;
      try {
        const v13 = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + v7 + '&dt=t&ld&q=' + encodeURIComponent(v6));
        if (v13.ok) {
          const v14 = await v13.json();
          if (v14?.[0]?.[0]?.[0]) {
            v11 = v14[0].map(v15 => v15?.[0] || '').join('');
            v12 = v14?.[2] || null;
          }
        }
      } catch {}
      if (!v11) {
        try {
          const v16 = await fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(v6) + "&langpair=auto|" + v7);
          if (v16.ok) {
            const v17 = await v16.json();
            if (v17?.["responseData"]?.["translatedText"]) {
              v11 = v17.responseData.translatedText;
              const v18 = v17?.["responseData"]?.["detectedLanguage"];
              if (v18) {
                v12 = v18.split('|')[0].toLowerCase();
              }
            }
          }
        } catch {}
      }
      if (!v11) {
        try {
          const v19 = await fetch('https://api.dreaded.site/api/translate?text=' + encodeURIComponent(v6) + "&lang=" + v7);
          if (v19.ok) {
            const v20 = await v19.json();
            if (v20?.["translated"]) {
              v11 = v20.translated;
            }
          }
        } catch {}
      }
      if (!v11) {
        return await v2.sendMessage(v5, {
          'text': "❌ Translation failed. Please try again later."
        }, {
          'quoted': v3
        });
      }
      const v21 = getLangName(v12);
      const v22 = getLangName(v7);
      const v23 = v11 + "\n\n" + ('_(' + v21 + " → " + v22 + ')_');
      await v2.sendMessage(v5, {
        'text': v23
      }, {
        'quoted': v3
      });
    } catch (v24) {
      console.error("❌ Error in translate2 command:", v24);
      await v2.sendMessage(v3.key.remoteJid, {
        'text': "❌ Failed to translate. Please try again later."
      }, {
        'quoted': v3
      });
    }
  }
};
