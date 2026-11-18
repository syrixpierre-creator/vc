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
  v1.strokeStyle = '#000000';
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "copperlogo",
  'category': 'design',
  'description': "Create warm copper metallic text logos with natural patina",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🟠 *COPPER LOGO*\n\n*copperlogo*\ncopperlogo <text>\n\n*Example:*\ncopperlogo WOLF\ncopperlogo COPPER\ncopperlogo WARM\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateCopperLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🟠 *Copper Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [COPPERLOGO] ERROR:", v11);
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
async function generateCopperLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#2a1a0a";
  v14.fillRect(0, 0, 800, 400);
  drawNaturalBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 100, 0, 300);
  v15.addColorStop(0, "#FFD700");
  v15.addColorStop(0.15, "#E6B800");
  v15.addColorStop(0.3, '#CD7F32');
  v15.addColorStop(0.45, "#B87333");
  v15.addColorStop(0.6, "#A65A29");
  v15.addColorStop(0.75, "#8B4513");
  v15.addColorStop(0.9, "#654321");
  v15.addColorStop(1, "#4E3524");
  v14.font = "bold 84px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  createCopper3DEffect(v14, v12, 800, 400, v15);
  addCopperHighlights(v14, v12, 800, 400);
  addCopperPatina(v14, v12, 800, 400);
  drawCopperBorder(v14, 800, 400);
  addHammeredTexture(v14, 800, 400);
  addSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawNaturalBackground(v16, v17, v18) {
  const v19 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 1.5);
  v19.addColorStop(0, '#3a2a1a');
  v19.addColorStop(0.4, "#2a1a0a");
  v19.addColorStop(0.8, "#1a0a00");
  v19.addColorStop(1, "#0a0500");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.strokeStyle = "rgba(120, 80, 40, 0.1)";
  v16.lineWidth = 1;
  for (let v20 = 0; v20 < 150; v20++) {
    const v21 = Math.random() * v17;
    const v22 = Math.random() * v18;
    const v23 = 15 + Math.random() * 35;
    const v24 = Math.random() * Math.PI * 2;
    const v25 = (Math.random() - 0.5) * 0.5;
    v16.beginPath();
    v16.moveTo(v21, v22);
    v16.quadraticCurveTo(v21 + Math.cos(v24) * v23 * 0.5 + v25 * 20, v22 + Math.sin(v24) * v23 * 0.5 + v25 * 20, v21 + Math.cos(v24) * v23, v22 + Math.sin(v24) * v23);
    v16.stroke();
  }
  v16.fillStyle = "rgba(200, 150, 50, 0.2)";
  for (let v26 = 0; v26 < 50; v26++) {
    const v27 = Math.random() * v17;
    const v28 = Math.random() * v18;
    const v29 = 1 + Math.random() * 3;
    v16.beginPath();
    v16.arc(v27, v28, v29, 0, Math.PI * 2);
    v16.fill();
  }
}
function createCopper3DEffect(v30, v31, v32, v33, v34) {
  const v35 = v32 / 2;
  const v36 = v33 / 2;
  for (let v37 = 8; v37 > 0; v37--) {
    const v38 = v37 * 1.5;
    const v39 = 0.08 + v37 / 8 * 0.25;
    const v40 = 80 - v37 * 8;
    v30.fillStyle = "rgba(" + v40 + ", " + (v40 - 20) + ", " + (v40 - 40) + ", " + v39 + ')';
    v30.fillText(v31.toUpperCase(), v35 + v38, v36 + v38);
  }
  v30.fillStyle = v34;
  v30.fillText(v31.toUpperCase(), v35, v36);
  v30.strokeStyle = "rgba(255, 200, 100, 0.4)";
  v30.lineWidth = 1.5;
  v30.strokeText(v31.toUpperCase(), v35, v36);
}
function addCopperHighlights(v41, v42, v43, v44) {
  const v45 = v43 / 2;
  const v46 = v44 / 2;
  v41.save();
  const v47 = v41.createLinearGradient(v45 - 250, v46 - 50, v45 + 250, v46 - 10);
  v47.addColorStop(0, "rgba(255, 255, 200, 0)");
  v47.addColorStop(0.3, "rgba(255, 255, 150, 0.6)");
  v47.addColorStop(0.5, "rgba(255, 255, 100, 0.7)");
  v47.addColorStop(0.7, "rgba(255, 255, 150, 0.5)");
  v47.addColorStop(1, "rgba(255, 255, 200, 0)");
  v41.globalCompositeOperation = 'screen';
  v41.fillStyle = v47;
  v41.font = "bold 84px \"Arial\"";
  v41.textAlign = 'center';
  v41.textBaseline = "middle";
  v41.fillText(v42.toUpperCase(), v45, v46 - 2);
  v41.globalCompositeOperation = 'source-over';
  const v48 = v41.measureText(v42.toUpperCase()).width;
  const v49 = [{
    'x': -0.35,
    'y': -0.35,
    'size': 0x5,
    'alpha': 0.8,
    'color': "rgba(255, 230, 100, 0.9)"
  }, {
    'x': -0.15,
    'y': -0.4,
    'size': 0x6,
    'alpha': 0.9,
    'color': "rgba(255, 220, 80, 0.9)"
  }, {
    'x': 0.05,
    'y': -0.35,
    'size': 0x4,
    'alpha': 0.7,
    'color': "rgba(255, 240, 120, 0.8)"
  }, {
    'x': 0.25,
    'y': -0.4,
    'size': 0x5,
    'alpha': 0.8,
    'color': "rgba(255, 230, 100, 0.9)"
  }, {
    'x': 0.4,
    'y': -0.3,
    'size': 0x3,
    'alpha': 0.6,
    'color': "rgba(255, 240, 130, 0.7)"
  }];
  v49.forEach(v50 => {
    const v51 = v45 + v50.x * v48 / 2;
    const v52 = v46 + v50.y * 45;
    v41.fillStyle = v50.color.replace(')', ", " + v50.alpha + ')').replace('a(', 'a(');
    v41.beginPath();
    v41.arc(v51, v52, v50.size, 0, Math.PI * 2);
    v41.fill();
  });
  v41.restore();
}
function addCopperPatina(v53, v54, v55, v56) {
  const v57 = v55 / 2;
  const v58 = v56 / 2;
  v53.save();
  const v59 = v53.createLinearGradient(v57 - 200, v58 + 40, v57 + 200, v58 - 30);
  v59.addColorStop(0, "rgba(83, 130, 85, 0.2)");
  v59.addColorStop(0.4, "rgba(67, 111, 77, 0.3)");
  v59.addColorStop(0.7, "rgba(53, 94, 59, 0.2)");
  v59.addColorStop(1, "transparent");
  v53.globalCompositeOperation = "overlay";
  v53.fillStyle = v59;
  v53.font = "bold 84px \"Arial\"";
  v53.textAlign = 'center';
  v53.textBaseline = "middle";
  v53.fillText(v54.toUpperCase(), v57, v58);
  v53.globalCompositeOperation = "source-over";
  const v60 = v53.measureText(v54.toUpperCase()).width;
  const v61 = [{
    'x': -0.3,
    'y': 0.25,
    'size': 0x8,
    'alpha': 0.4,
    'color': "rgba(64, 130, 109, 0.5)"
  }, {
    'x': -0.1,
    'y': -0.15,
    'size': 0x6,
    'alpha': 0.3,
    'color': "rgba(72, 140, 120, 0.4)"
  }, {
    'x': 0.15,
    'y': 0.35,
    'size': 0xa,
    'alpha': 0.5,
    'color': "rgba(60, 125, 105, 0.6)"
  }, {
    'x': 0.35,
    'y': -0.25,
    'size': 0x7,
    'alpha': 0.4,
    'color': "rgba(68, 135, 115, 0.5)"
  }, {
    'x': 0.45,
    'y': 0.15,
    'size': 0x5,
    'alpha': 0.3,
    'color': "rgba(76, 145, 125, 0.4)"
  }];
  v61.forEach(v62 => {
    const v63 = v57 + v62.x * v60 / 2;
    const v64 = v58 + v62.y * 40;
    v53.fillStyle = v62.color.replace(')', ", " + v62.alpha + ')').replace('a(', 'a(');
    v53.beginPath();
    v53.arc(v63, v64, v62.size, 0, Math.PI * 2);
    v53.fill();
    v53.fillStyle = v62.color.replace(')', ", " + v62.alpha * 0.7 + ')').replace('a(', 'a(');
    v53.beginPath();
    v53.arc(v63 - v62.size * 0.3, v64 - v62.size * 0.3, v62.size * 0.5, 0, Math.PI * 2);
    v53.fill();
  });
  v53.restore();
}
function drawCopperBorder(v65, v66, v67) {
  const v68 = v65.createLinearGradient(0, 0, v66, v67);
  v68.addColorStop(0, '#FFD700');
  v68.addColorStop(0.25, '#E6B800');
  v68.addColorStop(0.5, "#B87333");
  v68.addColorStop(0.75, "#E6B800");
  v68.addColorStop(1, "#FFD700");
  v65.strokeStyle = v68;
  v65.lineWidth = 8;
  v65.shadowColor = "rgba(184, 115, 51, 0.5)";
  v65.shadowBlur = 15;
  v65.strokeRect(18, 18, v66 - 36, v67 - 36);
  v65.strokeStyle = "rgba(255, 200, 100, 0.4)";
  v65.lineWidth = 2;
  v65.shadowBlur = 0;
  v65.strokeRect(30, 30, v66 - 60, v67 - 60);
  drawCopperRivets(v65, v66, v67);
}
function drawCopperRivets(v69, v70, v71) {
  v69.fillStyle = "#B87333";
  const v72 = [{
    'x': 0x23,
    'y': 0x23
  }, {
    'x': v70 - 35,
    'y': 0x23
  }, {
    'x': 0x23,
    'y': v71 - 35
  }, {
    'x': v70 - 35,
    'y': v71 - 35
  }, {
    'x': v70 / 2,
    'y': 0x23
  }, {
    'x': v70 / 2,
    'y': v71 - 35
  }];
  v72.forEach(v73 => {
    v69.beginPath();
    v69.arc(v73.x, v73.y, 6, 0, Math.PI * 2);
    v69.fill();
    v69.fillStyle = "rgba(255, 215, 0, 0.6)";
    v69.beginPath();
    v69.arc(v73.x - 2, v73.y - 2, 2, 0, Math.PI * 2);
    v69.fill();
    v69.fillStyle = "#B87333";
  });
}
function addHammeredTexture(v74, v75, v76) {
  v74.save();
  v74.globalAlpha = 0.2;
  for (let v77 = 0; v77 < 80; v77++) {
    const v78 = Math.random() * v75;
    const v79 = Math.random() * v76;
    const v80 = 2 + Math.random() * 5;
    v74.fillStyle = "rgba(" + (180 + Math.random() * 40) + ", " + (120 + Math.random() * 30) + ", " + (50 + Math.random() * 20) + ", 0.8)";
    v74.beginPath();
    v74.arc(v78, v79, v80, 0, Math.PI * 2);
    v74.fill();
    v74.fillStyle = "rgba(255, 230, 150, 0.4)";
    v74.beginPath();
    v74.arc(v78 - v80 * 0.3, v79 - v80 * 0.3, v80 * 0.3, 0, Math.PI * 2);
    v74.fill();
  }
  v74.strokeStyle = "rgba(139, 69, 19, 0.3)";
  v74.lineWidth = 0.8;
  for (let v81 = 0; v81 < 40; v81++) {
    const v82 = Math.random() * v75;
    const v83 = Math.random() * v76;
    const v84 = 8 + Math.random() * 25;
    const v85 = Math.random() * Math.PI;
    v74.beginPath();
    v74.moveTo(v82, v83);
    v74.lineTo(v82 + Math.cos(v85) * v84, v83 + Math.sin(v85) * v84);
    v74.stroke();
  }
  v74.restore();
}
function addSignature(v86, v87, v88) {
  v86.save();
  const v89 = v87 - 120;
  const v90 = v88 - 20;
  v86.font = "italic 12px \"Arial\"";
  v86.fillStyle = "rgba(184, 115, 51, 0.7)";
  v86.textAlign = "right";
  v86.textBaseline = "bottom";
  v86.fillText("by " + (config.botName || "JuneX-Ultra"), v89, v90);
  v86.strokeStyle = "rgba(184, 115, 51, 0.4)";
  v86.lineWidth = 0.5;
  const v91 = v86.measureText("by " + (config.botName || "JuneX-Ultra")).width;
  v86.beginPath();
  v86.moveTo(v89 - v91, v90 + 2);
  v86.lineTo(v89, v90 + 2);
  v86.stroke();
  v86.restore();
}
async function generateSimpleCopperLogo(v92) {
  const v93 = createCanvas(600, 300);
  const v94 = v93.getContext('2d');
  v94.fillStyle = "#2a1a0a";
  v94.fillRect(0, 0, 600, 300);
  const v95 = v94.createLinearGradient(0, 50, 0, 250);
  v95.addColorStop(0, "#FFD700");
  v95.addColorStop(0.4, '#E6B800');
  v95.addColorStop(0.7, "#B87333");
  v95.addColorStop(1, "#8B4513");
  v94.font = "bold 70px Arial";
  v94.fillStyle = v95;
  v94.textAlign = "center";
  v94.textBaseline = "middle";
  v94.shadowColor = "rgba(184, 115, 51, 0.5)";
  v94.shadowBlur = 15;
  v94.shadowOffsetX = 4;
  v94.shadowOffsetY = 4;
  v94.fillText(v92.toUpperCase(), 300, 150);
  v94.strokeStyle = "#B87333";
  v94.lineWidth = 5;
  v94.strokeRect(15, 15, 570, 270);
  v94.font = "italic 10px \"Arial\"";
  v94.fillStyle = "rgba(184, 115, 51, 0.7)";
  v94.textAlign = 'right';
  v94.textBaseline = 'bottom';
  v94.fillText("by " + (config.botName || "JuneX-Ultra"), 580, 285);
  return v93.toBuffer('image/png');
}
