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
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = '#000000';
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "titaniumlogo",
  'description': "Create premium titanium metallic text logos with anodized effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🔘 *TITANIUM LOGO*\n\n*titanium*\ntitanium <text>\n\n*Example:*\ntitanium WOLF\ntitanium TITANIUM\ntitanium ELITE\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateTitaniumLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🔘 *Titanium Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [TITANIUMLOGO] ERROR:", v11);
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
async function generateTitaniumLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#0a0a14";
  v14.fillRect(0, 0, 800, 400);
  drawTitaniumBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 100, 0, 300);
  v15.addColorStop(0, "#E8E8E8");
  v15.addColorStop(0.15, "#D0D0D0");
  v15.addColorStop(0.3, '#B0B0B0');
  v15.addColorStop(0.45, "#909090");
  v15.addColorStop(0.6, "#707070");
  v15.addColorStop(0.75, '#505050');
  v15.addColorStop(0.9, '#383838');
  v15.addColorStop(1, "#202020");
  v14.font = "bold 86px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  createTitanium3DEffect(v14, v12, 800, 400, v15);
  addTitaniumHighlights(v14, v12, 800, 400);
  addAnodizedEffects(v14, v12, 800, 400);
  drawTitaniumBorder(v14, 800, 400);
  addBrushedTexture(v14, 800, 400);
  addSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawTitaniumBackground(v16, v17, v18) {
  const v19 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 1.5);
  v19.addColorStop(0, "#1a1a2e");
  v19.addColorStop(0.4, "#0f0f23");
  v19.addColorStop(0.8, "#050514");
  v19.addColorStop(1, "#000005");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.strokeStyle = "rgba(80, 100, 120, 0.1)";
  v16.lineWidth = 1;
  for (let v20 = -30; v20 < v17 + 30; v20 += 45) {
    for (let v21 = -30; v21 < v18 + 30; v21 += 30 * Math.sqrt(3)) {
      drawHexagon(v16, v20 + (v21 % (30 * Math.sqrt(3)) > 30 * Math.sqrt(3) / 2 ? 22.5 : 0), v21, 30);
    }
  }
  drawPrecisionCorners(v16, v17, v18);
}
function drawHexagon(v22, v23, v24, v25) {
  v22.beginPath();
  for (let v26 = 0; v26 < 6; v26++) {
    const v27 = v26 * Math.PI / 3;
    const v28 = v23 + v25 * Math.cos(v27);
    const v29 = v24 + v25 * Math.sin(v27);
    if (v26 === 0) {
      v22.moveTo(v28, v29);
    } else {
      v22.lineTo(v28, v29);
    }
  }
  v22.closePath();
  v22.stroke();
}
function createTitanium3DEffect(v30, v31, v32, v33, v34) {
  const v35 = v32 / 2;
  const v36 = v33 / 2;
  for (let v37 = 10; v37 > 0; v37--) {
    const v38 = v37 * 1.2;
    const v39 = 0.06 + v37 / 10 * 0.2;
    v30.fillStyle = "rgba(0, 0, 0, " + v39 + ')';
    v30.fillText(v31.toUpperCase(), v35 + v38, v36 + v38);
  }
  v30.shadowColor = "rgba(100, 120, 140, 0.3)";
  v30.shadowBlur = 12;
  v30.fillStyle = v34;
  v30.fillText(v31.toUpperCase(), v35, v36);
  v30.shadowColor = "transparent";
  v30.shadowBlur = 0;
  v30.strokeStyle = "rgba(180, 200, 220, 0.4)";
  v30.lineWidth = 1.2;
  v30.strokeText(v31.toUpperCase(), v35, v36);
}
function addTitaniumHighlights(v40, v41, v42, v43) {
  const v44 = v42 / 2;
  const v45 = v43 / 2;
  v40.save();
  const v46 = v40.createLinearGradient(v44 - 250, v45 - 60, v44 + 250, v45 - 15);
  v46.addColorStop(0, "rgba(240, 240, 255, 0)");
  v46.addColorStop(0.3, "rgba(240, 240, 255, 0.8)");
  v46.addColorStop(0.5, "rgba(255, 255, 255, 0.9)");
  v46.addColorStop(0.7, "rgba(240, 240, 255, 0.7)");
  v46.addColorStop(1, "rgba(240, 240, 255, 0)");
  v40.globalCompositeOperation = "screen";
  v40.fillStyle = v46;
  v40.font = "bold 86px \"Arial\"";
  v40.textAlign = "center";
  v40.textBaseline = "middle";
  v40.fillText(v41.toUpperCase(), v44, v45 - 2);
  v40.globalCompositeOperation = "source-over";
  const v47 = v40.measureText(v41.toUpperCase()).width;
  const v48 = [{
    'x': -0.35,
    'y': -0.35,
    'size': 0x4,
    'alpha': 0.9
  }, {
    'x': -0.18,
    'y': -0.42,
    'size': 0x5,
    'alpha': 0.95
  }, {
    'x': 0x0,
    'y': -0.38,
    'size': 0x4,
    'alpha': 0.9
  }, {
    'x': 0.18,
    'y': -0.42,
    'size': 0x5,
    'alpha': 0.95
  }, {
    'x': 0.35,
    'y': -0.35,
    'size': 0x4,
    'alpha': 0.9
  }];
  v48.forEach(v49 => {
    const v50 = v44 + v49.x * v47 / 2;
    const v51 = v45 + v49.y * 48;
    v40.fillStyle = "rgba(255, 255, 255, " + v49.alpha + ')';
    v40.beginPath();
    v40.arc(v50, v51, v49.size, 0, Math.PI * 2);
    v40.fill();
    v40.shadowColor = "rgba(200, 220, 255, 0.6)";
    v40.shadowBlur = 8;
    v40.fill();
  });
  v40.restore();
}
function addAnodizedEffects(v52, v53, v54, v55) {
  const v56 = v54 / 2;
  const v57 = v55 / 2;
  v52.save();
  v52.globalCompositeOperation = "overlay";
  const v58 = v52.createLinearGradient(v56 - 200, v57 + 20, v56 + 200, v57 - 30);
  v58.addColorStop(0, "rgba(100, 150, 255, 0.2)");
  v58.addColorStop(0.5, "rgba(150, 100, 255, 0.25)");
  v58.addColorStop(1, "rgba(100, 200, 255, 0.2)");
  v52.fillStyle = v58;
  v52.font = "bold 86px \"Arial\"";
  v52.textAlign = 'center';
  v52.textBaseline = 'middle';
  v52.fillText(v53.toUpperCase(), v56, v57);
  v52.globalCompositeOperation = "screen";
  const v59 = v52.measureText(v53.toUpperCase()).width;
  const v60 = [{
    'x': -0.25,
    'y': 0.15,
    'size': 0x6,
    'color': "rgba(255, 100, 100, 0.3)"
  }, {
    'x': -0.1,
    'y': 0.25,
    'size': 0x5,
    'color': "rgba(255, 200, 100, 0.25)"
  }, {
    'x': 0.1,
    'y': 0.15,
    'size': 0x7,
    'color': "rgba(100, 255, 100, 0.35)"
  }, {
    'x': 0.25,
    'y': 0.25,
    'size': 0x4,
    'color': "rgba(100, 200, 255, 0.3)"
  }];
  v60.forEach(v61 => {
    const v62 = v56 + v61.x * v59 / 2;
    const v63 = v57 + v61.y * 35;
    const v64 = v52.createRadialGradient(v62, v63, 0, v62, v63, v61.size * 2);
    v64.addColorStop(0, v61.color);
    v64.addColorStop(1, "transparent");
    v52.fillStyle = v64;
    v52.beginPath();
    v52.arc(v62, v63, v61.size * 2, 0, Math.PI * 2);
    v52.fill();
  });
  v52.restore();
}
function drawTitaniumBorder(v65, v66, v67) {
  const v68 = v65.createLinearGradient(0, 0, v66, v67);
  v68.addColorStop(0, "#E8E8E8");
  v68.addColorStop(0.25, "#C8C8C8");
  v68.addColorStop(0.5, "#A8A8A8");
  v68.addColorStop(0.75, "#C8C8C8");
  v68.addColorStop(1, "#E8E8E8");
  v65.strokeStyle = v68;
  v65.lineWidth = 7;
  v65.shadowColor = "rgba(100, 120, 140, 0.4)";
  v65.shadowBlur = 18;
  v65.strokeRect(16, 16, v66 - 32, v67 - 32);
  v65.strokeStyle = "rgba(180, 200, 220, 0.5)";
  v65.lineWidth = 2;
  v65.shadowBlur = 0;
  v65.strokeRect(28, 28, v66 - 56, v67 - 56);
  v65.strokeStyle = "rgba(100, 150, 255, 0.3)";
  v65.lineWidth = 1;
  v65.strokeRect(36, 36, v66 - 72, v67 - 72);
  drawAerospaceFasteners(v65, v66, v67);
}
function drawAerospaceFasteners(v69, v70, v71) {
  v69.fillStyle = '#B0B0B0';
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
  }, {
    'x': 0x23,
    'y': v71 / 2
  }, {
    'x': v70 - 35,
    'y': v71 / 2
  }];
  v72.forEach(v73 => {
    v69.save();
    v69.translate(v73.x, v73.y);
    v69.rotate(Math.PI / 6);
    v69.beginPath();
    for (let v74 = 0; v74 < 6; v74++) {
      const v75 = v74 * Math.PI / 3;
      const v76 = 4 * Math.cos(v75);
      const v77 = 4 * Math.sin(v75);
      if (v74 === 0) {
        v69.moveTo(v76, v77);
      } else {
        v69.lineTo(v76, v77);
      }
    }
    v69.closePath();
    v69.fill();
    v69.fillStyle = "rgba(255, 255, 255, 0.6)";
    v69.beginPath();
    v69.arc(0, 0, 1.5, 0, Math.PI * 2);
    v69.fill();
    v69.restore();
    v69.fillStyle = '#B0B0B0';
  });
}
function addBrushedTexture(v78, v79, v80) {
  v78.save();
  v78.globalAlpha = 0.15;
  v78.strokeStyle = "rgba(255, 255, 255, 0.3)";
  v78.lineWidth = 0.8;
  for (let v81 = 0; v81 < v80; v81 += 2) {
    v78.beginPath();
    v78.moveTo(0, v81);
    v78.lineTo(v79, v81);
    v78.stroke();
  }
  for (let v82 = 0; v82 < 30; v82++) {
    const v83 = Math.random() * v79;
    const v84 = Math.random() * v80;
    const v85 = 5 + Math.random() * 15;
    v78.strokeStyle = "rgba(150, 150, 150, 0.4)";
    v78.lineWidth = 0.5;
    v78.beginPath();
    v78.moveTo(v83, v84);
    v78.lineTo(v83 + v85, v84);
    v78.stroke();
  }
  v78.restore();
}
function drawPrecisionCorners(v86, v87, v88) {
  v86.strokeStyle = "rgba(120, 140, 160, 0.4)";
  v86.lineWidth = 2;
  v86.beginPath();
  v86.moveTo(25, 45);
  v86.lineTo(25, 33);
  v86.moveTo(25, 25);
  v86.lineTo(33, 25);
  v86.stroke();
  v86.beginPath();
  v86.moveTo(v87 - 25, 45);
  v86.lineTo(v87 - 25, 33);
  v86.moveTo(v87 - 25, 25);
  v86.lineTo(v87 - 25 - 8, 25);
  v86.stroke();
  v86.beginPath();
  v86.moveTo(25, v88 - 25 - 20);
  v86.lineTo(25, v88 - 25 - 8);
  v86.moveTo(25, v88 - 25);
  v86.lineTo(33, v88 - 25);
  v86.stroke();
  v86.beginPath();
  v86.moveTo(v87 - 25, v88 - 25 - 20);
  v86.lineTo(v87 - 25, v88 - 25 - 8);
  v86.moveTo(v87 - 25, v88 - 25);
  v86.lineTo(v87 - 25 - 8, v88 - 25);
  v86.stroke();
}
function addSignature(v89, v90, v91) {
  v89.save();
  const v92 = v90 - 120;
  const v93 = v91 - 20;
  v89.font = "italic 12px \"Arial\"";
  v89.fillStyle = "rgba(160, 180, 200, 0.7)";
  v89.textAlign = 'right';
  v89.textBaseline = "bottom";
  v89.fillText("by " + (config.botName || "JuneX-Ultra"), v92, v93);
  v89.strokeStyle = "rgba(160, 180, 200, 0.4)";
  v89.lineWidth = 0.5;
  const v94 = v89.measureText("by " + (config.botName || "JuneX-Ultra")).width;
  v89.beginPath();
  v89.moveTo(v92 - v94, v93 + 2);
  v89.lineTo(v92, v93 + 2);
  v89.stroke();
  v89.restore();
}
async function generateSimpleTitaniumLogo(v95) {
  const v96 = createCanvas(600, 300);
  const v97 = v96.getContext('2d');
  v97.fillStyle = "#0a0a14";
  v97.fillRect(0, 0, 600, 300);
  const v98 = v97.createLinearGradient(0, 50, 0, 250);
  v98.addColorStop(0, "#E8E8E8");
  v98.addColorStop(0.4, "#C8C8C8");
  v98.addColorStop(0.7, "#A8A8A8");
  v98.addColorStop(1, "#888888");
  v97.font = "bold 72px Arial";
  v97.fillStyle = v98;
  v97.textAlign = "center";
  v97.textBaseline = "middle";
  v97.shadowColor = "rgba(100, 120, 140, 0.5)";
  v97.shadowBlur = 15;
  v97.shadowOffsetX = 4;
  v97.shadowOffsetY = 4;
  v97.fillText(v95.toUpperCase(), 300, 150);
  v97.strokeStyle = "#C8C8C8";
  v97.lineWidth = 5;
  v97.strokeRect(15, 15, 570, 270);
  v97.font = "italic 10px \"Arial\"";
  v97.fillStyle = "rgba(160, 180, 200, 0.7)";
  v97.textAlign = "right";
  v97.textBaseline = 'bottom';
  v97.fillText("by " + (config.botName || "JuneX-Ultra"), 580, 285);
  return v96.toBuffer("image/png");
}
