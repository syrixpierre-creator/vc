const axios = require('axios');
const FormData = require('form-data');
const {
  downloadMediaMessage
} = require("@whiskeysockets/baileys");
function cleanResult(v1) {
  if (v1 == null) {
    return '';
  }
  if (typeof v1 === "string") {
    return v1.trim();
  }
  if (typeof v1 === 'number' || typeof v1 === "boolean") {
    return String(v1);
  }
  if (Array.isArray(v1)) {
    return v1.map(v2 => cleanResult(v2)).filter(Boolean).join("\n\n");
  }
  if (typeof v1 === 'object') {
    const v3 = v1.text ?? v1.message ?? v1.response ?? v1.answer ?? v1.result ?? v1.output ?? v1.content ?? v1.reply ?? null;
    if (v3 != null) {
      return cleanResult(v3);
    }
    return Object.entries(v1).filter(([, v4]) => v4 != null && typeof v4 !== "object").map(([v5, v6]) => v5 + ": " + v6).join("\n") || JSON.stringify(v1);
  }
  return String(v1);
}
async function ravenn(v7, v8 = {}) {
  const {
    data: v9
  } = await axios.get(v7, {
    'params': v8,
    'timeout': 0xea60
  });
  if (!v9.status) {
    throw new Error(v9.error || "Service temporarily unavailable");
  }
  if (v9.result && typeof v9.result === 'object' && v9.result.status === false) {
    throw new Error(v9.result.error || "API error from upstream");
  }
  return v9.result;
}
async function ravennBinary(v10, v11 = {}) {
  const v12 = await axios.get(v10, {
    'params': v11,
    'responseType': "arraybuffer",
    'timeout': 0xea60
  });
  const v13 = Buffer.from(v12.data);
  if (v13.length < 2048) {
    try {
      const v14 = JSON.parse(v13.toString("utf8"));
      if (v14 && v14.status === false) {
        throw new Error(v14.error || "API returned an error instead of an image");
      }
    } catch (v15) {
      if (v15.message !== "Unexpected token" && !v15.message.startsWith("Unexpected end")) {
        throw v15;
      }
    }
  }
  return v13;
}
async function uploadToUguu(v16, v17 = "image.jpg", v18 = "image/jpeg") {
  const v19 = new FormData();
  v19.append("files[]", v16, {
    'filename': v17,
    'contentType': v18
  });
  const {
    data: v20
  } = await axios.post("https://uguu.se/upload", v19, {
    'headers': v19.getHeaders(),
    'timeout': 0x7530
  });
  const v21 = Array.isArray(v20) ? v20[0] : Array.isArray(v20?.["files"]) ? v20.files[0] : null;
  const v22 = v21?.["url"];
  if (!v22) {
    throw new Error("Failed to upload file to Uguu");
  }
  return v22;
}
async function resolveImageUrl(v23, v24, v25) {
  if (v25[0] && /^https?:\/\//i.test(v25[0])) {
    return {
      'url': v25[0],
      'remainingArgs': v25.slice(1)
    };
  }
  const v26 = v24.message?.['extendedTextMessage']?.["contextInfo"];
  const v27 = v26?.['quotedMessage'];
  const v28 = v27?.['imageMessage'] || v27?.["stickerMessage"];
  if (!v28) {
    return {
      'url': null,
      'remainingArgs': v25
    };
  }
  const v29 = {
    'key': {
      'remoteJid': v24.key.remoteJid,
      'id': v26.stanzaId,
      'participant': v26.participant
    },
    'message': v27
  };
  const v30 = await downloadMediaMessage(v29, 'buffer', {}, {
    'logger': undefined,
    'reuploadRequest': v23.updateMediaMessage
  });
  if (!v30 || !v30.length) {
    throw new Error("Could not download image from the replied message");
  }
  const v31 = await uploadToUguu(v30);
  return {
    'url': v31,
    'remainingArgs': v25
  };
}
async function resolveAudioUrl(v32, v33, v34) {
  if (v34[0] && /^https?:\/\//i.test(v34[0])) {
    return {
      'url': v34[0],
      'remainingArgs': v34.slice(1)
    };
  }
  const v35 = v33.message?.['extendedTextMessage']?.["contextInfo"];
  const v36 = v35?.['quotedMessage'];
  const v37 = v36?.["audioMessage"];
  if (!v37) {
    return {
      'url': null,
      'remainingArgs': v34
    };
  }
  const v38 = {
    'key': {
      'remoteJid': v33.key.remoteJid,
      'id': v35.stanzaId,
      'participant': v35.participant
    },
    'message': v36
  };
  const v39 = await downloadMediaMessage(v38, "buffer", {}, {
    'logger': undefined,
    'reuploadRequest': v32.updateMediaMessage
  });
  if (!v39 || !v39.length) {
    throw new Error("Could not download audio from the replied message");
  }
  const v40 = v37.mimetype || "audio/ogg";
  const v41 = v40.includes("mpeg") ? 'mp3' : v40.includes("mp4") ? "m4a" : "ogg";
  const v42 = await uploadToUguu(v39, "audio." + v41, v40);
  return {
    'url': v42,
    'remainingArgs': v34
  };
}
module.exports = [{
  'name': 'ai',
  'aliases': ['keithai', "supremeai"],
  'category': 'ai',
  'description': "Ask Keith AI (custom model) a question",
  'usage': ".ai <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/keithai",
  async 'execute'(v43, v44, v45, v46) {
    const v47 = v45.join(" ").trim();
    if (!v47) {
      return v46.reply("❌ Please provide a question\n\nExample: .ai How does the internet work?");
    }
    await v43.sendMessage(v44.key.remoteJid, {
      'react': {
        'text': '⚡',
        'key': v44.key
      }
    });
    try {
      const v48 = await ravenn(this.apiUrl, {
        'q': v47
      });
      await v43.sendMessage(v44.key.remoteJid, {
        'text': "⚡ *Keith AI*\n\n" + cleanResult(v48)
      }, {
        'quoted': v44
      });
      await v43.sendMessage(v44.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v44.key
        }
      });
    } catch (v49) {
      console.error("[keithai]", v49.message);
      await v43.sendMessage(v44.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v44.key
        }
      });
      v46.reply("❌ Keith AI error: " + v49.message);
    }
  }
}, {
  'name': "chatgpt",
  'aliases': ["gpt", "gpt2", "gptai"],
  'category': 'ai',
  'description': "Ask GPT AI a question",
  'usage': ".chatgpt <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/gpt",
  async 'execute'(v50, v51, v52, v53) {
    const v54 = v52.join(" ").trim();
    if (!v54) {
      return v53.reply("❌ Please provide a question\n\nExample: .chatgpt What is JavaScript?");
    }
    await v50.sendMessage(v51.key.remoteJid, {
      'react': {
        'text': '🤖',
        'key': v51.key
      }
    });
    try {
      const v55 = await ravenn(this.apiUrl, {
        'q': v54
      });
      await v50.sendMessage(v51.key.remoteJid, {
        'text': "🤖 *ChatGPT*\n\n" + cleanResult(v55)
      }, {
        'quoted': v51
      });
      await v50.sendMessage(v51.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v51.key
        }
      });
    } catch (v56) {
      console.error("[chatgpt]", v56.message);
      await v50.sendMessage(v51.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v51.key
        }
      });
      v53.reply("❌ ChatGPT error: " + v56.message);
    }
  }
}, {
  'name': "gpt4o",
  'aliases': ["gpt4", "chatgpt4", "gpt4nano", "gpt41nano"],
  'category': 'ai',
  'description': "Ask GPT-4 a question",
  'usage': ".gpt4o <question>",
  'apiUrl': 'https://apiskeith2-production-3020.up.railway.app/ai/chatgpt4',
  async 'execute'(v57, v58, v59, v60) {
    const v61 = v59.join(" ").trim();
    if (!v61) {
      return v60.reply("❌ Please provide a question\n\nExample: .gpt4o How does a black hole form?");
    }
    await v57.sendMessage(v58.key.remoteJid, {
      'react': {
        'text': '🤖',
        'key': v58.key
      }
    });
    try {
      const v62 = await ravenn(this.apiUrl, {
        'q': v61
      });
      await v57.sendMessage(v58.key.remoteJid, {
        'text': "🤖 *GPT-4*\n\n" + cleanResult(v62)
      }, {
        'quoted': v58
      });
      await v57.sendMessage(v58.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v58.key
        }
      });
    } catch (v63) {
      console.error('[gpt4o]', v63.message);
      await v57.sendMessage(v58.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v58.key
        }
      });
      v60.reply("❌ GPT-4 error: " + v63.message);
    }
  }
}, {
  'name': "claude",
  'aliases': ["claudeai"],
  'category': 'ai',
  'description': "Ask Claude AI a question",
  'usage': ".claude <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/claudeai",
  async 'execute'(v64, v65, v66, v67) {
    const v68 = v66.join(" ").trim();
    if (!v68) {
      return v67.reply("❌ Please provide a question\n\nExample: .claude Explain recursion");
    }
    await v64.sendMessage(v65.key.remoteJid, {
      'react': {
        'text': '🧠',
        'key': v65.key
      }
    });
    try {
      const v69 = await ravenn(this.apiUrl, {
        'q': v68
      });
      await v64.sendMessage(v65.key.remoteJid, {
        'text': "🧠 *Claude AI*\n\n" + cleanResult(v69)
      }, {
        'quoted': v65
      });
      await v64.sendMessage(v65.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v65.key
        }
      });
    } catch (v70) {
      console.error("[claude]", v70.message);
      await v64.sendMessage(v65.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v65.key
        }
      });
      v67.reply("❌ Claude AI error: " + v70.message);
    }
  }
}, {
  'name': "gemini",
  'aliases': ['geminai'],
  'category': 'ai',
  'description': "Ask Google Gemini a question",
  'usage': ".gemini <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/gemini",
  async 'execute'(v71, v72, v73, v74) {
    const v75 = v73.join(" ").trim();
    if (!v75) {
      return v74.reply("❌ Please provide a question\n\nExample: .gemini Explain quantum physics");
    }
    await v71.sendMessage(v72.key.remoteJid, {
      'react': {
        'text': '♊',
        'key': v72.key
      }
    });
    try {
      const v76 = await ravenn(this.apiUrl, {
        'q': v75
      });
      await v71.sendMessage(v72.key.remoteJid, {
        'text': "♊ *Google Gemini*\n\n" + cleanResult(v76)
      }, {
        'quoted': v72
      });
      await v71.sendMessage(v72.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v72.key
        }
      });
    } catch (v77) {
      console.error("[gemini]", v77.message);
      await v71.sendMessage(v72.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v72.key
        }
      });
      v74.reply("❌ Gemini error: " + v77.message);
    }
  }
}, {
  'name': 'mistral',
  'aliases': ['mistralai'],
  'category': 'ai',
  'description': "Ask Mistral AI a question",
  'usage': ".mistral <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/mistral",
  async 'execute'(v78, v79, v80, v81) {
    const v82 = v80.join(" ").trim();
    if (!v82) {
      return v81.reply("❌ Please provide a question\n\nExample: .mistral What is machine learning?");
    }
    await v78.sendMessage(v79.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v79.key
      }
    });
    try {
      const v83 = await ravenn(this.apiUrl, {
        'q': v82
      });
      await v78.sendMessage(v79.key.remoteJid, {
        'text': "🔍 *Mistral AI*\n\n" + cleanResult(v83)
      }, {
        'quoted': v79
      });
      await v78.sendMessage(v79.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v79.key
        }
      });
    } catch (v84) {
      console.error("[mistral]", v84.message);
      await v78.sendMessage(v79.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v79.key
        }
      });
      v81.reply("❌ Mistral AI error: " + v84.message);
    }
  }
}, {
  'name': "copilot",
  'aliases': ["microsoftai"],
  'category': 'ai',
  'description': "Ask Microsoft Copilot a question",
  'usage': ".copilot <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/copilot",
  async 'execute'(v85, v86, v87, v88) {
    const v89 = v87.join(" ").trim();
    if (!v89) {
      return v88.reply("❌ Please provide a question\n\nExample: .copilot How are you?");
    }
    await v85.sendMessage(v86.key.remoteJid, {
      'react': {
        'text': '🪟',
        'key': v86.key
      }
    });
    try {
      const v90 = await ravenn(this.apiUrl, {
        'q': v89
      });
      await v85.sendMessage(v86.key.remoteJid, {
        'text': "🪟 *Microsoft Copilot*\n\n" + cleanResult(v90)
      }, {
        'quoted': v86
      });
      await v85.sendMessage(v86.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v86.key
        }
      });
    } catch (v91) {
      console.error("[copilot]", v91.message);
      await v85.sendMessage(v86.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v86.key
        }
      });
      v88.reply("❌ Copilot error: " + v91.message);
    }
  }
}, {
  'name': "metaai",
  'aliases': ['meta', 'metalai'],
  'category': 'ai',
  'description': "Ask Meta AI a question",
  'usage': ".metaai <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/metai",
  async 'execute'(v92, v93, v94, v95) {
    const v96 = v94.join(" ").trim();
    if (!v96) {
      return v95.reply("❌ Please provide a question\n\nExample: .metaai Hello, how are you?");
    }
    await v92.sendMessage(v93.key.remoteJid, {
      'react': {
        'text': '💭',
        'key': v93.key
      }
    });
    try {
      const v97 = await ravenn(this.apiUrl, {
        'q': v96
      });
      await v92.sendMessage(v93.key.remoteJid, {
        'text': "💭 *Meta AI*\n\n" + cleanResult(v97)
      }, {
        'quoted': v93
      });
      await v92.sendMessage(v93.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v93.key
        }
      });
    } catch (v98) {
      console.error("[metaai]", v98.message);
      await v92.sendMessage(v93.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v93.key
        }
      });
      v95.reply("❌ Meta AI error: " + v98.message);
    }
  }
}, {
  'name': "aiLlama",
  'aliases': ["llamaai", 'ilama', 'llama3'],
  'category': 'ai',
  'description': "Ask Llama AI a question",
  'usage': ".llama <question>",
  'apiUrl': 'https://apiskeith2-production-3020.up.railway.app/ai/ilama',
  async 'execute'(v99, v100, v101, v102) {
    const v103 = v101.join(" ").trim();
    if (!v103) {
      return v102.reply("❌ Please provide a question\n\nExample: .llama What is deep learning?");
    }
    await v99.sendMessage(v100.key.remoteJid, {
      'react': {
        'text': '🦙',
        'key': v100.key
      }
    });
    try {
      const v104 = await ravenn(this.apiUrl, {
        'q': v103
      });
      await v99.sendMessage(v100.key.remoteJid, {
        'text': "🦙 *Llama AI*\n\n" + cleanResult(v104)
      }, {
        'quoted': v100
      });
      await v99.sendMessage(v100.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v100.key
        }
      });
    } catch (v105) {
      console.error("[llama]", v105.message);
      await v99.sendMessage(v100.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v100.key
        }
      });
      v102.reply("❌ Llama AI error: " + v105.message);
    }
  }
}, {
  'name': 'blackbox',
  'aliases': ['bb', "blackboxai"],
  'category': 'ai',
  'description': "Ask Blackbox AI a question",
  'usage': ".blackbox <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/blackbox",
  async 'execute'(v106, v107, v108, v109) {
    const v110 = v108.join(" ").trim();
    if (!v110) {
      return v109.reply("❌ Please provide a question\n\nExample: .blackbox Explain recursion");
    }
    await v106.sendMessage(v107.key.remoteJid, {
      'react': {
        'text': '📦',
        'key': v107.key
      }
    });
    try {
      const v111 = await ravenn(this.apiUrl, {
        'q': v110
      });
      await v106.sendMessage(v107.key.remoteJid, {
        'text': "📦 *Blackbox AI*\n\n" + cleanResult(v111)
      }, {
        'quoted': v107
      });
      await v106.sendMessage(v107.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v107.key
        }
      });
    } catch (v112) {
      console.error("[blackbox]", v112.message);
      await v106.sendMessage(v107.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v107.key
        }
      });
      v109.reply("❌ Blackbox AI error: " + v112.message);
    }
  }
}, {
  'name': "bard",
  'aliases': ['googlebard'],
  'category': 'ai',
  'description': "Ask Google Bard a question",
  'usage': ".bard <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/bard",
  async 'execute'(v113, v114, v115, v116) {
    const v117 = v115.join(" ").trim();
    if (!v117) {
      return v116.reply("❌ Please provide a question\n\nExample: .bard Explain black holes");
    }
    await v113.sendMessage(v114.key.remoteJid, {
      'react': {
        'text': '✨',
        'key': v114.key
      }
    });
    try {
      const v118 = await ravenn(this.apiUrl, {
        'q': v117
      });
      await v113.sendMessage(v114.key.remoteJid, {
        'text': "✨ *Google Bard*\n\n" + cleanResult(v118)
      }, {
        'quoted': v114
      });
      await v113.sendMessage(v114.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v114.key
        }
      });
    } catch (v119) {
      console.error("[bard]", v119.message);
      await v113.sendMessage(v114.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v114.key
        }
      });
      v116.reply("❌ Bard error: " + v119.message);
    }
  }
}, {
  'name': "perplexity",
  'aliases': ["perplexai"],
  'category': 'ai',
  'description': "Ask Perplexity AI a question",
  'usage': ".perplexity <question>",
  'apiUrl': 'https://apiskeith2-production-3020.up.railway.app/ai/perplexity',
  async 'execute'(v120, v121, v122, v123) {
    const v124 = v122.join(" ").trim();
    if (!v124) {
      return v123.reply("❌ Please provide a question\n\nExample: .perplexity What is quantum computing?");
    }
    await v120.sendMessage(v121.key.remoteJid, {
      'react': {
        'text': '🔎',
        'key': v121.key
      }
    });
    try {
      const v125 = await ravenn(this.apiUrl, {
        'q': v124
      });
      await v120.sendMessage(v121.key.remoteJid, {
        'text': "🔎 *Perplexity AI*\n\n" + cleanResult(v125)
      }, {
        'quoted': v121
      });
      await v120.sendMessage(v121.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v121.key
        }
      });
    } catch (v126) {
      console.error('[perplexity]', v126.message);
      await v120.sendMessage(v121.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v121.key
        }
      });
      v123.reply("❌ Perplexity AI error: " + v126.message);
    }
  }
}, {
  'name': 'venice',
  'aliases': ["vai", "veniceai"],
  'category': 'ai',
  'description': "Ask Venice AI a question",
  'usage': ".venice <question>",
  'apiUrl': "https://apiskeith2-production-3020.up.railway.app/ai/venice",
  async 'execute'(v127, v128, v129, v130) {
    const v131 = v129.join(" ").trim();
    if (!v131) {
      return v130.reply("❌ Please provide a question\n\nExample: .venice What is life?");
    }
    await v127.sendMessage(v128.key.remoteJid, {
      'react': {
        'text': '🌊',
        'key': v128.key
      }
    });
    try {
      const v132 = await ravenn(this.apiUrl, {
        'q': v131
      });
      await v127.sendMessage(v128.key.remoteJid, {
        'text': "🌊 *Venice AI*\n\n" + cleanResult(v132)
      }, {
        'quoted': v128
      });
      await v127.sendMessage(v128.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v128.key
        }
      });
    } catch (v133) {
      console.error("[venice]", v133.message);
      await v127.sendMessage(v128.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v128.key
        }
      });
      v130.reply("❌ Venice AI error: " + v133.message);
    }
  }
}, {
  'name': 'o3',
  'aliases': ["o3ai", "openai03"],
  'category': 'ai',
  'description': "Ask O3 AI a question",
  'usage': ".o3 <question>",
  'apiUrl': 'https://apiskeith2-production-3020.up.railway.app/ai/o3',
  async 'execute'(v134, v135, v136, v137) {
    const v138 = v136.join(" ").trim();
    if (!v138) {
      return v137.reply("❌ Please provide a question\n\nExample: .o3 What is consciousness?");
    }
    await v134.sendMessage(v135.key.remoteJid, {
      'react': {
        'text': '🔵',
        'key': v135.key
      }
    });
    try {
      const v139 = await ravenn(this.apiUrl, {
        'q': v138
      });
      await v134.sendMessage(v135.key.remoteJid, {
        'text': "🔵 *O3 AI*\n\n" + cleanResult(v139)
      }, {
        'quoted': v135
      });
      await v134.sendMessage(v135.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v135.key
        }
      });
    } catch (v140) {
      console.error("[o3]", v140.message);
      await v134.sendMessage(v135.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v135.key
        }
      });
      v137.reply("❌ O3 AI error: " + v140.message);
    }
  }
}];
