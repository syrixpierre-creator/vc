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
  v1.shadowColor = 'transparent';
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
  'name': "iceglowlogo",
  'description': "Create glowing ice text logos with radiant light effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "💠 *ICE GLOW LOGO*\n\n*iceglowlogo*\niceglowlogo <text>\n\n*Example:*\niceglowlogo WOLF\niceglowlogo GLOW\niceglowlogo FROZEN\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateIceGlowLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "💠 *Ice Glow Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [ICEGLOWLOGO] ERROR:", v11);
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
async function generateIceGlowLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = '#050a14';
  v14.fillRect(0, 0, 800, 400);
  drawGlowingBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 80, 0, 320);
  v15.addColorStop(0, "#FFFFFF");
  v15.addColorStop(0.2, "#B8F8FF");
  v15.addColorStop(0.4, "#80F0FF");
  v15.addColorStop(0.6, "#48E8FF");
  v15.addColorStop(0.8, "#20E0FF");
  v15.addColorStop(1, '#00D8FF');
  v14.font = "bold 86px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  createIceGlowEffect(v14, v12, 800, 400, v15);
  addLightRays(v14, 800, 400);
  addGlowParticles(v14, 800, 400);
  addCrystalGlow(v14, v12, 800, 400);
  drawRadiantBorder(v14, 800, 400);
  addSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer('image/png');
}
function drawGlowingBackground(v16, v17, v18) {
  const v19 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 1.2);
  v19.addColorStop(0, '#001a33');
  v19.addColorStop(0.3, '#000a1a');
  v19.addColorStop(0.7, "#000514");
  v19.addColorStop(1, "#000000");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.fillStyle = "#FFFFFF";
  for (let v20 = 0; v20 < 100; v20++) {
    const v21 = Math.random() * v17;
    const v22 = Math.random() * v18;
    const v23 = Math.random() * 1.5;
    const v24 = 0.3 + Math.random() * 0.7;
    v16.globalAlpha = v24;
    v16.beginPath();
    v16.arc(v21, v22, v23, 0, Math.PI * 2);
    v16.fill();
  }
  v16.globalAlpha = 1;
  const v25 = v16.createLinearGradient(0, 0, 0, v18);
  v25.addColorStop(0, "rgba(0, 100, 255, 0.1)");
  v25.addColorStop(0.5, "rgba(0, 200, 255, 0.05)");
  v25.addColorStop(1, "rgba(0, 150, 255, 0.08)");
  v16.fillStyle = v25;
  v16.fillRect(0, 0, v17, v18);
  addNebulaClouds(v16, v17, v18);
}
function addNebulaClouds(v26, v27, v28) {
  v26.save();
  v26.globalAlpha = 0.3;
  const v29 = [{
    'x': v27 * 0.2,
    'y': v28 * 0.3,
    'size': 0x78,
    'color': "rgba(0, 100, 255, 0.4)"
  }, {
    'x': v27 * 0.7,
    'y': v28 * 0.2,
    'size': 0x5a,
    'color': "rgba(0, 150, 255, 0.3)"
  }, {
    'x': v27 * 0.3,
    'y': v28 * 0.7,
    'size': 0x6e,
    'color': "rgba(0, 80, 255, 0.35)"
  }, {
    'x': v27 * 0.8,
    'y': v28 * 0.6,
    'size': 0x50,
    'color': "rgba(0, 120, 255, 0.25)"
  }];
  v29.forEach(v30 => {
    const v31 = v26.createRadialGradient(v30.x, v30.y, 0, v30.x, v30.y, v30.size);
    v31.addColorStop(0, v30.color);
    v31.addColorStop(1, "transparent");
    v26.fillStyle = v31;
    v26.beginPath();
    v26.arc(v30.x, v30.y, v30.size, 0, Math.PI * 2);
    v26.fill();
  });
  v26.restore();
}
function createIceGlowEffect(v32, v33, v34, v35, v36) {
  const v37 = v34 / 2;
  const v38 = v35 / 2;
  const v39 = [{
    'blur': 0x32,
    'alpha': 0.3,
    'offset': 0x0,
    'color': "#00D8FF"
  }, {
    'blur': 0x28,
    'alpha': 0.4,
    'offset': 0x0,
    'color': "#20E0FF"
  }, {
    'blur': 0x1e,
    'alpha': 0.5,
    'offset': 0x0,
    'color': '#48E8FF'
  }, {
    'blur': 0x14,
    'alpha': 0.6,
    'offset': 0x0,
    'color': "#80F0FF"
  }, {
    'blur': 0xa,
    'alpha': 0.7,
    'offset': 0x0,
    'color': '#B8F8FF'
  }];
  for (const v40 of v39) {
    v32.shadowColor = v40.color;
    v32.shadowBlur = v40.blur;
    v32.fillStyle = "rgba(255, 255, 255, " + v40.alpha + ')';
    v32.fillText(v33.toUpperCase(), v37, v38 + v40.offset);
  }
  v32.shadowColor = "transparent";
  v32.shadowBlur = 0;
  v32.fillStyle = v36;
  v32.fillText(v33.toUpperCase(), v37, v38);
  v32.save();
  v32.globalCompositeOperation = 'screen';
  v32.fillStyle = "rgba(180, 240, 255, 0.6)";
  v32.fillText(v33.toUpperCase(), v37, v38);
  v32.restore();
  v32.strokeStyle = "rgba(255, 255, 255, 0.8)";
  v32.lineWidth = 1.5;
  v32.strokeText(v33.toUpperCase(), v37, v38);
}
function addLightRays(v41, v42, v43) {
  const v44 = v42 / 2;
  const v45 = v43 / 2;
  v41.save();
  v41.globalAlpha = 0.4;
  for (let v46 = 0; v46 < 16; v46++) {
    const v47 = v46 / 16 * Math.PI * 2;
    const v48 = Math.sin(Date.now() * 0.001 + v46) * 0.2 + 0.8;
    const v49 = v41.createLinearGradient(v44, v45, v44 + Math.cos(v47) * 450, v45 + Math.sin(v47) * 450);
    v49.addColorStop(0, "rgba(0, 216, 255, " + 0.9 * v48 + ')');
    v49.addColorStop(0.7, "rgba(0, 150, 255, " + 0.5 * v48 + ')');
    v49.addColorStop(1, "transparent");
    v41.strokeStyle = v49;
    v41.lineWidth = 12;
    v41.beginPath();
    v41.moveTo(v44, v45);
    v41.lineTo(v44 + Math.cos(v47) * 450, v45 + Math.sin(v47) * 450);
    v41.stroke();
  }
  v41.restore();
}
function addGlowParticles(v50, v51, v52) {
  const v53 = v51 / 2;
  const v54 = v52 / 2;
  v50.save();
  v50.globalAlpha = 0.8;
  for (let v55 = 0; v55 < 60; v55++) {
    const v56 = Math.random() * Math.PI * 2;
    const v57 = 50 + Math.random() * 200;
    const v58 = 1 + Math.random() * 4;
    const v59 = Math.sin(Date.now() * 0.002 + v55) * 0.3 + 0.7;
    const v60 = v53 + Math.cos(v56) * v57;
    const v61 = v54 + Math.sin(v56) * v57;
    const v62 = v50.createRadialGradient(v60, v61, 0, v60, v61, v58 * 3);
    v62.addColorStop(0, "rgba(0, 216, 255, " + 0.9 * v59 + ')');
    v62.addColorStop(0.5, "rgba(0, 150, 255, " + 0.6 * v59 + ')');
    v62.addColorStop(1, "transparent");
    v50.fillStyle = v62;
    v50.beginPath();
    v50.arc(v60, v61, v58 * 3, 0, Math.PI * 2);
    v50.fill();
  }
  for (let v63 = 0; v63 < 25; v63++) {
    const v64 = Math.random() * v51;
    const v65 = Math.random() * v52;
    const v66 = 2 + Math.random() * 3;
    const v67 = 0.7 + Math.random() * 0.3;
    v50.fillStyle = "rgba(255, 255, 255, " + v67 + ')';
    v50.beginPath();
    for (let v68 = 0; v68 < 5; v68++) {
      const v69 = v68 * Math.PI * 2 / 5;
      const v70 = v66 * 0.4;
      v50.lineTo(v64 + Math.cos(v69) * v66, v65 + Math.sin(v69) * v66);
      v50.lineTo(v64 + Math.cos(v69 + Math.PI / 5) * v70, v65 + Math.sin(v69 + Math.PI / 5) * v70);
    }
    v50.closePath();
    v50.fill();
    v50.shadowColor = "rgba(0, 216, 255, 0.8)";
    v50.shadowBlur = 10;
    v50.fill();
  }
  v50.restore();
}
function addCrystalGlow(v71, v72, v73, v74) {
  const v75 = v73 / 2;
  const v76 = v74 / 2;
  const v77 = v71.measureText(v72.toUpperCase()).width;
  v71.save();
  v71.globalAlpha = 0.9;
  const v78 = [{
    'x': -0.35,
    'y': -0.3,
    'size': 0x6,
    'intensity': 0.9
  }, {
    'x': -0.2,
    'y': -0.4,
    'size': 0x7,
    'intensity': 0x1
  }, {
    'x': -0.05,
    'y': -0.35,
    'size': 0x5,
    'intensity': 0.8
  }, {
    'x': 0.1,
    'y': -0.4,
    'size': 0x6,
    'intensity': 0.9
  }, {
    'x': 0.25,
    'y': -0.3,
    'size': 0x5,
    'intensity': 0.8
  }, {
    'x': 0.35,
    'y': -0.25,
    'size': 0x4,
    'intensity': 0.7
  }, {
    'x': -0.3,
    'y': 0.2,
    'size': 0x3,
    'intensity': 0.6
  }, {
    'x': 0.25,
    'y': 0.25,
    'size': 0x3,
    'intensity': 0.6
  }];
  v78.forEach(v79 => {
    const v80 = v75 + v79.x * v77 / 2;
    const v81 = v76 + v79.y * 45;
    const v82 = v71.createRadialGradient(v80, v81, 0, v80, v81, v79.size * 2);
    v82.addColorStop(0, "rgba(255, 255, 255, " + v79.intensity + ')');
    v82.addColorStop(0.7, "rgba(0, 216, 255, " + v79.intensity * 0.7 + ')');
    v82.addColorStop(1, 'transparent');
    v71.fillStyle = v82;
    v71.beginPath();
    v71.arc(v80, v81, v79.size * 2, 0, Math.PI * 2);
    v71.fill();
    v71.fillStyle = "rgba(255, 255, 255, " + v79.intensity + ')';
    v71.beginPath();
    v71.arc(v80, v81, v79.size * 0.5, 0, Math.PI * 2);
    v71.fill();
  });
  v71.restore();
}
function drawRadiantBorder(v83, v84, v85) {
  const v86 = v83.createLinearGradient(0, 0, v84, v85);
  v86.addColorStop(0, "#B8F8FF");
  v86.addColorStop(0.25, "#80F0FF");
  v86.addColorStop(0.5, "#20E0FF");
  v86.addColorStop(0.75, "#80F0FF");
  v86.addColorStop(1, "#B8F8FF");
  v83.strokeStyle = v86;
  v83.lineWidth = 8;
  v83.shadowColor = "rgba(0, 216, 255, 0.8)";
  v83.shadowBlur = 25;
  v83.strokeRect(12, 12, v84 - 24, v85 - 24);
  v83.strokeStyle = "rgba(180, 240, 255, 0.6)";
  v83.lineWidth = 3;
  v83.shadowBlur = 15;
  v83.strokeRect(20, 20, v84 - 40, v85 - 40);
  v83.strokeStyle = "rgba(255, 255, 255, 0.4)";
  v83.lineWidth = 1;
  v83.shadowBlur = 0;
  v83.strokeRect(28, 28, v84 - 56, v85 - 56);
  addCornerGlow(v83, v84, v85);
}
function addCornerGlow(v87, v88, v89) {
  v87.save();
  v87.globalAlpha = 0.6;
  const v90 = [{
    'x': 0x19,
    'y': 0x19
  }, {
    'x': v88 - 25,
    'y': 0x19
  }, {
    'x': 0x19,
    'y': v89 - 25
  }, {
    'x': v88 - 25,
    'y': v89 - 25
  }];
  v90.forEach(v91 => {
    const v92 = v87.createRadialGradient(v91.x, v91.y, 0, v91.x, v91.y, 20);
    v92.addColorStop(0, "rgba(0, 216, 255, 0.9)");
    v92.addColorStop(1, "transparent");
    v87.fillStyle = v92;
    v87.beginPath();
    v87.arc(v91.x, v91.y, 20, 0, Math.PI * 2);
    v87.fill();
  });
  v87.restore();
}
function addSignature(v93, v94, v95) {
  v93.save();
  const v96 = v94 - 120;
  const v97 = v95 - 20;
  v93.font = "italic 12px \"Arial\"";
  v93.fillStyle = "rgba(0, 216, 255, 0.8)";
  v93.textAlign = "right";
  v93.textBaseline = "bottom";
  v93.shadowColor = "rgba(0, 150, 255, 0.6)";
  v93.shadowBlur = 5;
  v93.fillText("by " + (config.botName || "JuneX-Ultra"), v96, v97);
  v93.strokeStyle = "rgba(0, 216, 255, 0.5)";
  v93.lineWidth = 0.8;
  const v98 = v93.measureText("by " + (config.botName || "JuneX-Ultra")).width;
  v93.beginPath();
  v93.moveTo(v96 - v98, v97 + 2);
  v93.lineTo(v96, v97 + 2);
  v93.stroke();
  v93.shadowColor = "transparent";
  v93.shadowBlur = 0;
  v93.restore();
}
