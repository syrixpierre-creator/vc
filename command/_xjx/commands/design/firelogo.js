const {
  createCanvas
} = require("@napi-rs/canvas");
const config = require("../../config");
function getBotName() {
  return config.botName || 'JuneX-Ultra';
}
function getFooter() {
  return "> Powered by " + (config.botName || 'JuneX-Ultra');
}
function addWatermark(v1, v2, v3, v4 = config.botName || 'JuneX-Ultra') {
  v1.save();
  v1.shadowColor = "transparent";
  v1.shadowBlur = 0;
  v1.globalAlpha = 0.6;
  v1.font = "bold 16px Arial";
  v1.textAlign = "center";
  v1.textBaseline = "bottom";
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "firelogo",
  'description': "Create fire/flame style text logos",
  'category': 'design',
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (!v7.length) {
        await v5.sendMessage(v8, {
          'text': "🔥 *Fire Logo*\nUsage: " + config.prefix + "fire <text>\nExample:\n" + config.prefix + "fire WOLF"
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 15) {
        await v5.sendMessage(v8, {
          'text': "❌ Text too long! Maximum 15 characters.\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
        }, {
          'quoted': v6
        });
        return;
      }
      await v5.sendMessage(v8, {
        'react': {
          'text': '⏳',
          'key': v6.key
        }
      });
      const v10 = await generateFireLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🔥 *Fire Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
      }, {
        'quoted': v6
      });
      await v5.sendMessage(v8, {
        'react': {
          'text': '✅',
          'key': v6.key
        }
      });
    } catch (v11) {
      console.error("❌ [FIRELOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })["catch"](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ Error creating fire logo: " + v11.message + "\nTry again with shorter text."
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateFireLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  const v15 = v14.createLinearGradient(0, 0, 0, 400);
  v15.addColorStop(0, '#0a0a0a');
  v15.addColorStop(0.4, "#8B0000");
  v15.addColorStop(0.7, '#FF4500');
  v15.addColorStop(0.9, "#FF8C00");
  v15.addColorStop(1, "#0a0a0a");
  v14.fillStyle = v15;
  v14.fillRect(0, 0, 800, 400);
  addFireBackgroundNoise(v14, 800, 400);
  v14.font = "bold 80px Arial";
  v14.textAlign = 'center';
  v14.textBaseline = 'middle';
  const v16 = v14.createLinearGradient(0, 150, 0, 250);
  v16.addColorStop(0, '#FFFF00');
  v16.addColorStop(0.3, "#FFA500");
  v16.addColorStop(0.7, '#FF4500');
  v16.addColorStop(1, "#8B0000");
  v14.fillStyle = v16;
  v14.shadowColor = '#FF4500';
  v14.shadowBlur = 25;
  v14.fillText(v12.toUpperCase(), 400, 200);
  v14.shadowColor = '#FFFF00';
  v14.shadowBlur = 15;
  v14.lineWidth = 2;
  v14.strokeStyle = v16;
  v14.strokeText(v12.toUpperCase(), 400, 200);
  addFireParticles(v14, 800, 400);
  v14.strokeStyle = "#FF8C00";
  v14.lineWidth = 5;
  v14.shadowColor = '#FF4500';
  v14.shadowBlur = 20;
  v14.strokeRect(10, 10, 780, 380);
  v14.shadowColor = 'transparent';
  v14.shadowBlur = 0;
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function addFireBackgroundNoise(v17, v18, v19) {
  v17.globalAlpha = 0.25;
  for (let v20 = 0; v20 < 1200; v20++) {
    const v21 = Math.random() * v18;
    const v22 = Math.random() * v19;
    const v23 = Math.random() * 3 + 1;
    const v24 = Math.random();
    if (v24 > 0.7) {
      v17.fillStyle = "#FFFF00";
    } else {
      if (v24 > 0.4) {
        v17.fillStyle = "#FFA500";
      } else {
        v17.fillStyle = "#FF4500";
      }
    }
    v17.fillRect(v21, v22, v23, v23);
  }
  v17.globalAlpha = 1;
}
function addFireParticles(v25, v26, v27) {
  v25.globalAlpha = 0.7;
  for (let v28 = 0; v28 < 250; v28++) {
    const v29 = Math.random() * Math.PI * 2;
    const v30 = Math.random() * 120 + 50;
    const v31 = v26 / 2 + Math.cos(v29) * v30;
    const v32 = v27 / 2 + Math.sin(v29) * v30;
    const v33 = Math.random() * 4 + 1;
    const v34 = Math.random();
    if (v34 > 0.8) {
      v25.fillStyle = '#FFFF00';
    } else {
      if (v34 > 0.5) {
        v25.fillStyle = "#FFA500";
      } else {
        v25.fillStyle = "#FF4500";
      }
    }
    v25.beginPath();
    v25.arc(v31, v32, v33, 0, Math.PI * 2);
    v25.fill();
  }
  v25.globalAlpha = 1;
}
