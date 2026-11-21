const {
  createCanvas
} = require("@napi-rs/canvas");
const config = require('../../config');
function getBotName() {
  return config.botName || "JuneX-Ultra";
}
function getFooter() {
  return "> Powered by " + (config.botName || "JuneX-Ultra");
}
function addWatermark(v1, v2, v3, v4 = config.botName || "JuneX-Ultra") {
  v1.save();
  v1.shadowColor = "transparent";
  v1.shadowBlur = 0;
  v1.globalAlpha = 0.6;
  v1.font = "bold 16px Arial";
  v1.textAlign = "center";
  v1.textBaseline = "bottom";
  v1.fillStyle = '#FFFFFF';
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': 'goldlogo',
  'description': "Create luxurious gold style text logos",
  'category': 'design',
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "💰 *GOLD LOGO*\n\n*golden*\n" + config.prefix + "golden <text>\n\n*Example:*\n" + config.prefix + "golden WOLF\n" + config.prefix + "golden ROYAL\n" + config.prefix + "golden LUXURY\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 15) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 15 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
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
      const v10 = await generateGoldLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "💰 *Gold Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [GOLDLOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })["catch"](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ *ERROR*\n\n" + v11.message + "\nPlease try again with shorter text"
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateGoldLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#1a1a1a";
  v14.fillRect(0, 0, 800, 400);
  drawLuxuryBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 100, 0, 300);
  v15.addColorStop(0, '#FFD700');
  v15.addColorStop(0.3, "#FFEC8B");
  v15.addColorStop(0.5, '#DAA520');
  v15.addColorStop(0.7, "#B8860B");
  v15.addColorStop(1, '#8B7500');
  v14.font = "bold 84px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  v14.shadowColor = "#000000";
  v14.shadowBlur = 10;
  v14.shadowOffsetX = 3;
  v14.shadowOffsetY = 3;
  v14.fillStyle = v15;
  v14.fillText(v12.toUpperCase(), 400, 200);
  v14.shadowColor = "transparent";
  const v16 = v14.createLinearGradient(0, 150, 0, 200);
  v16.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  v16.addColorStop(1, "rgba(255, 255, 255, 0.2)");
  v14.fillStyle = v16;
  v14.globalCompositeOperation = "screen";
  v14.fillText(v12.toUpperCase(), 400, 198);
  v14.globalCompositeOperation = "source-over";
  drawGoldBorder(v14, 800, 400);
  addLuxuryElements(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawLuxuryBackground(v17, v18, v19) {
  const v20 = v17.createRadialGradient(v18 / 2, v19 / 2, 0, v18 / 2, v19 / 2, v18 / 2);
  v20.addColorStop(0, "#2a2a2a");
  v20.addColorStop(1, "#1a1a1a");
  v17.fillStyle = v20;
  v17.fillRect(0, 0, v18, v19);
  v17.strokeStyle = "rgba(255, 215, 0, 0.1)";
  v17.lineWidth = 1;
  for (let v21 = -v18; v21 < v18 * 2; v21 += 20) {
    v17.beginPath();
    v17.moveTo(v21, 0);
    v17.lineTo(v21 + v19, v19);
    v17.stroke();
  }
  drawCornerDecorations(v17, v18, v19);
}
function drawGoldBorder(v22, v23, v24) {
  const v25 = v22.createLinearGradient(0, 0, v23, v24);
  v25.addColorStop(0, "#FFD700");
  v25.addColorStop(0.5, "#DAA520");
  v25.addColorStop(1, "#FFD700");
  v22.strokeStyle = v25;
  v22.lineWidth = 8;
  v22.shadowColor = '#FFD700';
  v22.shadowBlur = 15;
  v22.strokeRect(20, 20, v23 - 40, v24 - 40);
  v22.strokeStyle = "rgba(255, 215, 0, 0.3)";
  v22.lineWidth = 2;
  v22.shadowBlur = 0;
  v22.strokeRect(30, 30, v23 - 60, v24 - 60);
}
function addLuxuryElements(v26, v27, v28) {
  v26.fillStyle = "#FFD700";
  v26.shadowColor = "#FFD700";
  v26.shadowBlur = 10;
  for (let v29 = 0; v29 < 50; v29++) {
    const v30 = Math.random() * v27;
    const v31 = Math.random() * v28;
    const v32 = Math.random() * 3 + 1;
    v26.beginPath();
    v26.arc(v30, v31, v32, 0, Math.PI * 2);
    v26.fill();
  }
  v26.shadowBlur = 0;
}
function drawCornerDecorations(v33, v34, v35) {
  v33.strokeStyle = "rgba(255, 215, 0, 0.3)";
  v33.lineWidth = 2;
  v33.beginPath();
  v33.moveTo(20, 50);
  v33.lineTo(20, 20);
  v33.lineTo(50, 20);
  v33.stroke();
  v33.beginPath();
  v33.moveTo(v34 - 20 - 30, 20);
  v33.lineTo(v34 - 20, 20);
  v33.lineTo(v34 - 20, 50);
  v33.stroke();
  v33.beginPath();
  v33.moveTo(20, v35 - 20 - 30);
  v33.lineTo(20, v35 - 20);
  v33.lineTo(50, v35 - 20);
  v33.stroke();
  v33.beginPath();
  v33.moveTo(v34 - 20 - 30, v35 - 20);
  v33.lineTo(v34 - 20, v35 - 20);
  v33.lineTo(v34 - 20, v35 - 20 - 30);
  v33.stroke();
}
async function generateSimpleGoldLogo(v36) {
  const v37 = createCanvas(600, 300);
  const v38 = v37.getContext('2d');
  v38.fillStyle = '#0a0a0a';
  v38.fillRect(0, 0, 600, 300);
  const v39 = v38.createLinearGradient(0, 50, 0, 250);
  v39.addColorStop(0, "#FFD700");
  v39.addColorStop(0.5, "#DAA520");
  v39.addColorStop(1, "#B8860B");
  v38.font = "bold 70px Arial";
  v38.fillStyle = v39;
  v38.textAlign = "center";
  v38.textBaseline = "middle";
  v38.shadowColor = "#000000";
  v38.shadowBlur = 10;
  v38.shadowOffsetX = 3;
  v38.shadowOffsetY = 3;
  v38.fillText(v36.toUpperCase(), 300, 150);
  v38.strokeStyle = "#FFD700";
  v38.lineWidth = 4;
  v38.strokeRect(10, 10, 580, 280);
  return v37.toBuffer('image/png');
}
