const {
  createCanvas
} = require('@napi-rs/canvas');
const config = require("../../config");
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
  v1.strokeStyle = '#000000';
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "platinumlogo",
  'description': "Create premium platinum metallic text logos",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🔷 *PLATINUM LOGO*\n\n*platinumlogo*\nplatinumlogo <text>\n\n*Example:*\nplatinumlogo WOLF\nplatinumlogo PLATINUM\nplatinumlogo ELITE\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generatePlatinumLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🔷 *Platinum Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [PLATINUMLOGO] ERROR:", v11);
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
async function generatePlatinumLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#0a0a14";
  v14.fillRect(0, 0, 800, 400);
  drawPlatinumBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 100, 0, 300);
  v15.addColorStop(0, "#F8F8FF");
  v15.addColorStop(0.15, "#E8E8F0");
  v15.addColorStop(0.3, '#D0D0E0');
  v15.addColorStop(0.45, '#B8B8D0');
  v15.addColorStop(0.6, "#A0A0C0");
  v15.addColorStop(0.75, "#8888B0");
  v15.addColorStop(0.9, '#7070A0');
  v15.addColorStop(1, '#585890');
  v14.font = "bold 86px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  createPlatinum3DEffect(v14, v12, 800, 400, v15);
  addPlatinumHighlights(v14, v12, 800, 400);
  drawPlatinumBorder(v14, 800, 400);
  addDiamondReflections(v14, 800, 400);
  addPrestigeElements(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawPlatinumBackground(v16, v17, v18) {
  const v19 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 1.5);
  v19.addColorStop(0, "#1a1a2e");
  v19.addColorStop(0.4, "#0f0f23");
  v19.addColorStop(0.8, "#050514");
  v19.addColorStop(1, "#000005");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.strokeStyle = "rgba(100, 100, 150, 0.1)";
  v16.lineWidth = 1;
  for (let v20 = 0; v20 < v17; v20 += 40) {
    for (let v21 = 0; v21 < v18; v21 += 40) {
      v16.beginPath();
      v16.moveTo(v20, v21);
      v16.lineTo(v20 + 40, v21);
      v16.lineTo(v20 + 40, v21 + 40);
      v16.lineTo(v20, v21 + 40);
      v16.closePath();
      v16.stroke();
    }
  }
  drawPrestigeCorners(v16, v17, v18);
}
function createPlatinum3DEffect(v22, v23, v24, v25, v26) {
  const v27 = v24 / 2;
  const v28 = v25 / 2;
  for (let v29 = 10; v29 > 0; v29--) {
    const v30 = v29 * 1.2;
    const v31 = 0.08 + v29 / 10 * 0.25;
    const v32 = 150 - v29 * 10;
    v22.fillStyle = "rgba(0, 0, " + v32 + ", " + v31 + ')';
    v22.fillText(v23.toUpperCase(), v27 + v30, v28 + v30);
  }
  v22.shadowColor = "rgba(100, 100, 255, 0.3)";
  v22.shadowBlur = 15;
  v22.fillStyle = v26;
  v22.fillText(v23.toUpperCase(), v27, v28);
  v22.shadowColor = "transparent";
  v22.shadowBlur = 0;
  v22.strokeStyle = "rgba(200, 200, 255, 0.4)";
  v22.lineWidth = 1.5;
  v22.strokeText(v23.toUpperCase(), v27, v28);
}
function addPlatinumHighlights(v33, v34, v35, v36) {
  const v37 = v35 / 2;
  const v38 = v36 / 2;
  v33.save();
  const v39 = v33.createLinearGradient(v37 - 250, v38 - 60, v37 + 250, v38 - 10);
  v39.addColorStop(0, "rgba(240, 240, 255, 0.9)");
  v39.addColorStop(0.3, "rgba(220, 220, 255, 0.6)");
  v39.addColorStop(0.6, "rgba(200, 200, 255, 0.3)");
  v39.addColorStop(1, "transparent");
  v33.globalCompositeOperation = "screen";
  v33.fillStyle = v39;
  v33.font = "bold 86px \"Arial\"";
  v33.textAlign = "center";
  v33.textBaseline = "middle";
  v33.fillText(v34.toUpperCase(), v37, v38 - 3);
  v33.globalCompositeOperation = "source-over";
  v33.fillStyle = "rgba(255, 255, 255, 0.8)";
  v33.globalAlpha = 0.4;
  const v40 = v33.measureText(v34.toUpperCase()).width;
  const v41 = [{
    'x': -0.4,
    'y': -0.3
  }, {
    'x': -0.2,
    'y': -0.4
  }, {
    'x': 0x0,
    'y': -0.35
  }, {
    'x': 0.2,
    'y': -0.4
  }, {
    'x': 0.4,
    'y': -0.3
  }];
  v41.forEach(v42 => {
    const v43 = v37 + v42.x * v40 / 2;
    const v44 = v38 + v42.y * 40;
    const v45 = 4 + Math.random() * 3;
    v33.shadowColor = "rgba(200, 200, 255, 0.6)";
    v33.shadowBlur = 8;
    v33.beginPath();
    v33.arc(v43, v44, v45, 0, Math.PI * 2);
    v33.fill();
  });
  v33.restore();
}
function drawPlatinumBorder(v46, v47, v48) {
  const v49 = v46.createLinearGradient(0, 0, v47, v48);
  v49.addColorStop(0, "#E8E8FF");
  v49.addColorStop(0.25, "#C0C0E0");
  v49.addColorStop(0.5, '#A0A0C0');
  v49.addColorStop(0.75, "#C0C0E0");
  v49.addColorStop(1, "#E8E8FF");
  v46.strokeStyle = v49;
  v46.lineWidth = 8;
  v46.shadowColor = "rgba(100, 100, 200, 0.5)";
  v46.shadowBlur = 20;
  v46.strokeRect(15, 15, v47 - 30, v48 - 30);
  v46.strokeStyle = "rgba(200, 200, 255, 0.6)";
  v46.lineWidth = 2;
  v46.shadowBlur = 0;
  v46.strokeRect(25, 25, v47 - 50, v48 - 50);
  v46.strokeStyle = "rgba(150, 150, 255, 0.3)";
  v46.lineWidth = 1;
  v46.strokeRect(35, 35, v47 - 70, v48 - 70);
}
function addDiamondReflections(v50, v51, v52) {
  v50.save();
  v50.globalAlpha = 0.7;
  for (let v53 = 0; v53 < 12; v53++) {
    const v54 = 50 + Math.random() * (v51 - 100);
    const v55 = 50 + Math.random() * (v52 - 100);
    const v56 = 2 + Math.random() * 4;
    v50.fillStyle = "rgba(255, 255, 255, 0.9)";
    v50.beginPath();
    v50.moveTo(v54, v55 - v56);
    v50.lineTo(v54 + v56, v55);
    v50.lineTo(v54, v55 + v56);
    v50.lineTo(v54 - v56, v55);
    v50.closePath();
    v50.fill();
    v50.shadowColor = "rgba(200, 200, 255, 0.8)";
    v50.shadowBlur = 5;
    v50.fill();
  }
  v50.restore();
}
function drawPrestigeCorners(v57, v58, v59) {
  v57.strokeStyle = "rgba(150, 150, 255, 0.4)";
  v57.lineWidth = 3;
  v57.beginPath();
  v57.moveTo(20, 50);
  v57.lineTo(20, 28);
  v57.moveTo(20, 20);
  v57.lineTo(28, 20);
  v57.moveTo(42, 20);
  v57.lineTo(50, 20);
  v57.moveTo(50, 20);
  v57.lineTo(50, 28);
  v57.stroke();
  v57.beginPath();
  v57.moveTo(v58 - 20, 50);
  v57.lineTo(v58 - 20, 28);
  v57.moveTo(v58 - 20, 20);
  v57.lineTo(v58 - 20 - 8, 20);
  v57.moveTo(v58 - 20 - 30 + 8, 20);
  v57.lineTo(v58 - 20 - 30, 20);
  v57.moveTo(v58 - 20 - 30, 20);
  v57.lineTo(v58 - 20 - 30, 28);
  v57.stroke();
  v57.beginPath();
  v57.moveTo(20, v59 - 20 - 30);
  v57.lineTo(20, v59 - 20 - 8);
  v57.moveTo(20, v59 - 20);
  v57.lineTo(28, v59 - 20);
  v57.moveTo(42, v59 - 20);
  v57.lineTo(50, v59 - 20);
  v57.moveTo(50, v59 - 20);
  v57.lineTo(50, v59 - 20 - 8);
  v57.stroke();
  v57.beginPath();
  v57.moveTo(v58 - 20, v59 - 20 - 30);
  v57.lineTo(v58 - 20, v59 - 20 - 8);
  v57.moveTo(v58 - 20, v59 - 20);
  v57.lineTo(v58 - 20 - 8, v59 - 20);
  v57.moveTo(v58 - 20 - 30 + 8, v59 - 20);
  v57.lineTo(v58 - 20 - 30, v59 - 20);
  v57.moveTo(v58 - 20 - 30, v59 - 20);
  v57.lineTo(v58 - 20 - 30, v59 - 20 - 8);
  v57.stroke();
}
function addPrestigeElements(v60, v61, v62) {
  v60.fillStyle = "rgba(100, 100, 200, 0.1)";
  v60.beginPath();
  v60.arc(50, 50, 30, 0, Math.PI * 2);
  v60.fill();
  v60.beginPath();
  v60.arc(v61 - 50, 50, 30, 0, Math.PI * 2);
  v60.fill();
  v60.beginPath();
  v60.arc(50, v62 - 50, 30, 0, Math.PI * 2);
  v60.fill();
  v60.beginPath();
  v60.arc(v61 - 50, v62 - 50, 30, 0, Math.PI * 2);
  v60.fill();
}
async function generateSimplePlatinumLogo(v63) {
  const v64 = createCanvas(600, 300);
  const v65 = v64.getContext('2d');
  v65.fillStyle = "#0a0a1a";
  v65.fillRect(0, 0, 600, 300);
  const v66 = v65.createLinearGradient(0, 50, 0, 250);
  v66.addColorStop(0, "#F0F0FF");
  v66.addColorStop(0.3, "#D0D0E0");
  v66.addColorStop(0.6, "#A0A0C0");
  v66.addColorStop(1, "#8080A0");
  v65.font = "bold 72px Arial";
  v65.fillStyle = v66;
  v65.textAlign = "center";
  v65.textBaseline = 'middle';
  v65.shadowColor = "rgba(0, 0, 50, 0.5)";
  v65.shadowBlur = 15;
  v65.shadowOffsetX = 4;
  v65.shadowOffsetY = 4;
  v65.fillText(v63.toUpperCase(), 300, 150);
  v65.strokeStyle = "#C0C0E0";
  v65.lineWidth = 5;
  v65.strokeRect(15, 15, 570, 270);
  return v64.toBuffer("image/png");
}
