const {
  createCanvas
} = require('@napi-rs/canvas');
const config = require('../../config');
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
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "glowlogo",
  'description': "Create intense glowing text logos with vibrant light effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "✨ *GLOW LOGO*\n\n*glowlogo*\nglowlogo <text>\n\n*Example:*\nglowlogo WOLF\nglowlogo GLOW\nglowlogo LIGHT\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 12) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 12 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
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
      const v10 = await generateGlowLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "✨ *Glow Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [GLOWLOGO] ERROR:", v11);
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
async function generateGlowLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#000000";
  v14.fillRect(0, 0, 800, 400);
  drawCosmicBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 70, 0, 330);
  v15.addColorStop(0, "#FF0080");
  v15.addColorStop(0.2, "#FF00FF");
  v15.addColorStop(0.4, "#8000FF");
  v15.addColorStop(0.6, "#0080FF");
  v15.addColorStop(0.8, "#00FF80");
  v15.addColorStop(1, "#FFFF00");
  v14.font = "bold 88px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = 'middle';
  createMultiLayerGlow(v14, v12, 800, 400, v15);
  addLightBursts(v14, 800, 400);
  addGlowParticles(v14, 800, 400);
  addRainbowAura(v14, v12, 800, 400);
  drawHolographicBorder(v14, 800, 400);
  addSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawCosmicBackground(v16, v17, v18) {
  const v19 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 1.2);
  v19.addColorStop(0, '#000033');
  v19.addColorStop(0.3, "#000022");
  v19.addColorStop(0.7, "#000011");
  v19.addColorStop(1, "#000000");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.fillStyle = "#FFFFFF";
  for (let v20 = 0; v20 < 150; v20++) {
    const v21 = Math.random() * v17;
    const v22 = Math.random() * v18;
    const v23 = Math.random() * 2;
    const v24 = 0.3 + Math.random() * 0.7;
    v16.globalAlpha = v24;
    v16.beginPath();
    v16.arc(v21, v22, v23, 0, Math.PI * 2);
    v16.fill();
  }
  v16.globalAlpha = 1;
  addNebulaEffects(v16, v17, v18);
}
function addNebulaEffects(v25, v26, v27) {
  const v28 = [{
    'x': v26 * 0.2,
    'y': v27 * 0.3,
    'size': 0x96,
    'color': "rgba(255, 0, 128, 0.1)"
  }, {
    'x': v26 * 0.7,
    'y': v27 * 0.2,
    'size': 0x78,
    'color': "rgba(128, 0, 255, 0.08)"
  }, {
    'x': v26 * 0.3,
    'y': v27 * 0.7,
    'size': 0x82,
    'color': "rgba(0, 128, 255, 0.09)"
  }, {
    'x': v26 * 0.8,
    'y': v27 * 0.6,
    'size': 0x6e,
    'color': "rgba(0, 255, 128, 0.07)"
  }];
  v28.forEach(v29 => {
    const v30 = v25.createRadialGradient(v29.x, v29.y, 0, v29.x, v29.y, v29.size);
    v30.addColorStop(0, v29.color);
    v30.addColorStop(1, "transparent");
    v25.fillStyle = v30;
    v25.beginPath();
    v25.arc(v29.x, v29.y, v29.size, 0, Math.PI * 2);
    v25.fill();
  });
}
function createMultiLayerGlow(v31, v32, v33, v34, v35) {
  const v36 = v33 / 2;
  const v37 = v34 / 2;
  const v38 = [{
    'blur': 0x3c,
    'alpha': 0.3,
    'color': '#FF0080',
    'offset': 0x0
  }, {
    'blur': 0x32,
    'alpha': 0.4,
    'color': "#FF00FF",
    'offset': 0x1
  }, {
    'blur': 0x28,
    'alpha': 0.5,
    'color': '#8000FF',
    'offset': 0x2
  }, {
    'blur': 0x1e,
    'alpha': 0.6,
    'color': "#0080FF",
    'offset': 0x1
  }, {
    'blur': 0x14,
    'alpha': 0.7,
    'color': "#00FF80",
    'offset': 0x0
  }, {
    'blur': 0xa,
    'alpha': 0.8,
    'color': "#FFFF00",
    'offset': -1
  }];
  for (const v39 of v38) {
    v31.shadowColor = v39.color;
    v31.shadowBlur = v39.blur;
    v31.fillStyle = "rgba(255, 255, 255, " + v39.alpha + ')';
    v31.fillText(v32.toUpperCase(), v36 + v39.offset, v37 + v39.offset);
  }
  v31.shadowColor = "transparent";
  v31.shadowBlur = 0;
  v31.fillStyle = v35;
  v31.fillText(v32.toUpperCase(), v36, v37);
  v31.save();
  v31.globalCompositeOperation = "screen";
  v31.fillStyle = "rgba(255, 255, 255, 0.6)";
  v31.fillText(v32.toUpperCase(), v36, v37);
  v31.restore();
  v31.strokeStyle = "rgba(255, 255, 255, 0.9)";
  v31.lineWidth = 2;
  v31.strokeText(v32.toUpperCase(), v36, v37);
}
function addLightBursts(v40, v41, v42) {
  const v43 = v41 / 2;
  const v44 = v42 / 2;
  v40.save();
  v40.globalAlpha = 0.4;
  for (let v45 = 0; v45 < 3; v45++) {
    const v46 = 200 + v45 * 100;
    const v47 = 0.3 - v45 * 0.1;
    for (let v48 = 0; v48 < 24; v48++) {
      const v49 = v48 / 24 * Math.PI * 2;
      const v50 = v40.createLinearGradient(v43, v44, v43 + Math.cos(v49) * v46, v44 + Math.sin(v49) * v46);
      const v51 = v48 * 15 % 360;
      v50.addColorStop(0, 'hsla(' + v51 + ", 100%, 70%, " + v47 + ')');
      v50.addColorStop(0.7, "hsla(" + v51 + ", 100%, 50%, " + v47 * 0.5 + ')');
      v50.addColorStop(1, 'transparent');
      v40.strokeStyle = v50;
      v40.lineWidth = 8 - v45 * 2;
      v40.beginPath();
      v40.moveTo(v43, v44);
      v40.lineTo(v43 + Math.cos(v49) * v46, v44 + Math.sin(v49) * v46);
      v40.stroke();
    }
  }
  v40.restore();
}
function addGlowParticles(v52, v53, v54) {
  const v55 = v53 / 2;
  const v56 = v54 / 2;
  v52.save();
  v52.globalAlpha = 0.8;
  for (let v57 = 0; v57 < 25; v57++) {
    const v58 = Math.random() * Math.PI * 2;
    const v59 = 80 + Math.random() * 250;
    const v60 = 3 + Math.random() * 8;
    const v61 = Math.random() * 360;
    const v62 = v55 + Math.cos(v58) * v59;
    const v63 = v56 + Math.sin(v58) * v59;
    const v64 = v52.createRadialGradient(v62, v63, 0, v62, v63, v60 * 3);
    v64.addColorStop(0, "hsla(" + v61 + ", 100%, 80%, 0.9)");
    v64.addColorStop(0.7, "hsla(" + v61 + ", 100%, 60%, 0.6)");
    v64.addColorStop(1, "transparent");
    v52.fillStyle = v64;
    v52.beginPath();
    v52.arc(v62, v63, v60 * 3, 0, Math.PI * 2);
    v52.fill();
    v52.fillStyle = "hsla(" + v61 + ", 100%, 90%, 0.8)";
    v52.beginPath();
    v52.arc(v62, v63, v60 * 0.7, 0, Math.PI * 2);
    v52.fill();
  }
  for (let v65 = 0; v65 < 40; v65++) {
    const v66 = Math.random() * v53;
    const v67 = Math.random() * v54;
    const v68 = 1 + Math.random() * 3;
    const v69 = Math.random() * 360;
    const v70 = 0.7 + Math.random() * 0.3;
    v52.fillStyle = 'hsla(' + v69 + ", 100%, 80%, " + v70 + ')';
    v52.beginPath();
    for (let v71 = 0; v71 < 5; v71++) {
      const v72 = v71 * Math.PI * 2 / 5;
      const v73 = v68 * 0.4;
      v52.lineTo(v66 + Math.cos(v72) * v68, v67 + Math.sin(v72) * v68);
      v52.lineTo(v66 + Math.cos(v72 + Math.PI / 5) * v73, v67 + Math.sin(v72 + Math.PI / 5) * v73);
    }
    v52.closePath();
    v52.fill();
    v52.shadowColor = "hsla(" + v69 + ", 100%, 70%, 0.8)";
    v52.shadowBlur = 12;
    v52.fill();
  }
  v52.restore();
}
function addRainbowAura(v74, v75, v76, v77) {
  const v78 = v76 / 2;
  const v79 = v77 / 2;
  v74.save();
  v74.globalCompositeOperation = "screen";
  for (let v80 = 0; v80 < 3; v80++) {
    const v81 = 120 + v80 * 40;
    const v82 = 0.2 - v80 * 0.05;
    for (let v83 = 0; v83 < 36; v83++) {
      const v84 = v83 / 36 * Math.PI * 2;
      const v85 = v83 * 10 % 360;
      const v86 = v78 + Math.cos(v84) * v81;
      const v87 = v79 + Math.sin(v84) * v81;
      const v88 = v74.createRadialGradient(v86, v87, 0, v86, v87, 30);
      v88.addColorStop(0, "hsla(" + v85 + ", 100%, 70%, " + v82 + ')');
      v88.addColorStop(1, 'transparent');
      v74.fillStyle = v88;
      v74.beginPath();
      v74.arc(v86, v87, 30, 0, Math.PI * 2);
      v74.fill();
    }
  }
  v74.restore();
}
function drawHolographicBorder(v89, v90, v91) {
  const v92 = v89.createLinearGradient(0, 0, v90, v91);
  v92.addColorStop(0, '#FF0080');
  v92.addColorStop(0.2, '#FF00FF');
  v92.addColorStop(0.4, "#8000FF");
  v92.addColorStop(0.6, "#0080FF");
  v92.addColorStop(0.8, "#00FF80");
  v92.addColorStop(1, "#FFFF00");
  v89.strokeStyle = v92;
  v89.lineWidth = 10;
  v89.shadowColor = "#FFFFFF";
  v89.shadowBlur = 30;
  v89.strokeRect(10, 10, v90 - 20, v91 - 20);
  v89.strokeStyle = "rgba(255, 255, 255, 0.6)";
  v89.lineWidth = 4;
  v89.shadowBlur = 20;
  v89.strokeRect(18, 18, v90 - 36, v91 - 36);
  const v93 = v89.createLinearGradient(v90, 0, 0, v91);
  v93.addColorStop(0, "#FFFF00");
  v93.addColorStop(0.2, "#00FF80");
  v93.addColorStop(0.4, "#0080FF");
  v93.addColorStop(0.6, "#8000FF");
  v93.addColorStop(0.8, "#FF00FF");
  v93.addColorStop(1, "#FF0080");
  v89.strokeStyle = v93;
  v89.lineWidth = 2;
  v89.shadowBlur = 0;
  v89.strokeRect(26, 26, v90 - 52, v91 - 52);
  addCornerGlowAccents(v89, v90, v91);
}
function addCornerGlowAccents(v94, v95, v96) {
  v94.save();
  v94.globalAlpha = 0.7;
  const v97 = [{
    'x': 0x19,
    'y': 0x19
  }, {
    'x': v95 - 25,
    'y': 0x19
  }, {
    'x': 0x19,
    'y': v96 - 25
  }, {
    'x': v95 - 25,
    'y': v96 - 25
  }];
  v97.forEach((v98, v99) => {
    const v100 = v99 * 90 % 360;
    const v101 = v94.createRadialGradient(v98.x, v98.y, 0, v98.x, v98.y, 25);
    v101.addColorStop(0, 'hsla(' + v100 + ", 100%, 70%, 0.9)");
    v101.addColorStop(1, "transparent");
    v94.fillStyle = v101;
    v94.beginPath();
    v94.arc(v98.x, v98.y, 25, 0, Math.PI * 2);
    v94.fill();
  });
  v94.restore();
}
function addSignature(v102, v103, v104) {
  v102.save();
  const v105 = v103 - 120;
  const v106 = v104 - 20;
  v102.font = "italic 12px \"Arial\"";
  v102.fillStyle = "rgba(255, 255, 255, 0.8)";
  v102.textAlign = "right";
  v102.textBaseline = 'bottom';
  v102.shadowColor = "#FF00FF";
  v102.shadowBlur = 8;
  v102.fillText("by " + (config.botName || "JuneX-Ultra"), v105, v106);
  const v107 = v102.createLinearGradient(v105 - v102.measureText("by " + (config.botName || "JuneX-Ultra")).width, v106 + 2, v105, v106 + 2);
  v107.addColorStop(0, "#FF0080");
  v107.addColorStop(0.5, '#0080FF');
  v107.addColorStop(1, "#FFFF00");
  v102.strokeStyle = v107;
  v102.lineWidth = 1;
  v102.beginPath();
  v102.moveTo(v105 - v102.measureText("by " + (config.botName || "JuneX-Ultra")).width, v106 + 2);
  v102.lineTo(v105, v106 + 2);
  v102.stroke();
  v102.shadowColor = "transparent";
  v102.shadowBlur = 0;
  v102.restore();
}
