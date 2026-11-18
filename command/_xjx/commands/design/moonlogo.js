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
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "moonlogo",
  'description': "Create stunning text logos with realistic moon background and cosmic effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🌙 *MOON LOGO*\n\n*moonlogo*\nmoonlogo <text>\n\n*Example:*\nmoonlogo LUNA\nmoonlogo MOON\nmoonlogo NIGHT\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 10) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 10 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
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
      const v10 = await generateMoonLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🌙 *Moon Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [MOONLOGO] ERROR:", v11);
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
async function generateMoonLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createDeepSpaceBackground(v14, 800, 400);
  drawRealisticMoon(v14, 600, 120, 120);
  addMoonGlow(v14, 600, 120, 120);
  addLensFlare(v14, 600, 120, 120);
  drawCosmicText(v14, v12, 800, 400);
  addDetailedStars(v14, 800, 400);
  addShootingStars(v14, 800, 400);
  addCosmicDust(v14, 800, 400);
  addNebulaBackground(v14, 800, 400);
  drawCosmicBorder(v14, 800, 400);
  addMoonSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createDeepSpaceBackground(v15, v16, v17) {
  const v18 = v15.createRadialGradient(v16 * 0.3, v17 * 0.3, 0, v16, v17, Math.max(v16, v17) * 0.8);
  v18.addColorStop(0, "#0a0a2a");
  v18.addColorStop(0.4, "#070720");
  v18.addColorStop(0.7, "#050515");
  v18.addColorStop(1, "#000005");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addGalaxyClouds(v15, v16, v17);
}
function drawRealisticMoon(v19, v20, v21, v22) {
  v19.save();
  const v23 = v19.createRadialGradient(v20, v21, 0, v20, v21, v22 * 1.5);
  v23.addColorStop(0, "rgba(200, 200, 210, 0.3)");
  v23.addColorStop(0.7, "rgba(150, 150, 170, 0.1)");
  v23.addColorStop(1, "transparent");
  v19.fillStyle = v23;
  v19.beginPath();
  v19.arc(v20, v21, v22 * 1.5, 0, Math.PI * 2);
  v19.fill();
  const v24 = v19.createRadialGradient(v20 - v22 * 0.3, v21 - v22 * 0.2, 0, v20, v21, v22);
  v24.addColorStop(0, "#e8e8e8");
  v24.addColorStop(0.3, "#d0d0d0");
  v24.addColorStop(0.6, "#b0b0b0");
  v24.addColorStop(1, "#8a8a8a");
  v19.fillStyle = v24;
  v19.beginPath();
  v19.arc(v20, v21, v22, 0, Math.PI * 2);
  v19.fill();
  addMoonCraters(v19, v20, v21, v22);
  addMoonSurfaceDetails(v19, v20, v21, v22);
  drawTerminator(v19, v20, v21, v22);
  v19.restore();
}
function addMoonCraters(v25, v26, v27, v28) {
  const v29 = [{
    'x': -0.2,
    'y': -0.1,
    'size': 0.15,
    'depth': 0.3
  }, {
    'x': 0.3,
    'y': 0.2,
    'size': 0.12,
    'depth': 0.4
  }, {
    'x': -0.4,
    'y': 0.3,
    'size': 0.18,
    'depth': 0.5
  }, {
    'x': 0.1,
    'y': -0.4,
    'size': 0.1,
    'depth': 0.2
  }, {
    'x': 0.5,
    'y': -0.1,
    'size': 0.08,
    'depth': 0.3
  }, {
    'x': -0.3,
    'y': 0.5,
    'size': 0.14,
    'depth': 0.4
  }, {
    'x': 0.2,
    'y': 0.4,
    'size': 0.09,
    'depth': 0.25
  }, {
    'x': -0.5,
    'y': -0.2,
    'size': 0.11,
    'depth': 0.35
  }];
  v29.forEach(v30 => {
    const v31 = v26 + v30.x * v28;
    const v32 = v27 + v30.y * v28;
    const v33 = v30.size * v28;
    const v34 = v25.createRadialGradient(v31 - v33 * 0.2, v32 - v33 * 0.2, 0, v31, v32, v33);
    v34.addColorStop(0, "rgba(120, 120, 120, " + (0.3 + v30.depth * 0.3) + ')');
    v34.addColorStop(1, "rgba(80, 80, 80, " + (0.1 + v30.depth * 0.2) + ')');
    v25.fillStyle = v34;
    v25.beginPath();
    v25.arc(v31, v32, v33, 0, Math.PI * 2);
    v25.fill();
    v25.strokeStyle = "rgba(200, 200, 200, " + (0.2 + v30.depth * 0.2) + ')';
    v25.lineWidth = 1;
    v25.beginPath();
    v25.arc(v31, v32, v33, 0, Math.PI * 2);
    v25.stroke();
  });
}
function addMoonSurfaceDetails(v35, v36, v37, v38) {
  v35.save();
  for (let v39 = 0; v39 < 50; v39++) {
    const v40 = Math.random() * Math.PI * 2;
    const v41 = Math.random() * v38 * 0.8;
    const v42 = v36 + Math.cos(v40) * v41;
    const v43 = v37 + Math.sin(v40) * v41;
    const v44 = 1 + Math.random() * 3;
    const v45 = 140 + Math.random() * 60;
    const v46 = 0.3 + Math.random() * 0.4;
    v35.fillStyle = "rgba(" + v45 + ", " + v45 + ", " + v45 + ", " + v46 + ')';
    v35.beginPath();
    v35.arc(v42, v43, v44, 0, Math.PI * 2);
    v35.fill();
  }
  const v47 = [{
    'startAngle': 0.2,
    'endAngle': 0.8,
    'height': 0.1
  }, {
    'startAngle': 1.2,
    'endAngle': 1.8,
    'height': 0.08
  }, {
    'startAngle': 2.5,
    'endAngle': 3.2,
    'height': 0.12
  }];
  v47.forEach(v48 => {
    v35.strokeStyle = "rgba(180, 180, 180, 0.6)";
    v35.lineWidth = 2;
    v35.beginPath();
    for (let v49 = v48.startAngle; v49 <= v48.endAngle; v49 += 0.1) {
      const v50 = Math.sin(v49 * 10) * v48.height * v38;
      const v51 = v36 + Math.cos(v49) * (v38 + v50);
      const v52 = v37 + Math.sin(v49) * (v38 + v50);
      if (v49 === v48.startAngle) {
        v35.moveTo(v51, v52);
      } else {
        v35.lineTo(v51, v52);
      }
    }
    v35.stroke();
  });
  v35.restore();
}
function drawTerminator(v53, v54, v55, v56) {
  v53.save();
  const v57 = v53.createLinearGradient(v54 - v56, v55, v54 + v56 * 0.3, v55);
  v57.addColorStop(0, "rgba(60, 60, 80, 0.8)");
  v57.addColorStop(0.5, "rgba(100, 100, 120, 0.3)");
  v57.addColorStop(1, "transparent");
  v53.globalCompositeOperation = 'multiply';
  v53.fillStyle = v57;
  v53.beginPath();
  v53.arc(v54, v55, v56, Math.PI * 0.5, Math.PI * 1.5);
  v53.fill();
  v53.restore();
}
function addMoonGlow(v58, v59, v60, v61) {
  v58.save();
  const v62 = v58.createRadialGradient(v59, v60, v61 * 0.8, v59, v60, v61 * 2.5);
  v62.addColorStop(0, "rgba(180, 180, 220, 0.2)");
  v62.addColorStop(0.5, "rgba(140, 140, 200, 0.1)");
  v62.addColorStop(1, "transparent");
  v58.fillStyle = v62;
  v58.globalCompositeOperation = "screen";
  v58.beginPath();
  v58.arc(v59, v60, v61 * 2.5, 0, Math.PI * 2);
  v58.fill();
  v58.restore();
}
function addLensFlare(v63, v64, v65, v66) {
  v63.save();
  v63.globalCompositeOperation = "screen";
  v63.globalAlpha = 0.3;
  const v67 = v63.createRadialGradient(v64 - v66 * 0.5, v65 - v66 * 0.5, 0, v64, v65, v66 * 3);
  v67.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  v67.addColorStop(0.3, "rgba(200, 200, 255, 0.4)");
  v67.addColorStop(1, "transparent");
  v63.fillStyle = v67;
  v63.beginPath();
  v63.arc(v64, v65, v66 * 3, 0, Math.PI * 2);
  v63.fill();
  for (let v68 = 0; v68 < 3; v68++) {
    const v69 = v68 / 3 * Math.PI * 2;
    const v70 = v66 * 1.5;
    const v71 = v64 + Math.cos(v69) * v70;
    const v72 = v65 + Math.sin(v69) * v70;
    const v73 = v66 * (0.3 + Math.random() * 0.3);
    const v74 = v63.createRadialGradient(v71, v72, 0, v71, v72, v73);
    v74.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    v74.addColorStop(1, "transparent");
    v63.fillStyle = v74;
    v63.beginPath();
    v63.arc(v71, v72, v73, 0, Math.PI * 2);
    v63.fill();
  }
  v63.restore();
}
function drawCosmicText(v75, v76, v77, v78) {
  const v79 = v77 * 0.35;
  const v80 = v78 * 0.6;
  v75.save();
  v75.shadowColor = "rgba(180, 180, 220, 0.8)";
  v75.shadowBlur = 30;
  const v81 = v75.createLinearGradient(v79 - 100, v80 - 50, v79 + 100, v80 + 50);
  v81.addColorStop(0, "#ffffff");
  v81.addColorStop(0.3, '#e8e8ff');
  v81.addColorStop(0.7, "#c8c8e0");
  v81.addColorStop(1, "#a8a8c0");
  v75.font = "bold 72px \"Arial\"";
  v75.textAlign = "center";
  v75.textBaseline = "middle";
  v75.fillStyle = v81;
  v75.fillText(v76.toUpperCase(), v79, v80);
  v75.shadowColor = 'transparent';
  v75.strokeStyle = "rgba(255, 255, 255, 0.8)";
  v75.lineWidth = 2;
  v75.strokeText(v76.toUpperCase(), v79, v80);
  v75.shadowColor = "rgba(0, 0, 30, 0.5)";
  v75.shadowBlur = 15;
  v75.shadowOffsetX = 3;
  v75.shadowOffsetY = 3;
  v75.fillStyle = "rgba(255, 255, 255, 0.9)";
  v75.fillText(v76.toUpperCase(), v79 - 2, v80 - 2);
  v75.restore();
}
function addDetailedStars(v82, v83, v84) {
  v82.save();
  for (let v85 = 0; v85 < 200; v85++) {
    const v86 = Math.random() * v83;
    const v87 = Math.random() * v84;
    const v88 = Math.random() * 2.5;
    const v89 = 150 + Math.random() * 105;
    const v90 = 0.5 + Math.random() * 0.5;
    v82.fillStyle = 'rgba(' + v89 + ", " + v89 + ", 255, " + v90 * 0.3 + ')';
    v82.beginPath();
    v82.arc(v86, v87, v88 * 3, 0, Math.PI * 2);
    v82.fill();
    v82.fillStyle = "rgba(255, 255, 255, " + v90 + ')';
    v82.beginPath();
    v82.arc(v86, v87, v88, 0, Math.PI * 2);
    v82.fill();
    if (Math.random() > 0.7) {
      v82.fillStyle = "rgba(255, 255, 200, " + v90 * 0.7 + ')';
      v82.beginPath();
      v82.arc(v86, v87, v88 * 0.5, 0, Math.PI * 2);
      v82.fill();
    }
  }
  const v91 = [{
    'x': v83 * 0.1,
    'y': v84 * 0.2,
    'size': 0x3,
    'color': [255, 220, 180]
  }, {
    'x': v83 * 0.9,
    'y': v84 * 0.1,
    'size': 0x4,
    'color': [180, 220, 255]
  }, {
    'x': v83 * 0.2,
    'y': v84 * 0.9,
    'size': 2.5,
    'color': [220, 255, 180]
  }];
  v91.forEach(v92 => {
    const [v93, v94, v95] = v92.color;
    v82.fillStyle = 'rgba(' + v93 + ", " + v94 + ", " + v95 + ", 0.8)";
    v82.beginPath();
    v82.arc(v92.x, v92.y, v92.size, 0, Math.PI * 2);
    v82.fill();
    v82.fillStyle = "rgba(" + v93 + ", " + v94 + ", " + v95 + ", 0.3)";
    v82.beginPath();
    v82.arc(v92.x, v92.y, v92.size * 4, 0, Math.PI * 2);
    v82.fill();
  });
  v82.restore();
}
function addShootingStars(v96, v97, v98) {
  v96.save();
  const v99 = [{
    'x': v97 * 0.8,
    'y': v98 * 0.1,
    'length': 0x50,
    'angle': -0.3
  }, {
    'x': v97 * 0.6,
    'y': v98 * 0.05,
    'length': 0x3c,
    'angle': -0.5
  }];
  v99.forEach(v100 => {
    const v101 = v96.createLinearGradient(v100.x, v100.y, v100.x + Math.cos(v100.angle) * v100.length, v100.y + Math.sin(v100.angle) * v100.length);
    v101.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    v101.addColorStop(0.5, "rgba(200, 220, 255, 0.6)");
    v101.addColorStop(1, "transparent");
    v96.strokeStyle = v101;
    v96.lineWidth = 2;
    v96.lineCap = "round";
    v96.beginPath();
    v96.moveTo(v100.x, v100.y);
    v96.lineTo(v100.x + Math.cos(v100.angle) * v100.length, v100.y + Math.sin(v100.angle) * v100.length);
    v96.stroke();
    v96.strokeStyle = "rgba(180, 200, 255, 0.3)";
    v96.lineWidth = 8;
    v96.beginPath();
    v96.moveTo(v100.x, v100.y);
    v96.lineTo(v100.x + Math.cos(v100.angle) * v100.length, v100.y + Math.sin(v100.angle) * v100.length);
    v96.stroke();
  });
  v96.restore();
}
function addCosmicDust(v102, v103, v104) {
  v102.save();
  v102.globalAlpha = 0.1;
  v102.globalCompositeOperation = "screen";
  const v105 = [{
    'x': v103 * 0.4,
    'y': v104 * 0.7,
    'size': 0x64,
    'color': [100, 100, 200]
  }, {
    'x': v103 * 0.6,
    'y': v104 * 0.8,
    'size': 0x50,
    'color': [200, 100, 200]
  }, {
    'x': v103 * 0.3,
    'y': v104 * 0.3,
    'size': 0x78,
    'color': [100, 200, 200]
  }];
  v105.forEach(v106 => {
    const [v107, v108, v109] = v106.color;
    const v110 = v102.createRadialGradient(v106.x, v106.y, 0, v106.x, v106.y, v106.size);
    v110.addColorStop(0, "rgba(" + v107 + ", " + v108 + ", " + v109 + ", 0.3)");
    v110.addColorStop(1, "transparent");
    v102.fillStyle = v110;
    v102.beginPath();
    v102.arc(v106.x, v106.y, v106.size, 0, Math.PI * 2);
    v102.fill();
  });
  v102.restore();
}
function addNebulaBackground(v111, v112, v113) {
  v111.save();
  v111.globalAlpha = 0.15;
  v111.globalCompositeOperation = 'screen';
  const v114 = [{
    'x': v112 * 0.2,
    'y': v113 * 0.4,
    'size': 0x96,
    'color': [80, 60, 150]
  }, {
    'x': v112 * 0.8,
    'y': v113 * 0.6,
    'size': 0x78,
    'color': [60, 80, 150]
  }, {
    'x': v112 * 0.5,
    'y': v113 * 0.2,
    'size': 0x64,
    'color': [150, 60, 100]
  }];
  v114.forEach(v115 => {
    const [v116, v117, v118] = v115.color;
    const v119 = v111.createRadialGradient(v115.x, v115.y, 0, v115.x, v115.y, v115.size);
    v119.addColorStop(0, "rgba(" + v116 + ", " + v117 + ", " + v118 + ", 0.4)");
    v119.addColorStop(0.7, "rgba(" + v116 + ", " + v117 + ", " + v118 + ", 0.2)");
    v119.addColorStop(1, "transparent");
    v111.fillStyle = v119;
    v111.beginPath();
    v111.arc(v115.x, v115.y, v115.size, 0, Math.PI * 2);
    v111.fill();
  });
  v111.restore();
}
function addGalaxyClouds(v120, v121, v122) {
  v120.save();
  v120.globalAlpha = 0.05;
  for (let v123 = 0; v123 < 5; v123++) {
    const v124 = Math.random() * v121;
    const v125 = Math.random() * v122;
    const v126 = 50 + Math.random() * 100;
    const v127 = v120.createRadialGradient(v124, v125, 0, v124, v125, v126);
    v127.addColorStop(0, "rgba(100, 100, 150, 0.1)");
    v127.addColorStop(1, "transparent");
    v120.fillStyle = v127;
    v120.beginPath();
    v120.arc(v124, v125, v126, 0, Math.PI * 2);
    v120.fill();
  }
  v120.restore();
}
function drawCosmicBorder(v128, v129, v130) {
  v128.save();
  const v131 = v128.createLinearGradient(0, 0, v129, v130);
  v131.addColorStop(0, "rgba(120, 120, 200, 0.6)");
  v131.addColorStop(0.5, "rgba(180, 180, 220, 0.8)");
  v131.addColorStop(1, "rgba(120, 120, 200, 0.6)");
  v128.strokeStyle = v131;
  v128.lineWidth = 8;
  v128.shadowColor = "rgba(150, 150, 255, 0.5)";
  v128.shadowBlur = 20;
  v128.strokeRect(10, 10, v129 - 20, v130 - 20);
  v128.strokeStyle = "rgba(200, 200, 255, 0.4)";
  v128.lineWidth = 2;
  v128.shadowBlur = 0;
  v128.strokeRect(20, 20, v129 - 40, v130 - 40);
  v128.restore();
}
function addMoonSignature(v132, v133, v134) {
  v132.save();
  const v135 = v133 - 100;
  const v136 = v134 - 25;
  v132.font = "italic 14px \"Arial\"";
  v132.fillStyle = "rgba(200, 200, 255, 0.8)";
  v132.textAlign = "right";
  v132.textBaseline = "bottom";
  v132.shadowColor = "rgba(150, 150, 255, 0.5)";
  v132.shadowBlur = 10;
  v132.fillText("by " + (config.botName || "JuneX-Ultra"), v135, v136);
  v132.strokeStyle = "rgba(180, 180, 220, 0.6)";
  v132.lineWidth = 1;
  v132.beginPath();
  v132.moveTo(v135 - v132.measureText("by " + (config.botName || "JuneX-Ultra")).width, v136 + 2);
  v132.lineTo(v135, v136 + 2);
  v132.stroke();
  v132.restore();
}
