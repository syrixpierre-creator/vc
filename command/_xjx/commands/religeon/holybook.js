const axios = require("axios");
const SURAH_NAMES = ['', 'Al-Fatihah', "Al-Baqarah", "Ali Imran", "An-Nisa", 'Al-Maidah', "Al-Anam", "Al-Araf", 'Al-Anfal', "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Rad", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", 'Al-Kahf', 'Maryam', "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Muminun", "An-Nur", 'Al-Furqan', "Ash-Shuara", "An-Naml", "Al-Qasas", 'Al-Ankabut', "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", 'Saba', 'Fatir', "Ya-Sin", "As-Saffat", "Sad", 'Az-Zumar', 'Ghafir', 'Fussilat', "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", 'Al-Jathiyah', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', "Al-Hujurat", "Qaf", 'Ad-Dhariyat', 'At-Tur', 'An-Najm', "Al-Qamar", "Ar-Rahman", "Al-Waqiah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", 'As-Saf', "Al-Jumuah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", 'Al-Mulk', "Al-Qalam", "Al-Haqqah", "Al-Maarij", 'Nuh', 'Al-Jinn', "Al-Muzzammil", 'Al-Muddathir', "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Naziat", "Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", 'At-Tariq', 'Al-Ala', 'Al-Ghashiyah', "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", 'Ad-Duha', 'Ash-Sharh', "At-Tin", "Al-Alaq", 'Al-Qadr', "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", 'Al-Qariah', 'At-Takathur', "Al-Asr", 'Al-Humazah', "Al-Fil", "Quraysh", "Al-Maun", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", 'An-Nas'];
const GITA_CHAPTER_NAMES = ['', "Arjuna Vishada Yoga", "Sankhya Yoga", "Karma Yoga", "Jnana Karma Sanyasa Yoga", "Karma Vairagya Yoga", "Abhyasa Yoga", "Paramahamsa Vijnana Yoga", "Aksara Parabrahma Yoga", "Raja Vidya Raja Guhya Yoga", "Vibhuti Yoga", "Visvarupa Darsana Yoga", "Bhakti Yoga", "Ksetra Ksetrajna Vibhaga Yoga", "Gunatraya Vibhaga Yoga", "Purusottama Yoga", "Daivasura Sampad Vibhaga Yoga", "Shraddhatraya Vibhaga Yoga", "Moksha Sanyasa Yoga"];
module.exports = [{
  'name': "bible",
  'aliases': ["verse", "scripture", "bibleverse"],
  'category': "religion",
  'description': "Look up a Bible verse or passage",
  'usage': ".bible <reference>  e.g. .bible John 3:16",
  async 'execute'(v1, v2, v3, {
    reply: v4,
    react: v5
  }) {
    if (!v3.length) {
      return v4("❌ Usage: *.bible John 3:16*");
    }
    await v5('📖');
    const v6 = v2.key.remoteJid;
    try {
      const v7 = v3.join(" ").trim();
      const {
        data: v8
      } = await axios.get("https://bible-api.com/" + encodeURIComponent(v7));
      const v9 = "📖 *The Holy Bible*\n━━━━━━━━━━━━━━━\n" + ("*Reference:* " + v8.reference + "\n") + ("*Translation:* " + v8.translation_name + "\n") + ("*Verses:* " + v8.verses.length + "\n\n") + ('' + v8.text.trim());
      await v1.sendMessage(v6, {
        'text': v9
      }, {
        'quoted': v2
      });
    } catch {
      v4("❌ Could not find that reference.\nExample: *.bible John 3:16*");
    }
  }
}, {
  'name': "biblelist",
  'aliases': ["biblebooks"],
  'category': "religion",
  'description': "Show the complete list of Bible books",
  'usage': ".biblelist",
  async 'execute'(v10, v11, v12, {
    reply: v13
  }) {
    const v14 = v11.key.remoteJid;
    try {
      await v10.sendMessage(v14, {
        'image': {
          'url': "https://files.catbox.moe/ptpl5c.jpeg"
        },
        'caption': "📖 *Complete Bible Book List*\n\n📜 *Old Testament (39 books)*\nGenesis · Exodus · Leviticus · Numbers · Deuteronomy · Joshua · Judges · Ruth · 1 Samuel · 2 Samuel · 1 Kings · 2 Kings · 1 Chronicles · 2 Chronicles · Ezra · Nehemiah · Esther · Job · Psalms · Proverbs · Ecclesiastes · Song of Solomon · Isaiah · Jeremiah · Lamentations · Ezekiel · Daniel · Hosea · Joel · Amos · Obadiah · Jonah · Micah · Nahum · Habakkuk · Zephaniah · Haggai · Zechariah · Malachi\n\n📖 *New Testament (27 books)*\nMatthew · Mark · Luke · John · Acts · Romans · 1 Corinthians · 2 Corinthians · Galatians · Ephesians · Philippians · Colossians · 1 Thessalonians · 2 Thessalonians · 1 Timothy · 2 Timothy · Titus · Philemon · Hebrews · James · 1 Peter · 2 Peter · 1 John · 2 John · 3 John · Jude · Revelation"
      }, {
        'quoted': v11
      });
    } catch {
      v13("📖 *Complete Bible Book List*\n\n📜 *Old Testament (39 books)*\nGenesis · Exodus · Leviticus · Numbers · Deuteronomy · Joshua · Judges · Ruth · 1 Samuel · 2 Samuel · 1 Kings · 2 Kings · 1 Chronicles · 2 Chronicles · Ezra · Nehemiah · Esther · Job · Psalms · Proverbs · Ecclesiastes · Song of Solomon · Isaiah · Jeremiah · Lamentations · Ezekiel · Daniel · Hosea · Joel · Amos · Obadiah · Jonah · Micah · Nahum · Habakkuk · Zephaniah · Haggai · Zechariah · Malachi\n\n📖 *New Testament (27 books)*\nMatthew · Mark · Luke · John · Acts · Romans · 1 Corinthians · 2 Corinthians · Galatians · Ephesians · Philippians · Colossians · 1 Thessalonians · 2 Thessalonians · 1 Timothy · 2 Timothy · Titus · Philemon · Hebrews · James · 1 Peter · 2 Peter · 1 John · 2 John · 3 John · Jude · Revelation");
    }
  }
}, {
  'name': 'biblerandom',
  'aliases': ["rvs", "randomverse", "devotion"],
  'category': 'religion',
  'description': "Get a random Bible verse",
  'usage': ".biblerandom",
  async 'execute'(v15, v16, v17, {
    reply: v18,
    react: v19
  }) {
    await v19('🙏');
    const v20 = v16.key.remoteJid;
    const v21 = ["John 3:16", "Psalm 23:1", "Proverbs 3:5", "Romans 8:28", "Philippians 4:13", "Isaiah 40:31", "Jeremiah 29:11", "Matthew 6:33", "Psalm 46:1", "Romans 8:38", "Joshua 1:9", "1 Corinthians 13:4", "Psalm 121:1", "John 14:6", "Hebrews 11:1", "Galatians 5:22", "Psalm 27:1", "Matthew 5:9", "Romans 12:2", "2 Timothy 1:7"];
    const v22 = v21[Math.floor(Math.random() * v21.length)];
    try {
      const {
        data: v23
      } = await axios.get("https://bible-api.com/" + encodeURIComponent(v22));
      const v24 = "✨ *Daily Bible Verse*\n━━━━━━━━━━━━━━━\n" + ('*' + v23.reference + "*\n\n") + ("_\"" + v23.text.trim() + "\"_\n\n") + ("📖 " + v23.translation_name);
      await v15.sendMessage(v20, {
        'text': v24
      }, {
        'quoted': v16
      });
    } catch {
      v18("❌ Could not fetch a verse. Try again.");
    }
  }
}, {
  'name': "quran",
  'aliases': ["surah"],
  'category': "religion",
  'description': "Get a Quran surah with English translation and recitation audio",
  'usage': ".quran <surah 1-114>",
  async 'execute'(v25, v26, v27, {
    reply: v28,
    react: v29
  }) {
    const v30 = v26.key.remoteJid;
    const v31 = parseInt(v27[0]);
    if (!v27[0] || isNaN(v31) || v31 < 1 || v31 > 114) {
      return v28("❌ Usage: *.quran <number>*  (1–114)\nExample: *.quran 1*");
    }
    await v29('🕌');
    try {
      const {
        data: v32
      } = await axios.get("https://api.alquran.cloud/v1/surah/" + v31 + "/editions/quran-uthmani,en.sahih");
      const v33 = v32.data[0];
      const v34 = v32.data[1];
      const v35 = SURAH_NAMES[v31] || v33.englishName;
      const v36 = v34.ayahs.slice(0, 3).map(v37 => '[' + v37.numberInSurah + "] " + v37.text).join("\n");
      const v38 = "🕌 *Surah " + v31 + ": " + v35 + "*\n" + "━━━━━━━━━━━━━━━\n" + ("*Arabic Name:* " + v33.name + "\n") + ("*Revelation:* " + v33.revelationType + "\n") + ("*Total Ayahs:* " + v33.numberOfAyahs + "\n\n") + ("📝 *Translation (first 3 ayahs):*\n" + v36 + "\n\n") + ("_Use .ayah " + v31 + ":<number> for a specific verse_");
      await v25.sendMessage(v30, {
        'text': v38
      }, {
        'quoted': v26
      });
      const v39 = "https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/" + v31 + ".mp3";
      await v25.sendMessage(v30, {
        'audio': {
          'url': v39
        },
        'mimetype': "audio/mp4",
        'ptt': true
      }, {
        'quoted': v26
      });
    } catch (v40) {
      v28("❌ Error fetching Surah: " + v40.message);
    }
  }
}, {
  'name': "ayah",
  'aliases': ["verse2", "qverse"],
  'category': "religion",
  'description': "Get a specific Quran ayah with Arabic and English",
  'usage': ".ayah <surah>:<ayah>  e.g. .ayah 2:255",
  async 'execute'(v41, v42, v43, {
    reply: v44,
    react: v45
  }) {
    const v46 = v42.key.remoteJid;
    const v47 = v43[0] || '';
    const v48 = v47.match(/^(\d+):(\d+)$/);
    if (!v48) {
      return v44("❌ Usage: *.ayah <surah>:<ayah>*\nExample: *.ayah 2:255*");
    }
    const [, v49, v50] = v48;
    await v45('📿');
    try {
      const {
        data: v51
      } = await axios.get("https://api.alquran.cloud/v1/ayah/" + v49 + ':' + v50 + '/editions/quran-uthmani,en.sahih');
      const v52 = v51.data[0];
      const v53 = v51.data[1];
      const v54 = SURAH_NAMES[parseInt(v49)] || v52.surah?.["englishName"] || '';
      const v55 = "📿 *Quran — " + v54 + " " + v49 + ':' + v50 + "*\n" + "━━━━━━━━━━━━━━━\n" + ("🔤 *Arabic:*\n" + v52.text + "\n\n") + ("📖 *English (Sahih Int'l):*\n" + v53.text);
      await v41.sendMessage(v46, {
        'text': v55
      }, {
        'quoted': v42
      });
    } catch (v56) {
      v44("❌ Could not find that ayah.\nCheck: surah (1–114), ayah number.\nError: " + v56.message);
    }
  }
}, {
  'name': 'quranrandom',
  'aliases': ["randomayah", "qrandom"],
  'category': "religion",
  'description': "Get a random Quran ayah",
  'usage': ".quranrandom",
  async 'execute'(v57, v58, v59, {
    reply: v60,
    react: v61
  }) {
    const v62 = v58.key.remoteJid;
    await v61('🌙');
    const v63 = Math.floor(Math.random() * 6236) + 1;
    try {
      const {
        data: v64
      } = await axios.get("https://api.alquran.cloud/v1/ayah/" + v63 + '/editions/quran-uthmani,en.sahih');
      const v65 = v64.data[0];
      const v66 = v64.data[1];
      const v67 = v65.surah.number + ':' + v65.numberInSurah;
      const v68 = SURAH_NAMES[v65.surah.number] || v65.surah.englishName;
      const v69 = "🌙 *Random Ayah — " + v68 + " (" + v67 + ")*\n" + "━━━━━━━━━━━━━━━\n" + ("🔤 *Arabic:*\n" + v65.text + "\n\n") + ("📖 *English:*\n_\"" + v66.text + "\"_");
      await v57.sendMessage(v62, {
        'text': v69
      }, {
        'quoted': v58
      });
    } catch (v70) {
      v60("❌ Error: " + v70.message);
    }
  }
}, {
  'name': "gita",
  'aliases': ["bhagavadgita", "shlok", "slok"],
  'category': "religion",
  'description': "Get a Bhagavad Gita shlok with Sanskrit, transliteration and meaning",
  'usage': ".gita <chapter>:<verse>  e.g. .gita 2:47",
  async 'execute'(v71, v72, v73, {
    reply: v74,
    react: v75
  }) {
    const v76 = v72.key.remoteJid;
    const v77 = v73[0] || '';
    const v78 = v77.match(/^(\d+):(\d+)$/);
    if (!v78) {
      return v74("❌ Usage: *.gita <chapter>:<verse>*\nExample: *.gita 2:47* (18 chapters)");
    }
    const [, v79, v80] = v78;
    await v75('🪔');
    try {
      const {
        data: v81
      } = await axios.get("https://vedicscriptures.github.io/slok/" + v79 + '/' + v80);
      if (!v81 || !v81.slok) {
        return v74("❌ Verse not found. Check chapter (1–18) and verse number.");
      }
      const v82 = GITA_CHAPTER_NAMES[parseInt(v79)] || "Chapter " + v79;
      const v83 = v81.tej?.['ht'] || v81.siva?.['et'] || v81.purohit?.['et'] || v81.gambir?.['et'] || "_(no English meaning available)_";
      const v84 = "🪔 *Bhagavad Gita " + v79 + '.' + v80 + "*\n" + ("📚 _" + v82 + "_\n") + "━━━━━━━━━━━━━━━\n" + ("🔤 *Sanskrit (Devanagari):*\n" + v81.slok + "\n\n") + ("🔡 *Transliteration:*\n" + (v81.transliteration || '—') + "\n\n") + ("📖 *Meaning (English):*\n" + v83);
      await v71.sendMessage(v76, {
        'text': v84
      }, {
        'quoted': v72
      });
    } catch (v85) {
      v74("❌ Error fetching shlok: " + v85.message);
    }
  }
}, {
  'name': "gitarandom",
  'aliases': ["randomshlok", "krishna"],
  'category': "religion",
  'description': "Get a random Bhagavad Gita shlok",
  'usage': '.gitarandom',
  async 'execute'(v86, v87, v88, {
    reply: v89,
    react: v90
  }) {
    const v91 = v87.key.remoteJid;
    await v90('🪔');
    const v92 = [0, 47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
    const v93 = Math.floor(Math.random() * 18) + 1;
    const v94 = Math.floor(Math.random() * v92[v93]) + 1;
    try {
      const {
        data: v95
      } = await axios.get("https://vedicscriptures.github.io/slok/" + v93 + '/' + v94);
      if (!v95?.['slok']) {
        return v89("❌ Could not fetch a shlok. Try again.");
      }
      const v96 = v95.tej?.['ht'] || v95.siva?.['et'] || v95.purohit?.['et'] || "_(no meaning available)_";
      const v97 = GITA_CHAPTER_NAMES[v93] || "Chapter " + v93;
      const v98 = "🪔 *Bhagavad Gita " + v93 + '.' + v94 + "*\n" + ("📚 _" + v97 + "_\n") + "━━━━━━━━━━━━━━━\n" + ("🔤 *Sanskrit:*\n" + v95.slok + "\n\n") + ("📖 *Meaning:*\n_\"" + v96 + "\"_");
      await v86.sendMessage(v91, {
        'text': v98
      }, {
        'quoted': v87
      });
    } catch (v99) {
      v89("❌ Error: " + v99.message);
    }
  }
}, {
  'name': "gitachapter",
  'aliases': ["gitainfo", "chapter"],
  'category': "religion",
  'description': "Get summary and details of a Bhagavad Gita chapter",
  'usage': ".gitachapter <1-18>",
  async 'execute'(v100, v101, v102, {
    reply: v103,
    react: v104
  }) {
    const v105 = v101.key.remoteJid;
    const v106 = parseInt(v102[0]);
    if (!v102[0] || isNaN(v106) || v106 < 1 || v106 > 18) {
      return v103("❌ Usage: *.gitachapter <number>*  (1–18)");
    }
    await v104('📚');
    try {
      const {
        data: v107
      } = await axios.get("https://vedicscriptures.github.io/chapter/" + v106);
      if (!v107) {
        return v103("❌ Chapter not found.");
      }
      const v108 = "📚 *Bhagavad Gita — Chapter " + v106 + "*\n" + "━━━━━━━━━━━━━━━\n" + ("*Name:* " + (v107.translation || GITA_CHAPTER_NAMES[v106]) + "\n") + ("*Sanskrit:* " + (v107.name || '—') + "\n") + ("*Transliteration:* " + (v107.transliteration || '—') + "\n") + ("*Total Verses:* " + (v107.verses_count || '—') + "\n\n") + ("📖 *Summary:*\n" + (v107.summary?.['en'] || '—').slice(0, 700) + "...");
      await v100.sendMessage(v105, {
        'text': v108
      }, {
        'quoted': v101
      });
    } catch (v109) {
      v103("❌ Error: " + v109.message);
    }
  }
}];
