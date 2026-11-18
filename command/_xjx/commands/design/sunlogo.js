const {
  createCanvas
} = require('@napi-rs/canvas');
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
  v1.textBaseline = 'bottom';
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "sunlogo",
  'description': "Create radiant sun text logos with brilliant light and solar flare effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "☀️ *SUN LOGO*\n\n*sunlogo*\nsunlogo <text>\n\n*Example:*\nsunlogo SUN\nsunlogo LIGHT\nsunlogo SOLAR\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
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
      const v10 = await generateSunLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "☀️ *Sun Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
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
      console.error("❌ [SUNLOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })['catch'](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ *ERROR*\n\n" + v11.message + "\nPlease try again with shorter text"
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateSunLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createSkyBackground(v14, 800, 400);
  drawRealisticSun(v14, 600, 140, 80);
  addSolarFlares(v14, 600, 140, 80);
  addSunProminences(v14, 600, 140, 80);
  addSunRays(v14, 600, 140, 80);
  addLightBeams(v14, 800, 400);
  drawRadiantText(v14, v12, 800, 400);
  addLensFlare(v14, 600, 140, 80);
  addHeatHaze(v14, 800, 400);
  addSolarParticles(v14, 800, 400);
  addSunSparkles(v14, 800, 400);
  drawSolarBorder(v14, 800, 400);
  addSunSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createSkyBackground(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#87CEEB");
  v18.addColorStop(0.3, "#4682B4");
  v18.addColorStop(0.7, '#FF8C00');
  v18.addColorStop(1, "#FF4500");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addSkyClouds(v15, v16, v17);
}
function addSkyClouds(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.3;
  const v22 = [{
    'x': v20 * 0.2,
    'y': v21 * 0.2,
    'size': 0x3c
  }, {
    'x': v20 * 0.6,
    'y': v21 * 0.15,
    'size': 0x50
  }, {
    'x': v20 * 0.4,
    'y': v21 * 0.25,
    'size': 0x32
  }, {
    'x': v20 * 0.8,
    'y': v21 * 0.3,
    'size': 0x46
  }];
  v22.forEach(v23 => {
    const v24 = v19.createRadialGradient(v23.x, v23.y, 0, v23.x, v23.y, v23.size);
    v24.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    v24.addColorStop(1, "rgba(255, 255, 255, 0.2)");
    v19.fillStyle = v24;
    v19.beginPath();
    v19.arc(v23.x, v23.y, v23.size, 0, Math.PI * 2);
    v19.fill();
  });
  v19.restore();
}
function drawRealisticSun(v25, v26, v27, v28) {
  v25.save();
  const v29 = v25.createRadialGradient(v26, v27, 0, v26, v27, v28 * 3);
  v29.addColorStop(0, "rgba(255, 255, 200, 0.8)");
  v29.addColorStop(0.3, "rgba(255, 200, 100, 0.6)");
  v29.addColorStop(0.7, "rgba(255, 150, 50, 0.3)");
  v29.addColorStop(1, "transparent");
  v25.fillStyle = v29;
  v25.beginPath();
  v25.arc(v26, v27, v28 * 3, 0, Math.PI * 2);
  v25.fill();
  const v30 = v25.createRadialGradient(v26, v27, 0, v26, v27, v28 * 2);
  v30.addColorStop(0, "rgba(255, 255, 150, 0.9)");
  v30.addColorStop(0.5, "rgba(255, 200, 100, 0.7)");
  v30.addColorStop(1, "rgba(255, 150, 50, 0.4)");
  v25.fillStyle = v30;
  v25.beginPath();
  v25.arc(v26, v27, v28 * 2, 0, Math.PI * 2);
  v25.fill();
  const v31 = v25.createRadialGradient(v26 - v28 * 0.2, v27 - v28 * 0.2, 0, v26, v27, v28);
  v31.addColorStop(0, '#FFFF00');
  v31.addColorStop(0.3, "#FFD700");
  v31.addColorStop(0.7, "#FF8C00");
  v31.addColorStop(1, "#FF4500");
  v25.fillStyle = v31;
  v25.beginPath();
  v25.arc(v26, v27, v28, 0, Math.PI * 2);
  v25.fill();
  addSunSurfaceDetails(v25, v26, v27, v28);
  v25.fillStyle = "rgba(255, 255, 200, 0.6)";
  v25.beginPath();
  v25.arc(v26, v27, v28 * 0.7, 0, Math.PI * 2);
  v25.fill();
  v25.fillStyle = "rgba(255, 255, 255, 0.8)";
  v25.beginPath();
  v25.arc(v26, v27, v28 * 0.3, 0, Math.PI * 2);
  v25.fill();
  v25.restore();
}
function addSunSurfaceDetails(v32, v33, v34, v35) {
  v32.save();
  v32.globalAlpha = 0.4;
  const v36 = [{
    'x': -0.3,
    'y': -0.2,
    'size': 0.1
  }, {
    'x': 0.4,
    'y': 0.1,
    'size': 0.08
  }, {
    'x': -0.2,
    'y': 0.4,
    'size': 0.12
  }, {
    'x': 0.3,
    'y': -0.3,
    'size': 0.09
  }];
  v36.forEach(v37 => {
    const v38 = v33 + v37.x * v35;
    const v39 = v34 + v37.y * v35;
    const v40 = v37.size * v35;
    v32.fillStyle = "rgba(200, 100, 50, 0.6)";
    v32.beginPath();
    v32.arc(v38, v39, v40, 0, Math.PI * 2);
    v32.fill();
    v32.fillStyle = "rgba(150, 70, 30, 0.8)";
    v32.beginPath();
    v32.arc(v38, v39, v40 * 0.5, 0, Math.PI * 2);
    v32.fill();
  });
  for (let v41 = 0; v41 < 30; v41++) {
    const v42 = Math.random() * Math.PI * 2;
    const v43 = Math.random() * v35 * 0.8;
    const v44 = v33 + Math.cos(v42) * v43;
    const v45 = v34 + Math.sin(v42) * v43;
    const v46 = 2 + Math.random() * 5;
    v32.fillStyle = "rgba(255, 255, 200, 0.7)";
    v32.beginPath();
    v32.arc(v44, v45, v46, 0, Math.PI * 2);
    v32.fill();
  }
  v32.restore();
}
function addSolarFlares(v47, v48, v49, v50) {
  v47.save();
  v47.globalCompositeOperation = "screen";
  v47.globalAlpha = 0.6;
  const v51 = [{
    'angle': 0.8,
    'length': v50 * 4,
    'intensity': 0.8
  }, {
    'angle': 2.2,
    'length': v50 * 3,
    'intensity': 0.7
  }, {
    'angle': 3.8,
    'length': v50 * 5,
    'intensity': 0.9
  }, {
    'angle': 5.1,
    'length': v50 * 3.5,
    'intensity': 0.6
  }];
  v51.forEach(v52 => {
    const v53 = v47.createLinearGradient(v48, v49, v48 + Math.cos(v52.angle) * v52.length, v49 + Math.sin(v52.angle) * v52.length);
    v53.addColorStop(0, "rgba(255, 255, 200, " + v52.intensity + ')');
    v53.addColorStop(0.5, "rgba(255, 200, 100, " + v52.intensity * 0.7 + ')');
    v53.addColorStop(1, "rgba(255, 150, 50, " + v52.intensity * 0.3 + ')');
    v47.strokeStyle = v53;
    v47.lineWidth = 15;
    v47.lineCap = "round";
    v47.beginPath();
    v47.moveTo(v48, v49);
    v47.lineTo(v48 + Math.cos(v52.angle) * v52.length, v49 + Math.sin(v52.angle) * v52.length);
    v47.stroke();
    v47.strokeStyle = "rgba(255, 200, 100, " + v52.intensity * 0.4 + ')';
    v47.lineWidth = 30;
    v47.beginPath();
    v47.moveTo(v48, v49);
    v47.lineTo(v48 + Math.cos(v52.angle) * v52.length, v49 + Math.sin(v52.angle) * v52.length);
    v47.stroke();
  });
  v47.restore();
}
function addSunProminences(v54, v55, v56, v57) {
  v54.save();
  v54.globalCompositeOperation = "screen";
  v54.globalAlpha = 0.5;
  for (let v58 = 0; v58 < 6; v58++) {
    const v59 = v58 / 6 * Math.PI * 2;
    const v60 = v59 + Math.PI * 0.3;
    const v61 = v59 + Math.PI * 0.6;
    const v62 = v55 + Math.cos(v59) * v57;
    const v63 = v56 + Math.sin(v59) * v57;
    const v64 = v55 + Math.cos(v60) * v57 * 2;
    const v65 = v56 + Math.sin(v60) * v57 * 2;
    const v66 = v55 + Math.cos(v61) * v57 * 1.5;
    const v67 = v56 + Math.sin(v61) * v57 * 1.5;
    const v68 = v54.createLinearGradient(v62, v63, v66, v67);
    v68.addColorStop(0, "rgba(255, 100, 50, 0.8)");
    v68.addColorStop(1, "rgba(255, 200, 100, 0.4)");
    v54.strokeStyle = v68;
    v54.lineWidth = 8;
    v54.lineCap = 'round';
    v54.beginPath();
    v54.moveTo(v62, v63);
    v54.quadraticCurveTo(v64, v65, v66, v67);
    v54.stroke();
    v54.strokeStyle = "rgba(255, 150, 50, 0.3)";
    v54.lineWidth = 20;
    v54.beginPath();
    v54.moveTo(v62, v63);
    v54.quadraticCurveTo(v64, v65, v66, v67);
    v54.stroke();
  }
  v54.restore();
}
function addSunRays(v69, v70, v71, v72) {
  v69.save();
  v69.globalCompositeOperation = "screen";
  v69.globalAlpha = 0.4;
  for (let v73 = 0; v73 < 3; v73++) {
    const v74 = 24 + v73 * 8;
    const v75 = v72 * (3 + v73);
    const v76 = 4 - v73;
    for (let v77 = 0; v77 < v74; v77++) {
      const v78 = v77 / v74 * Math.PI * 2;
      const v79 = Math.sin(v78 * 5 + v73) * 0.2;
      const v80 = v78 + v79;
      const v81 = v69.createLinearGradient(v70, v71, v70 + Math.cos(v80) * v75, v71 + Math.sin(v80) * v75);
      v81.addColorStop(0, "rgba(255, 255, 200, " + (0.8 - v73 * 0.2) + ')');
      v81.addColorStop(0.7, "rgba(255, 200, 100, " + (0.5 - v73 * 0.15) + ')');
      v81.addColorStop(1, 'transparent');
      v69.strokeStyle = v81;
      v69.lineWidth = v76;
      v69.lineCap = "round";
      v69.beginPath();
      v69.moveTo(v70, v71);
      v69.lineTo(v70 + Math.cos(v80) * v75, v71 + Math.sin(v80) * v75);
      v69.stroke();
    }
  }
  v69.restore();
}
function addLightBeams(v82, v83, v84) {
  v82.save();
  v82.globalCompositeOperation = "screen";
  v82.globalAlpha = 0.2;
  for (let v85 = 0; v85 < 5; v85++) {
    const v86 = v83 * 0.75 + (Math.random() - 0.5) * 100;
    const v87 = 30 + Math.random() * 50;
    const v88 = v82.createLinearGradient(v86, 0, v86, v84);
    v88.addColorStop(0, "rgba(255, 255, 200, 0.6)");
    v88.addColorStop(0.5, "rgba(255, 200, 100, 0.3)");
    v88.addColorStop(1, "transparent");
    v82.fillStyle = v88;
    v82.fillRect(v86 - v87 / 2, 0, v87, v84);
  }
  v82.restore();
}
function drawRadiantText(v89, v90, v91, v92) {
  const v93 = v91 * 0.35;
  const v94 = v92 * 0.6;
  v89.save();
  v89.shadowColor = "rgba(255, 200, 50, 0.8)";
  v89.shadowBlur = 40;
  const v95 = v89.createLinearGradient(v93 - 100, v94 - 50, v93 + 100, v94 + 50);
  v95.addColorStop(0, "#FFFF00");
  v95.addColorStop(0.3, '#FFD700');
  v95.addColorStop(0.7, "#FF8C00");
  v95.addColorStop(1, "#FF4500");
  v89.font = "bold 70px \"Arial\"";
  v89.textAlign = "center";
  v89.textBaseline = "middle";
  v89.fillStyle = v95;
  v89.fillText(v90.toUpperCase(), v93, v94);
  v89.shadowColor = "transparent";
  v89.fillStyle = "rgba(255, 255, 200, 0.8)";
  v89.fillText(v90.toUpperCase(), v93, v94);
  v89.strokeStyle = "rgba(255, 255, 255, 0.9)";
  v89.lineWidth = 2;
  v89.strokeText(v90.toUpperCase(), v93, v94);
  addTextSolarEnergy(v89, v90, v93, v94);
  v89.restore();
}
function addTextSolarEnergy(v96, v97, v98, v99) {
  v96.save();
  v96.globalCompositeOperation = "screen";
  const v100 = v96.measureText(v97.toUpperCase());
  const v101 = v100.width;
  for (let v102 = 0; v102 < 25; v102++) {
    const v103 = v98 - v101 / 2 + Math.random() * v101;
    const v104 = v99 - 35 + Math.random() * 70;
    const v105 = 1 + Math.random() * 4;
    const v106 = Math.random() * Math.PI * 2;
    const v107 = 5 + Math.random() * 15;
    v96.strokeStyle = "rgba(255, 255, 200, " + (0.5 + Math.random() * 0.4) + ')';
    v96.lineWidth = v105;
    v96.lineCap = "round";
    v96.beginPath();
    v96.moveTo(v103, v104);
    v96.lineTo(v103 + Math.cos(v106) * v107, v104 + Math.sin(v106) * v107);
    v96.stroke();
  }
  v96.restore();
}
function addLensFlare(v108, v109, v110, v111) {
  v108.save();
  v108.globalCompositeOperation = "screen";
  v108.globalAlpha = 0.3;
  const v112 = v108.createRadialGradient(v109 - v111 * 0.5, v110 - v111 * 0.5, 0, v109, v110, v111 * 4);
  v112.addColorStop(0, "rgba(255, 255, 200, 0.8)");
  v112.addColorStop(0.3, "rgba(255, 200, 100, 0.5)");
  v112.addColorStop(1, 'transparent');
  v108.fillStyle = v112;
  v108.beginPath();
  v108.arc(v109, v110, v111 * 4, 0, Math.PI * 2);
  v108.fill();
  for (let v113 = 0; v113 < 3; v113++) {
    const v114 = v113 / 3 * Math.PI * 2;
    const v115 = v111 * 2;
    const v116 = v109 + Math.cos(v114) * v115;
    const v117 = v110 + Math.sin(v114) * v115;
    const v118 = v111 * (0.5 + Math.random() * 0.5);
    const v119 = v108.createRadialGradient(v116, v117, 0, v116, v117, v118);
    v119.addColorStop(0, "rgba(255, 255, 200, 0.6)");
    v119.addColorStop(1, "transparent");
    v108.fillStyle = v119;
    v108.beginPath();
    v108.arc(v116, v117, v118, 0, Math.PI * 2);
    v108.fill();
  }
  v108.restore();
}
function addHeatHaze(v120, v121, v122) {
  v120.save();
  v120.globalAlpha = 0.1;
  for (let v123 = v122 * 0.3; v123 < v122 * 0.8; v123 += 10) {
    v120.strokeStyle = "rgba(255, 200, 100, " + (0.2 + Math.random() * 0.3) + ')';
    v120.lineWidth = 1;
    v120.beginPath();
    for (let v124 = 0; v124 <= v121; v124 += 5) {
      const v125 = v123 + Math.sin(v124 * 0.02 + v123 * 0.01) * 3;
      if (v124 === 0) {
        v120.moveTo(v124, v125);
      } else {
        v120.lineTo(v124, v125);
      }
    }
    v120.stroke();
  }
  v120.restore();
}
function addSolarParticles(v126, v127, v128) {
  v126.save();
  v126.globalCompositeOperation = 'screen';
  for (let v129 = 0; v129 < 60; v129++) {
    const v130 = Math.random() * v127;
    const v131 = Math.random() * v128;
    const v132 = 1 + Math.random() * 5;
    const v133 = 0.6 + Math.random() * 0.4;
    v126.fillStyle = "rgba(255, 255, 200, " + v133 + ')';
    v126.beginPath();
    v126.arc(v130, v131, v132, 0, Math.PI * 2);
    v126.fill();
    v126.fillStyle = "rgba(255, 200, 100, " + v133 * 0.3 + ')';
    v126.beginPath();
    v126.arc(v130, v131, v132 * 2, 0, Math.PI * 2);
    v126.fill();
  }
  v126.restore();
}
function addSunSparkles(v134, v135, v136) {
  v134.save();
  v134.globalCompositeOperation = "screen";
  for (let v137 = 0; v137 < 30; v137++) {
    const v138 = Math.random() * v135;
    const v139 = Math.random() * v136;
    const v140 = 1 + Math.random() * 3;
    v134.fillStyle = "rgba(255, 255, 255, 0.9)";
    v134.beginPath();
    v134.arc(v138, v139, v140, 0, Math.PI * 2);
    v134.fill();
    for (let v141 = 0; v141 < 4; v141++) {
      const v142 = v141 / 4 * Math.PI * 2;
      const v143 = v140 * 4;
      v134.strokeStyle = "rgba(255, 255, 200, 0.7)";
      v134.lineWidth = 1;
      v134.lineCap = "round";
      v134.beginPath();
      v134.moveTo(v138, v139);
      v134.lineTo(v138 + Math.cos(v142) * v143, v139 + Math.sin(v142) * v143);
      v134.stroke();
    }
  }
  v134.restore();
}
function drawSolarBorder(v144, v145, v146) {
  v144.save();
  const v147 = v144.createLinearGradient(0, 0, v145, 0);
  v147.addColorStop(0, "#FFFF00");
  v147.addColorStop(0.3, '#FFD700');
  v147.addColorStop(0.7, "#FF8C00");
  v147.addColorStop(1, "#FF4500");
  v144.strokeStyle = v147;
  v144.lineWidth = 8;
  v144.shadowColor = "rgba(255, 200, 50, 0.8)";
  v144.shadowBlur = 25;
  v144.strokeRect(10, 10, v145 - 20, v146 - 20);
  v144.strokeStyle = "rgba(255, 255, 200, 0.6)";
  v144.lineWidth = 3;
  v144.shadowBlur = 15;
  v144.strokeRect(20, 20, v145 - 40, v146 - 40);
  addCornerSunSymbols(v144, v145, v146);
  v144.restore();
}
function addCornerSunSymbols(v148, v149, v150) {
  v148.save();
  v148.globalAlpha = 0.7;
  const v151 = [{
    'x': 0x1e,
    'y': 0x1e
  }, {
    'x': v149 - 30,
    'y': 0x1e
  }, {
    'x': 0x1e,
    'y': v150 - 30
  }, {
    'x': v149 - 30,
    'y': v150 - 30
  }];
  v151.forEach(v152 => {
    v148.fillStyle = "#FFD700";
    v148.beginPath();
    v148.arc(v152.x, v152.y, 8, 0, Math.PI * 2);
    v148.fill();
    for (let v153 = 0; v153 < 8; v153++) {
      const v154 = v153 / 8 * Math.PI * 2;
      v148.strokeStyle = "#FFD700";
      v148.lineWidth = 2;
      v148.lineCap = "round";
      v148.beginPath();
      v148.moveTo(v152.x, v152.y);
      v148.lineTo(v152.x + Math.cos(v154) * 12, v152.y + Math.sin(v154) * 12);
      v148.stroke();
    }
  });
  v148.restore();
}
function addSunSignature(v155, v156, v157) {
  v155.save();
  const v158 = v156 - 110;
  const v159 = v157 - 25;
  v155.font = "italic 14px \"Arial\"";
  v155.fillStyle = "rgba(255, 255, 200, 0.9)";
  v155.textAlign = "right";
  v155.textBaseline = "bottom";
  v155.shadowColor = "rgba(255, 200, 50, 0.6)";
  v155.shadowBlur = 15;
  v155.fillText("by " + (config.botName || 'JuneX-Ultra'), v158, v159);
  v155.fillStyle = "#FFD700";
  v155.beginPath();
  v155.arc(v158 + 5, v159 - 8, 4, 0, Math.PI * 2);
  v155.fill();
  for (let v160 = 0; v160 < 4; v160++) {
    const v161 = v160 / 4 * Math.PI * 2;
    v155.strokeStyle = "#FFD700";
    v155.lineWidth = 1;
    v155.lineCap = "round";
    v155.beginPath();
    v155.moveTo(v158 + 5, v159 - 8);
    v155.lineTo(v158 + 5 + Math.cos(v161) * 6, v159 - 8 + Math.sin(v161) * 6);
    v155.stroke();
  }
  v155.restore();
}
