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
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "aqualogo",
  'category': 'design',
  'description': "Create stunning aquatic text logos with water effects and ocean themes",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🌊 *AQUA LOGO*\n\n*aqua*\naqua <text>\n\n*Example:*\naqua OCEAN\naqua WATER\naqua MARINE\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateAquaLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🌊 *Aqua Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [AQUALOGO] ERROR:", v11);
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
async function generateAquaLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createUnderwaterBackground(v14, 800, 400);
  addWaterSurface(v14, 800, 400);
  drawWaterText(v14, v12, 800, 400);
  addBubbles(v14, 800, 400);
  addAquaticLife(v14, 800, 400);
  addLightRays(v14, 800, 400);
  addCaustics(v14, 800, 400);
  addWaterDistortion(v14, 800, 400);
  drawAquaticBorder(v14, 800, 400);
  addAquaSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createUnderwaterBackground(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#006994");
  v18.addColorStop(0.3, '#005a7a');
  v18.addColorStop(0.6, "#004a66");
  v18.addColorStop(1, "#00394d");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addOceanDepthTexture(v15, v16, v17);
  addCoralReefs(v15, v16, v17);
}
function addOceanDepthTexture(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.1;
  for (let v22 = 0; v22 < 500; v22++) {
    const v23 = Math.random() * v20;
    const v24 = Math.random() * v21;
    const v25 = 2 + Math.random() * 8;
    const v26 = 30 + Math.random() * 40;
    v19.fillStyle = 'rgba(' + v26 + ", " + (v26 + 50) + ", " + (v26 + 70) + ", 0.3)";
    v19.beginPath();
    v19.arc(v23, v24, v25, 0, Math.PI * 2);
    v19.fill();
  }
  v19.strokeStyle = "rgba(0, 80, 120, 0.2)";
  v19.lineWidth = 1;
  for (let v27 = 50; v27 < v21; v27 += 40) {
    v19.beginPath();
    v19.moveTo(0, v27);
    v19.lineTo(v20, v27);
    v19.stroke();
  }
  v19.restore();
}
function addWaterSurface(v28, v29, v30) {
  v28.save();
  const v31 = v28.createLinearGradient(0, 0, 0, v30 * 0.3);
  v31.addColorStop(0, "rgba(0, 150, 200, 0.6)");
  v31.addColorStop(0.5, "rgba(0, 100, 150, 0.3)");
  v31.addColorStop(1, 'transparent');
  v28.fillStyle = v31;
  v28.fillRect(0, 0, v29, v30 * 0.3);
  drawSurfaceWaves(v28, v29, v30);
  addSunlightPenetration(v28, v29, v30);
  v28.restore();
}
function drawSurfaceWaves(v32, v33, v34) {
  v32.save();
  v32.globalAlpha = 0.4;
  for (let v35 = 0; v35 < 3; v35++) {
    const v36 = 5 + v35 * 3;
    const v37 = v34 * 0.1 + v35 * 15;
    v32.strokeStyle = "rgba(255, 255, 255, " + (0.3 - v35 * 0.1) + ')';
    v32.lineWidth = 1;
    v32.beginPath();
    for (let v38 = 0; v38 <= v33; v38 += 2) {
      const v39 = v37 + Math.sin(v38 * 0.02 + v35) * v36;
      if (v38 === 0) {
        v32.moveTo(v38, v39);
      } else {
        v32.lineTo(v38, v39);
      }
    }
    v32.stroke();
  }
  v32.strokeStyle = "rgba(255, 255, 255, 0.6)";
  v32.lineWidth = 1;
  v32.beginPath();
  for (let v40 = 0; v40 <= v33; v40 += 3) {
    const v41 = v34 * 0.08 + Math.sin(v40 * 0.015) * 8;
    if (v40 === 0) {
      v32.moveTo(v40, v41);
    } else {
      v32.lineTo(v40, v41);
    }
  }
  v32.stroke();
  v32.restore();
}
function addSunlightPenetration(v42, v43, v44) {
  v42.save();
  v42.globalCompositeOperation = "screen";
  v42.globalAlpha = 0.2;
  const v45 = v42.createRadialGradient(v43 * 0.5, 0, 0, v43 * 0.5, 0, v43 * 0.8);
  v45.addColorStop(0, "rgba(255, 255, 200, 0.6)");
  v45.addColorStop(0.5, "rgba(200, 230, 255, 0.3)");
  v45.addColorStop(1, "transparent");
  v42.fillStyle = v45;
  v42.fillRect(0, 0, v43, v44 * 0.5);
  for (let v46 = 0; v46 < 8; v46++) {
    const v47 = v43 * 0.2 + v46 / 7 * v43 * 0.6;
    const v48 = 20 + Math.random() * 30;
    const v49 = v42.createLinearGradient(v47, 0, v47, v44);
    v49.addColorStop(0, "rgba(255, 255, 220, 0.4)");
    v49.addColorStop(0.3, "rgba(200, 230, 255, 0.2)");
    v49.addColorStop(1, "transparent");
    v42.fillStyle = v49;
    v42.fillRect(v47 - v48 / 2, 0, v48, v44);
  }
  v42.restore();
}
function drawWaterText(v50, v51, v52, v53) {
  const v54 = v52 * 0.5;
  const v55 = v53 * 0.6;
  v50.save();
  v50.shadowColor = "rgba(0, 150, 200, 0.8)";
  v50.shadowBlur = 30;
  const v56 = v50.createLinearGradient(v54 - 100, v55 - 50, v54 + 100, v55 + 50);
  v56.addColorStop(0, "#ffffff");
  v56.addColorStop(0.3, '#aaddff');
  v56.addColorStop(0.6, "#66bbff");
  v56.addColorStop(1, '#3399ff');
  v50.font = "bold 68px \"Arial\"";
  v50.textAlign = "center";
  v50.textBaseline = "middle";
  v50.fillStyle = v56;
  v50.fillText(v51.toUpperCase(), v54, v55);
  addWaterDroplets(v50, v51, v54, v55);
  v50.shadowColor = 'transparent';
  v50.strokeStyle = "rgba(255, 255, 255, 0.8)";
  v50.lineWidth = 2;
  v50.strokeText(v51.toUpperCase(), v54, v55);
  v50.fillStyle = "rgba(200, 230, 255, 0.6)";
  v50.fillText(v51.toUpperCase(), v54, v55);
  addTextDistortion(v50, v51, v54, v55);
  v50.restore();
}
function addWaterDroplets(v57, v58, v59, v60) {
  v57.save();
  v57.globalCompositeOperation = "screen";
  const v61 = v57.measureText(v58.toUpperCase());
  const v62 = v61.width;
  for (let v63 = 0; v63 < 20; v63++) {
    const v64 = v59 - v62 / 2 + Math.random() * v62;
    const v65 = v60 - 34 + Math.random() * 68;
    const v66 = 2 + Math.random() * 8;
    if (Math.random() > 0.3) {
      v57.fillStyle = "rgba(255, 255, 255, 0.9)";
      v57.beginPath();
      v57.arc(v64, v65, v66 * 0.3, 0, Math.PI * 2);
      v57.fill();
      const v67 = v57.createRadialGradient(v64, v65, 0, v64, v65, v66);
      v67.addColorStop(0, "rgba(150, 200, 255, 0.8)");
      v67.addColorStop(1, "rgba(100, 150, 255, 0.4)");
      v57.fillStyle = v67;
      v57.beginPath();
      v57.arc(v64, v65, v66, 0, Math.PI * 2);
      v57.fill();
      v57.fillStyle = "rgba(0, 50, 100, 0.3)";
      v57.beginPath();
      v57.arc(v64 + v66 * 0.3, v65 + v66 * 0.3, v66 * 0.8, 0, Math.PI * 2);
      v57.fill();
    }
  }
  v57.restore();
}
function addTextDistortion(v68, v69, v70, v71) {
  v68.save();
  v68.globalAlpha = 0.3;
  const v72 = v68.measureText(v69.toUpperCase());
  const v73 = v72.width;
  for (let v74 = v70 - v73 / 2; v74 < v70 + v73 / 2; v74 += 10) {
    const v75 = 2 + Math.sin(v74 * 0.1) * 5;
    const v76 = v71 + 35 + v75;
    v68.strokeStyle = "rgba(255, 255, 255, 0.4)";
    v68.lineWidth = 1;
    v68.beginPath();
    v68.moveTo(v74, v71 + 35);
    v68.lineTo(v74, v76);
    v68.stroke();
  }
  v68.restore();
}
function addBubbles(v77, v78, v79) {
  v77.save();
  for (let v80 = 0; v80 < 15; v80++) {
    const v81 = Math.random() * v78;
    const v82 = v79 * 0.2 + Math.random() * v79 * 0.7;
    const v83 = 8 + Math.random() * 25;
    drawBubble(v77, v81, v82, v83);
  }
  for (let v84 = 0; v84 < 30; v84++) {
    const v85 = Math.random() * v78;
    const v86 = v79 * 0.3 + Math.random() * v79 * 0.6;
    const v87 = 4 + Math.random() * 12;
    drawBubble(v77, v85, v86, v87);
  }
  for (let v88 = 0; v88 < 100; v88++) {
    const v89 = Math.random() * v78;
    const v90 = v79 * 0.4 + Math.random() * v79 * 0.5;
    const v91 = 1 + Math.random() * 6;
    drawBubble(v77, v89, v90, v91);
  }
  addBubbleStreams(v77, v78, v79);
  v77.restore();
}
function drawBubble(v92, v93, v94, v95) {
  const v96 = v92.createRadialGradient(v93, v94, 0, v93, v94, v95);
  v96.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  v96.addColorStop(0.7, "rgba(200, 230, 255, 0.6)");
  v96.addColorStop(1, "rgba(150, 200, 255, 0.3)");
  v92.fillStyle = v96;
  v92.beginPath();
  v92.arc(v93, v94, v95, 0, Math.PI * 2);
  v92.fill();
  v92.fillStyle = "rgba(255, 255, 255, 0.8)";
  v92.beginPath();
  v92.arc(v93 - v95 * 0.3, v94 - v95 * 0.3, v95 * 0.4, 0, Math.PI * 2);
  v92.fill();
  v92.fillStyle = "rgba(255, 255, 255, 0.4)";
  v92.beginPath();
  v92.arc(v93 + v95 * 0.2, v94 + v95 * 0.2, v95 * 0.3, 0, Math.PI * 2);
  v92.fill();
}
function addBubbleStreams(v97, v98, v99) {
  v97.save();
  v97.globalAlpha = 0.6;
  const v100 = [{
    'x': v98 * 0.2,
    'count': 0xc
  }, {
    'x': v98 * 0.4,
    'count': 0x8
  }, {
    'x': v98 * 0.6,
    'count': 0xa
  }, {
    'x': v98 * 0.8,
    'count': 0xf
  }];
  v100.forEach(v101 => {
    for (let v102 = 0; v102 < v101.count; v102++) {
      const v103 = v99 * 0.7 + v102 / v101.count * v99 * 0.3;
      const v104 = 3 + Math.random() * 8;
      const v105 = (Math.random() - 0.5) * 20;
      drawBubble(v97, v101.x + v105, v103, v104);
    }
  });
  v97.restore();
}
function addAquaticLife(v106, v107, v108) {
  v106.save();
  for (let v109 = 0; v109 < 6; v109++) {
    const v110 = v107 * 0.1 + Math.random() * v107 * 0.8;
    const v111 = v108 * 0.3 + Math.random() * v108 * 0.5;
    const v112 = 15 + Math.random() * 20;
    const v113 = Math.random() > 0.5 ? 1 : -1;
    drawFish(v106, v110, v111, v112, v113);
  }
  addSeaweed(v106, v107, v108);
  v106.restore();
}
function drawFish(v114, v115, v116, v117, v118) {
  v114.save();
  v114.globalAlpha = 0.7;
  const v119 = v114.createLinearGradient(v115 - v117 * v118, v116, v115 + v117 * v118, v116);
  v119.addColorStop(0, "#ff6b6b");
  v119.addColorStop(0.5, "#ff8e8e");
  v119.addColorStop(1, '#ff5252');
  v114.fillStyle = v119;
  v114.beginPath();
  v114.ellipse(v115, v116, v117, v117 * 0.5, 0, 0, Math.PI * 2);
  v114.fill();
  v114.fillStyle = '#ff4444';
  v114.beginPath();
  v114.moveTo(v115 + v117 * v118, v116);
  v114.lineTo(v115 + v117 * 1.5 * v118, v116 - v117 * 0.5);
  v114.lineTo(v115 + v117 * 1.5 * v118, v116 + v117 * 0.5);
  v114.closePath();
  v114.fill();
  v114.fillStyle = "black";
  v114.beginPath();
  v114.arc(v115 - v117 * 0.5 * v118, v116, v117 * 0.15, 0, Math.PI * 2);
  v114.fill();
  v114.fillStyle = "#ff7777";
  v114.beginPath();
  v114.moveTo(v115 - v117 * 0.2 * v118, v116 - v117 * 0.3);
  v114.lineTo(v115 + v117 * 0.3 * v118, v116 - v117 * 0.6);
  v114.lineTo(v115 + v117 * 0.1 * v118, v116 - v117 * 0.3);
  v114.closePath();
  v114.fill();
  v114.restore();
}
function addSeaweed(v120, v121, v122) {
  v120.save();
  v120.globalAlpha = 0.6;
  const v123 = [{
    'x': v121 * 0.1,
    'height': 0x50
  }, {
    'x': v121 * 0.9,
    'height': 0x78
  }, {
    'x': v121 * 0.3,
    'height': 0x5a
  }, {
    'x': v121 * 0.7,
    'height': 0x6e
  }];
  v123.forEach(v124 => {
    v120.strokeStyle = "#2e8b57";
    v120.lineWidth = 3;
    v120.lineCap = "round";
    v120.beginPath();
    v120.moveTo(v124.x, v122 - 20);
    for (let v125 = 0; v125 <= 10; v125++) {
      const v126 = v122 - 20 - v125 / 10 * v124.height;
      const v127 = Math.sin(v125 * 0.8) * 15;
      v120.lineTo(v124.x + v127, v126);
    }
    v120.stroke();
    v120.strokeStyle = "#3cb371";
    v120.lineWidth = 2;
    for (let v128 = 2; v128 <= 8; v128 += 2) {
      const v129 = v122 - 20 - v128 / 10 * v124.height;
      const v130 = Math.sin(v128 * 0.8) * 15;
      v120.beginPath();
      v120.moveTo(v124.x + v130, v129);
      v120.lineTo(v124.x + v130 + 20, v129 - 15);
      v120.stroke();
      v120.beginPath();
      v120.moveTo(v124.x + v130, v129);
      v120.lineTo(v124.x + v130 - 20, v129 - 10);
      v120.stroke();
    }
  });
  v120.restore();
}
function addLightRays(v131, v132, v133) {
  v131.save();
  v131.globalCompositeOperation = "screen";
  v131.globalAlpha = 0.15;
  for (let v134 = 0; v134 < 5; v134++) {
    const v135 = v132 * 0.2 + v134 / 4 * v132 * 0.6;
    const v136 = 15 + Math.random() * 25;
    const v137 = v131.createLinearGradient(v135, 0, v135, v133);
    v137.addColorStop(0, "rgba(255, 255, 220, 0.6)");
    v137.addColorStop(0.5, "rgba(200, 230, 255, 0.3)");
    v137.addColorStop(1, "transparent");
    v131.fillStyle = v137;
    v131.fillRect(v135 - v136 / 2, 0, v136, v133);
  }
  v131.restore();
}
function addCaustics(v138, v139, v140) {
  v138.save();
  v138.globalCompositeOperation = "screen";
  v138.globalAlpha = 0.1;
  for (let v141 = v140 * 0.3; v141 < v140; v141 += 40) {
    for (let v142 = 0; v142 < v139; v142 += 50) {
      const v143 = 0.3 + Math.sin(v142 * 0.02 + v141 * 0.01) * 0.3;
      const v144 = 20 + Math.sin(v142 * 0.03) * 10;
      v138.fillStyle = "rgba(255, 255, 255, " + v143 + ')';
      v138.beginPath();
      v138.arc(v142 + Math.sin(v141 * 0.02) * 10, v141, v144, 0, Math.PI * 2);
      v138.fill();
    }
  }
  v138.restore();
}
function addCoralReefs(v145, v146, v147) {
  v145.save();
  v145.globalAlpha = 0.3;
  const v148 = [{
    'x': v146 * 0.05,
    'y': v147 * 0.8,
    'color': "#ff6b6b",
    'size': 0x1e
  }, {
    'x': v146 * 0.15,
    'y': v147 * 0.75,
    'color': "#ffa726",
    'size': 0x19
  }, {
    'x': v146 * 0.85,
    'y': v147 * 0.82,
    'color': '#ab47bc',
    'size': 0x23
  }, {
    'x': v146 * 0.95,
    'y': v147 * 0.78,
    'color': "#26c6da",
    'size': 0x1c
  }];
  v148.forEach(v149 => {
    v145.fillStyle = v149.color;
    for (let v150 = 0; v150 < 5; v150++) {
      const v151 = v150 / 5 * Math.PI * 2;
      const v152 = v149.size * (0.5 + Math.random() * 0.5);
      v145.beginPath();
      v145.moveTo(v149.x, v149.y);
      v145.lineTo(v149.x + Math.cos(v151) * v152, v149.y + Math.sin(v151) * v152);
      v145.stroke();
      v145.beginPath();
      v145.arc(v149.x + Math.cos(v151) * v152, v149.y + Math.sin(v151) * v152, v149.size * 0.2, 0, Math.PI * 2);
      v145.fill();
    }
  });
  v145.restore();
}
function addWaterDistortion(v153, v154, v155) {
  v153.save();
  v153.globalAlpha = 0.05;
  for (let v156 = 0; v156 < 8; v156++) {
    const v157 = Math.random() * v154;
    const v158 = Math.random() * v155;
    const v159 = 50 + Math.random() * 100;
    v153.strokeStyle = "rgba(255, 255, 255, 0.3)";
    v153.lineWidth = 1;
    for (let v160 = 0; v160 < 3; v160++) {
      const v161 = v159 + v160 * 30;
      v153.beginPath();
      v153.arc(v157, v158, v161, 0, Math.PI * 2);
      v153.stroke();
    }
  }
  v153.restore();
}
function drawAquaticBorder(v162, v163, v164) {
  v162.save();
  const v165 = v162.createLinearGradient(0, 0, v163, v164);
  v165.addColorStop(0, "#006994");
  v165.addColorStop(0.3, '#0088cc');
  v165.addColorStop(0.7, "#00aaff");
  v165.addColorStop(1, "#006994");
  v162.strokeStyle = v165;
  v162.lineWidth = 8;
  v162.shadowColor = "rgba(0, 150, 255, 0.6)";
  v162.shadowBlur = 20;
  v162.strokeRect(10, 10, v163 - 20, v164 - 20);
  v162.strokeStyle = "rgba(200, 230, 255, 0.6)";
  v162.lineWidth = 2;
  v162.shadowBlur = 10;
  v162.strokeRect(20, 20, v163 - 40, v164 - 40);
  v162.restore();
}
function addAquaSignature(v166, v167, v168) {
  v166.save();
  const v169 = v167 - 110;
  const v170 = v168 - 25;
  v166.font = "italic 14px \"Arial\"";
  v166.fillStyle = "rgba(150, 220, 255, 0.9)";
  v166.textAlign = 'right';
  v166.textBaseline = "bottom";
  v166.shadowColor = "rgba(0, 150, 255, 0.5)";
  v166.shadowBlur = 15;
  v166.fillText("by " + (config.botName || "JuneX-Ultra"), v169, v170);
  const v171 = v166.createRadialGradient(v169 + 5, v170 - 8, 0, v169 + 5, v170 - 8, 6);
  v171.addColorStop(0, "rgba(150, 200, 255, 0.8)");
  v171.addColorStop(1, "rgba(100, 150, 255, 0.4)");
  v166.fillStyle = v171;
  v166.beginPath();
  v166.arc(v169 + 5, v170 - 8, 6, 0, Math.PI * 2);
  v166.fill();
  v166.fillStyle = "rgba(255, 255, 255, 0.8)";
  v166.beginPath();
  v166.arc(v169 + 3, v170 - 10, 2, 0, Math.PI * 2);
  v166.fill();
  v166.restore();
}
