const {
  createCanvas
} = require("@napi-rs/canvas");
const config = require("../../config");
function getBotName() {
  return config.botName || "JuneX-Ultra";
}
function getFooter() {
  return "> Powered by " + (config.botName || "JuneX-Ultra");
}
function addWatermark(v1, v2, v3, v4 = config.botName || "JuneX-Ultra") {
  v1.save();
  v1.shadowColor = 'transparent';
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
  'name': "steellogo",
  'description': "Create industrial steel metallic text logos",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🔩 *STEEL LOGO*\n\n*steelogo*\nsteelogo <text>\n\n*Example:*\nsteelogo WOLF\nsteelogo STEEL\nsteelogo INDUSTRIAL\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateSteelLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🔩 *Steel Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [STEELOGO] ERROR:", v11);
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
async function generateSteelLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#1a1a1a";
  v14.fillRect(0, 0, 800, 400);
  drawIndustrialBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 100, 0, 300);
  v15.addColorStop(0, '#F0F0F0');
  v15.addColorStop(0.15, "#D8D8D8");
  v15.addColorStop(0.3, "#B8B8B8");
  v15.addColorStop(0.45, "#989898");
  v15.addColorStop(0.6, "#787878");
  v15.addColorStop(0.75, "#585858");
  v15.addColorStop(0.9, '#404040');
  v15.addColorStop(1, '#282828');
  v14.font = "bold 84px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  createSteel3DEffect(v14, v12, 800, 400, v15);
  addSteelHighlights(v14, v12, 800, 400);
  drawIndustrialBorder(v14, 800, 400);
  addMetalTexture(v14, 800, 400);
  addSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawIndustrialBackground(v16, v17, v18) {
  const v19 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 1.5);
  v19.addColorStop(0, '#2a2a2a');
  v19.addColorStop(0.4, "#1a1a1a");
  v19.addColorStop(0.8, "#0a0a0a");
  v19.addColorStop(1, "#000000");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.strokeStyle = "rgba(100, 100, 100, 0.1)";
  v16.lineWidth = 1;
  for (let v20 = 0; v20 < v18; v20 += 3) {
    v16.beginPath();
    v16.moveTo(0, v20);
    v16.lineTo(v17, v20);
    v16.stroke();
  }
  v16.strokeStyle = "rgba(80, 80, 80, 0.2)";
  v16.lineWidth = 0.5;
  for (let v21 = 0; v21 < v17; v21 += 40) {
    v16.beginPath();
    v16.moveTo(v21, 0);
    v16.lineTo(v21, v18);
    v16.stroke();
  }
  for (let v22 = 0; v22 < v18; v22 += 40) {
    v16.beginPath();
    v16.moveTo(0, v22);
    v16.lineTo(v17, v22);
    v16.stroke();
  }
}
function createSteel3DEffect(v23, v24, v25, v26, v27) {
  const v28 = v25 / 2;
  const v29 = v26 / 2;
  for (let v30 = 8; v30 > 0; v30--) {
    const v31 = v30 * 1.5;
    const v32 = 0.1 + v30 / 8 * 0.3;
    v23.fillStyle = "rgba(0, 0, 0, " + v32 + ')';
    v23.fillText(v24.toUpperCase(), v28 + v31, v29 + v31);
  }
  v23.fillStyle = v27;
  v23.fillText(v24.toUpperCase(), v28, v29);
  v23.strokeStyle = "rgba(200, 200, 200, 0.4)";
  v23.lineWidth = 1.5;
  v23.strokeText(v24.toUpperCase(), v28, v29);
}
function addSteelHighlights(v33, v34, v35, v36) {
  const v37 = v35 / 2;
  const v38 = v36 / 2;
  v33.save();
  const v39 = v33.createLinearGradient(v37 - 250, v38 - 50, v37 + 250, v38 - 10);
  v39.addColorStop(0, "rgba(255, 255, 255, 0)");
  v39.addColorStop(0.3, "rgba(255, 255, 255, 0.7)");
  v39.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
  v39.addColorStop(0.7, "rgba(255, 255, 255, 0.6)");
  v39.addColorStop(1, "rgba(255, 255, 255, 0)");
  v33.globalCompositeOperation = "screen";
  v33.fillStyle = v39;
  v33.font = "bold 84px \"Arial\"";
  v33.textAlign = 'center';
  v33.textBaseline = "middle";
  v33.fillText(v34.toUpperCase(), v37, v38 - 2);
  v33.globalCompositeOperation = "source-over";
  const v40 = v33.measureText(v34.toUpperCase()).width;
  const v41 = [{
    'x': -0.35,
    'y': -0.35,
    'size': 0x5,
    'alpha': 0.8
  }, {
    'x': -0.15,
    'y': -0.4,
    'size': 0x6,
    'alpha': 0.9
  }, {
    'x': 0.05,
    'y': -0.35,
    'size': 0x4,
    'alpha': 0.7
  }, {
    'x': 0.25,
    'y': -0.4,
    'size': 0x5,
    'alpha': 0.8
  }, {
    'x': 0.4,
    'y': -0.3,
    'size': 0x3,
    'alpha': 0.6
  }];
  v41.forEach(v42 => {
    const v43 = v37 + v42.x * v40 / 2;
    const v44 = v38 + v42.y * 45;
    v33.fillStyle = "rgba(255, 255, 255, " + v42.alpha + ')';
    v33.beginPath();
    v33.arc(v43, v44, v42.size, 0, Math.PI * 2);
    v33.fill();
  });
  v33.restore();
}
function drawIndustrialBorder(v45, v46, v47) {
  const v48 = v45.createLinearGradient(0, 0, v46, v47);
  v48.addColorStop(0, '#E0E0E0');
  v48.addColorStop(0.25, '#B0B0B0');
  v48.addColorStop(0.5, '#808080');
  v48.addColorStop(0.75, "#B0B0B0");
  v48.addColorStop(1, '#E0E0E0');
  v45.strokeStyle = v48;
  v45.lineWidth = 8;
  v45.shadowColor = "rgba(0, 0, 0, 0.5)";
  v45.shadowBlur = 15;
  v45.strokeRect(16, 16, v46 - 32, v47 - 32);
  v45.strokeStyle = "rgba(150, 150, 150, 0.4)";
  v45.lineWidth = 2;
  v45.shadowBlur = 0;
  v45.strokeRect(28, 28, v46 - 56, v47 - 56);
  drawIndustrialRivets(v45, v46, v47);
}
function drawIndustrialRivets(v49, v50, v51) {
  v49.fillStyle = "#909090";
  const v52 = [{
    'x': 0x1e,
    'y': 0x1e
  }, {
    'x': v50 - 30,
    'y': 0x1e
  }, {
    'x': 0x1e,
    'y': v51 - 30
  }, {
    'x': v50 - 30,
    'y': v51 - 30
  }, {
    'x': v50 / 2,
    'y': 0x1e
  }, {
    'x': v50 / 2,
    'y': v51 - 30
  }, {
    'x': 0x1e,
    'y': v51 / 2
  }, {
    'x': v50 - 30,
    'y': v51 / 2
  }];
  v52.forEach(v53 => {
    v49.beginPath();
    v49.arc(v53.x, v53.y, 5, 0, Math.PI * 2);
    v49.fill();
    v49.fillStyle = "rgba(255, 255, 255, 0.6)";
    v49.beginPath();
    v49.arc(v53.x - 1.5, v53.y - 1.5, 1.5, 0, Math.PI * 2);
    v49.fill();
    v49.fillStyle = "#909090";
  });
}
function addMetalTexture(v54, v55, v56) {
  v54.save();
  v54.globalAlpha = 0.3;
  for (let v57 = 0; v57 < 50; v57++) {
    const v58 = Math.random() * v55;
    const v59 = Math.random() * v56;
    const v60 = 10 + Math.random() * 30;
    const v61 = Math.random() * Math.PI;
    v54.strokeStyle = "rgba(150, 150, 150, 0.4)";
    v54.lineWidth = 0.5;
    v54.beginPath();
    v54.moveTo(v58, v59);
    v54.lineTo(v58 + Math.cos(v61) * v60, v59 + Math.sin(v61) * v60);
    v54.stroke();
  }
  for (let v62 = 0; v62 < 20; v62++) {
    const v63 = Math.random() * v55;
    const v64 = Math.random() * v56;
    const v65 = 2 + Math.random() * 4;
    const v66 = v54.createRadialGradient(v63, v64, 0, v63, v64, v65 * 2);
    v66.addColorStop(0, "rgba(255, 200, 100, 0.6)");
    v66.addColorStop(1, "transparent");
    v54.fillStyle = v66;
    v54.beginPath();
    v54.arc(v63, v64, v65 * 2, 0, Math.PI * 2);
    v54.fill();
    v54.fillStyle = "rgba(255, 150, 50, 0.8)";
    v54.beginPath();
    v54.arc(v63, v64, v65 * 0.5, 0, Math.PI * 2);
    v54.fill();
  }
  v54.restore();
}
function addSignature(v67, v68, v69) {
  v67.save();
  const v70 = v68 - 120;
  const v71 = v69 - 20;
  v67.font = "italic 12px \"Arial\"";
  v67.fillStyle = "rgba(150, 150, 150, 0.6)";
  v67.textAlign = 'right';
  v67.textBaseline = "bottom";
  v67.fillText("by " + (config.botName || "JuneX-Ultra"), v70, v71);
  v67.strokeStyle = "rgba(150, 150, 150, 0.3)";
  v67.lineWidth = 0.5;
  const v72 = v67.measureText("by " + (config.botName || "JuneX-Ultra")).width;
  v67.beginPath();
  v67.moveTo(v70 - v72, v71 + 2);
  v67.lineTo(v70, v71 + 2);
  v67.stroke();
  v67.restore();
}
async function generateSimpleSteelLogo(v73) {
  const v74 = createCanvas(600, 300);
  const v75 = v74.getContext('2d');
  v75.fillStyle = "#1a1a1a";
  v75.fillRect(0, 0, 600, 300);
  const v76 = v75.createLinearGradient(0, 50, 0, 250);
  v76.addColorStop(0, "#E0E0E0");
  v76.addColorStop(0.4, "#B0B0B0");
  v76.addColorStop(0.7, '#808080');
  v76.addColorStop(1, '#606060');
  v75.font = "bold 70px Arial";
  v75.fillStyle = v76;
  v75.textAlign = "center";
  v75.textBaseline = "middle";
  v75.shadowColor = "rgba(0, 0, 0, 0.5)";
  v75.shadowBlur = 15;
  v75.shadowOffsetX = 4;
  v75.shadowOffsetY = 4;
  v75.fillText(v73.toUpperCase(), 300, 150);
  v75.strokeStyle = "#B0B0B0";
  v75.lineWidth = 5;
  v75.strokeRect(15, 15, 570, 270);
  v75.font = "italic 10px \"Arial\"";
  v75.fillStyle = "rgba(150, 150, 150, 0.6)";
  v75.textAlign = "right";
  v75.textBaseline = "bottom";
  v75.fillText("by " + (config.botName || "JuneX-Ultra"), 580, 285);
  return v74.toBuffer("image/png");
}
