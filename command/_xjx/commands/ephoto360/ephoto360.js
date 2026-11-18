const axios = require("axios");
const cheerio = require("cheerio");
const config = require("../../config");
async function ephoto(v1, v2) {
  let v3 = new FormData();
  let v4 = await axios.get(v1, {
    'headers': {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
    }
  });
  let v5 = cheerio.load(v4.data);
  let v6 = v5("input[name=token]").val();
  let v7 = v5("input[name=build_server]").val();
  let v8 = v5("input[name=build_server_id]").val();
  v3.append("text[]", v2);
  v3.append("token", v6);
  v3.append("build_server", v7);
  v3.append("build_server_id", v8);
  let v9 = await axios({
    'url': v1,
    'method': 'POST',
    'data': v3,
    'headers': {
      'Accept': "*/*",
      'Accept-Language': 'en-US,en;q=0.9',
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      'cookie': v4.headers["set-cookie"]?.["join"]("; "),
      'Content-Type': 'multipart/form-data'
    }
  });
  let v10 = cheerio.load(v9.data);
  let v11 = JSON.parse(v10("input[name=form_value_input]").val());
  v11["text[]"] = v11.text;
  delete v11.text;
  let {
    data: v12
  } = await axios.post("https://en.ephoto360.com/effect/create-image", new URLSearchParams(v11), {
    'headers': {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      'cookie': v4.headers["set-cookie"].join("; ")
    }
  });
  return v7 + v12.image;
}
function makeEphotoCmd(v13, v14, v15, v16) {
  return {
    'name': v13,
    'aliases': v14,
    'category': 'textmaker',
    'description': v16,
    'usage': '.' + v13 + " <text>",
    async 'execute'(v17, v18, v19, v20) {
      const {
        from: v21,
        reply: v22
      } = v20 || {};
      const v23 = v21 || v18.key.remoteJid;
      const v24 = v19.join(" ");
      const v25 = config.prefix || '.';
      if (!v24) {
        const v26 = v22 || (v27 => v17.sendMessage(v23, {
          'text': v27
        }, {
          'quoted': v18
        }));
        return v26("*Example: " + v25 + v13 + " vin*");
      }
      try {
        const v28 = await ephoto(v15, v24);
        await v17.sendMessage(v23, {
          'image': {
            'url': v28
          },
          'caption': config.botName
        }, {
          'quoted': v18
        });
      } catch (v29) {
        console.error("Error in " + v13 + " command:", v29);
        const v30 = v22 || (v31 => v17.sendMessage(v23, {
          'text': v31
        }, {
          'quoted': v18
        }));
        v30("*❌ An error occurred while generating the effect.*");
      }
    }
  };
}
function makeApiCmd(v32, v33, v34, v35, v36) {
  return {
    'name': v32,
    'aliases': v33,
    'category': "textmaker",
    'description': v35,
    'usage': '.' + v32 + " <text>",
    async 'execute'(v37, v38, v39, v40) {
      const {
        from: v41,
        reply: v42
      } = v40 || {};
      const v43 = v41 || v38.key.remoteJid;
      const v44 = v39.join(" ");
      const v45 = config.prefix || '.';
      const v46 = v42 || (v47 => v37.sendMessage(v43, {
        'text': v47
      }, {
        'quoted': v38
      }));
      if (!v44) {
        return v46("*Example: " + v45 + v32 + " vin*");
      }
      try {
        await v46(v36);
        const v48 = v34(encodeURIComponent(v44));
        await v37.sendMessage(v43, {
          'image': {
            'url': v48
          },
          'caption': config.botName
        }, {
          'quoted': v38
        });
      } catch (v49) {
        console.error("Error in " + v32 + " command:", v49);
        v46("❌ Error generating effect. Please try again later.");
      }
    }
  };
}
module.exports = [makeEphotoCmd('luxurygold', ["goldtext", 'goldfx'], "https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html", "Create a luxury gold text effect"), makeEphotoCmd("advancedglow", ['aglow'], 'https://en.ephoto360.com/advanced-glow-effects-74.html', "Create an advanced glow text effect"), makeEphotoCmd("blackpinklogo", ["bplogo"], "https://en.ephoto360.com/create-blackpink-logo-online-free-607.html", "Create a Blackpink logo style text"), makeEphotoCmd("blackpinkstyle", ["bpstyle"], "https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html", "Create a Blackpink style text effect"), makeEphotoCmd('cartoonstyle', ['cartoonfx'], "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html", "Create a cartoon style graffiti text effect"), makeEphotoCmd("deadpool", ["deadpoolfx"], "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html", "Create a green neon light text effect"), makeEphotoCmd("effectclouds", ["cloudsfx"], "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html", "Write text in clouds in the sky"), makeEphotoCmd("flagtext", ['flagfx'], "https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html", "Create a 3D flag text effect"), makeEphotoCmd("freecreate", ["freefx"], "https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html", "Create a 3D hologram text effect"), makeEphotoCmd('galaxystyle', ['galaxyfx'], 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html', "Create a galaxy style name logo"), makeEphotoCmd("galaxywallpaper", ["galaxywp"], "https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html", "Create a galaxy wallpaper with your text"), makeEphotoCmd('makingneon', ["makeneon"], "https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html", "Create neon light text with galaxy style"), makeEphotoCmd("matrixfx", ['matrixtext'], "https://en.ephoto360.com/matrix-text-effect-154.html", "Create a matrix style text effect"), makeEphotoCmd("royaltext", ["royalfx"], "https://en.ephoto360.com/royal-text-effect-online-free-471.html", "Create a royal text effect"), makeEphotoCmd('sandfx', ["sandtext"], "https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html", "Write text in sand on a beach"), makeEphotoCmd("summerbeach", ["beachfx"], "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html", "Write text on a summer beach"), makeEphotoCmd("topography", ['topofx'], 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html', "Create typography text effect on pavement"), makeEphotoCmd("typography", ["typefx"], "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html", "Create a typography pavement text effect"), makeEphotoCmd("flag3dtext", ["flag3d"], 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html', "Create a 3D American flag text effect"), makeEphotoCmd("glitchtext", ['textglitch'], "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html", "Create a digital glitch text effect"), makeEphotoCmd("dragonball", ["dragonballfx"], 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html', "Create a Dragon Ball style text effect"), makeEphotoCmd("multicoloredneon", ['multicneon'], 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html', "Create multicolored neon light signatures"), makeEphotoCmd("neonglitch", ["neonglitchfx"], "https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html", "Create impressive neon glitch text effect"), makeEphotoCmd("papercutstyle", ["papercutfx"], 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html', "Create a 3D multicolor paper cut style text"), makeEphotoCmd("pixelglitch", ['pixelglitchfx'], "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html", "Create a pixel glitch text effect"), makeEphotoCmd("glowingtext", ["glowtxt"], "https://en.ephoto360.com/create-glowing-text-effects-online-706.html", "Create glowing text effect"), makeEphotoCmd("gradienttext", ['gradienttxt'], "https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html", "Create a 3D gradient text effect"), makeEphotoCmd('graffiti', ['graffitifx'], "https://en.ephoto360.com/cute-girl-painting-graffiti-text-effect-667.html", "Create a graffiti text effect"), makeEphotoCmd("incandescent", ["incandescentfx"], "https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html", "Create incandescent bulb text effect"), makeEphotoCmd("lighteffects", ["lightfx"], "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html", "Create light/neon text effects"), makeEphotoCmd('logomaker', ['logomake'], "https://en.ephoto360.com/free-bear-logo-maker-online-673.html", "Create a bear logo with text"), makeApiCmd("royal", ['royal2'], v50 => "https://api.nekolabs.my.id/ephoto/royal-text?text=" + v50, "Create a royal logo (via external API)", "👑 Creating royal logo... Please wait ⏳"), makeApiCmd("textonwetglass", ["wetglass", "wetfx"], v51 => "https://api.nekolabs.web.id/ephoto/text-on-wet-glass?text=" + v51, "Create a wet glass text effect (via external API)", "💧 Creating text on wet glass effect... Please wait ⏳"), makeApiCmd("bear", ["bearlogo"], v52 => 'https://api.nekolabs.my.id/ephoto/bear-logo?text=' + v52, "Create a bear logo (via external API)", "🐻 Creating bear logo... Please wait ⏳"), makeApiCmd("papercut", ['3dpaper', "paper3d"], v53 => "https://api.nekolabs.my.id/ephoto/3d-paper-cut-style?text=" + v53, "Create a 3D paper cut style (via external API)", "✂️ Creating 3D paper cut style... Please wait ⏳"), makeApiCmd('hologram', ["3dhologram", "hologram3d"], v54 => "https://api.nekolabs.my.id/ephoto/3d-hologram-text?text=" + v54, "Create a 3D hologram text (via external API)", "✨ Creating 3D hologram text... Please wait ⏳")];
